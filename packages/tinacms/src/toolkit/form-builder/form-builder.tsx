import type { Form } from '@toolkit/forms';
import * as React from 'react';
import { type FC, useEffect } from 'react';
import { Form as FinalForm } from 'react-final-form';
import { useBranchData } from '@toolkit/plugin-branch-switcher';
import { Button, OverflowMenu } from '@toolkit/styles';
import {
  DragDropContext,
  type DropResult,
} from '../fields/plugins/dnd-kit-wrapper';
import { AiOutlineLoading } from 'react-icons/ai';
import { BiError, BiGitBranch } from 'react-icons/bi';
import { FaCircle } from 'react-icons/fa';
import { cn } from '../../utils/cn';
import { useCMS } from '../react-core';
import { FieldsBuilder } from './fields-builder';
import { FormActionMenu } from './form-actions';
import { FormPortalProvider } from './form-portal';
import { LoadingDots } from './loading-dots';
import { ResetForm } from './reset-form';
import { CreateBranchModal } from './create-branch-modal';

export interface FormBuilderProps {
  form: {
    tinaForm: Form;
    activeFieldName?: string;
    hoveringFieldName?: string;
  };
  hideFooter?: boolean;
  label?: string;
  onPristineChange?: (_pristine: boolean) => unknown;
}

interface FormKeyBindingsProps {
  onSubmit: () => void;
}

const NoFieldsPlaceholder = () => (
  <div
    className='relative flex flex-col items-center justify-center text-center p-5 pb-16 w-full h-full overflow-y-auto'
    style={{
      animationName: 'fade-in',
      animationDelay: '300ms',
      animationTimingFunction: 'ease-out',
      animationIterationCount: 1,
      animationFillMode: 'both',
      animationDuration: '150ms',
    }}
  >
    <Emoji className='block pb-5'>🤔</Emoji>
    <h3 className='font-sans font-normal text-lg block pb-5'>
      Hey, you don't have any fields added to this form.
    </h3>
    <p className='block pb-5'>
      <a
        className='text-center rounded-3xl border border-solid border-gray-100 shadow-[0_2px_3px_rgba(0,0,0,0.12)] font-normal cursor-pointer text-[12px] transition-all duration-100 ease-out bg-white text-gray-700 py-3 pr-5 pl-14 relative no-underline inline-block hover:text-blue-500'
        href='https://tinacms.org/docs/fields'
        target='_blank'
        rel='noopener noreferrer'
      >
        <Emoji
          className='absolute left-5 top-1/2 origin-center -translate-y-1/2 transition-all duration-100 ease-out'
          style={{ fontSize: 24 }}
        >
          📖
        </Emoji>{' '}
        Field Setup Guide
      </a>
    </p>
  </div>
);

const FormKeyBindings: FC<FormKeyBindingsProps> = ({ onSubmit }) => {
  // Submit when cmd/ctrl + s is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        onSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSubmit]);

  return null;
};

export const FormBuilder: FC<FormBuilderProps> = ({
  form,
  onPristineChange,
  ...rest
}) => {
  const cms = useCMS();
  const hideFooter = !!rest.hideFooter;
  const [createBranchModalOpen, setCreateBranchModalOpen] =
    React.useState(false);

  const tinaForm = form.tinaForm;
  const finalForm = form.tinaForm.finalForm;

  React.useEffect(() => {
    const collection = cms.api.tina.schema.getCollectionByFullPath(
      tinaForm.path
    );
    if (collection?.ui?.beforeSubmit) {
      tinaForm.beforeSubmit = (values: any) =>
        collection.ui.beforeSubmit({ cms, form: tinaForm, values });
    } else {
      tinaForm.beforeSubmit = undefined;
    }
  }, [tinaForm.path]);

  const moveArrayItem = React.useCallback(
    (result: DropResult) => {
      if (!result.destination || !finalForm) return;
      const name = result.type;
      finalForm.mutators.move(
        name,
        result.source.index,
        result.destination.index
      );
    },
    [tinaForm]
  );

  /**
   * Prevent navigation away from the window when the form is dirty
   */
  React.useEffect(() => {
    // const onBeforeUnload = (event) => {
    //   event.preventDefault()
    //   event.returnValue = ''
    // }

    const unsubscribe = finalForm.subscribe(
      ({ pristine }) => {
        if (onPristineChange) {
          onPristineChange(pristine);
        }

        // if (!pristine) {
        //   window.addEventListener('beforeunload', onBeforeUnload)
        // } else {
        //   window.removeEventListener('beforeunload', onBeforeUnload)
        // }
      },
      { pristine: true }
    );
    return () => {
      // window.removeEventListener('beforeunload', onBeforeUnload)
      unsubscribe();
    };
  }, [finalForm]);

  const fieldGroup = tinaForm.getActiveField(form.activeFieldName);

  return (
    <FinalForm
      key={tinaForm.id}
      form={tinaForm.finalForm}
      onSubmit={tinaForm.onSubmit}
    >
      {({
        handleSubmit,
        pristine,
        invalid,
        submitting,
        dirtySinceLastSubmit,
        hasValidationErrors,
      }) => {
        const usingProtectedBranch = cms.api.tina.usingProtectedBranch();

        const canSubmit =
          !pristine &&
          !submitting &&
          !hasValidationErrors &&
          !(invalid && !dirtySinceLastSubmit);

        const safeSubmit = async () => {
          if (canSubmit) {
            await handleSubmit();
          }
        };

        const safeHandleSubmit = async () => {
          if (usingProtectedBranch) {
            setCreateBranchModalOpen(true);
          } else {
            safeSubmit();
          }
        };

        return (
          <>
            {createBranchModalOpen && (
              <CreateBranchModal
                safeSubmit={safeSubmit}
                crudType={tinaForm.crudType}
                path={tinaForm.path}
                values={tinaForm.values}
                close={() => setCreateBranchModalOpen(false)}
              />
            )}
            <DragDropContext onDragEnd={moveArrayItem}>
              <FormKeyBindings onSubmit={safeHandleSubmit} />
              <FormPortalProvider>
                <FormWrapper id={tinaForm.id}>
                  {tinaForm?.fields.length ? (
                    <FieldsBuilder
                      form={tinaForm}
                      activeFieldName={form.activeFieldName}
                      hoveringFieldName={form.hoveringFieldName}
                      fields={fieldGroup.fields}
                    />
                  ) : (
                    <NoFieldsPlaceholder />
                  )}
                </FormWrapper>
              </FormPortalProvider>
              {!hideFooter && (
                <div className='relative flex-none w-full h-16 px-6 bg-white border-t border-gray-100 flex items-center justify-end'>
                  <div className='flex-1 w-full justify-end gap-2	flex items-center max-w-form'>
                    {tinaForm.reset && (
                      <ResetForm
                        pristine={pristine}
                        reset={async () => {
                          finalForm.reset();
                          await tinaForm.reset!();
                        }}
                      >
                        {tinaForm.buttons.reset}
                      </ResetForm>
                    )}
                    <Button
                      onClick={safeHandleSubmit}
                      disabled={!canSubmit}
                      busy={submitting}
                      variant='primary'
                    >
                      {submitting && <LoadingDots />}
                      {!submitting && tinaForm.buttons.save}
                    </Button>
                    {tinaForm.actions.length > 0 && (
                      <FormActionMenu
                        form={tinaForm as any}
                        actions={tinaForm.actions}
                      />
                    )}
                  </div>
                </div>
              )}
            </DragDropContext>
          </>
        );
      }}
    </FinalForm>
  );
};

export const FormStatus = ({ pristine }: { pristine: boolean }) => {
  const pristineClass = pristine ? 'text-green-500' : 'text-red-500';
  return <FaCircle className={cn('h-3', pristineClass)} />;
};

export const FormWrapper = ({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      data-test={`form:${id?.replace(/\\/g, '/')}`}
      className='h-full overflow-y-auto max-h-full bg-gray-50 @container'
    >
      <div className='py-5 px-4'>{children}</div>
    </div>
  );
};

const Emoji = ({ className = '', ...props }) => (
  <span
    className={`text-[40px] leading-none inline-block ${className}`}
    {...props}
  />
);

/**
 * @deprecated
 * Original misspelt version of CreateBranchModal
 */
export const CreateBranchModel = ({
  close,
  safeSubmit,
  relativePath,
  values,
  crudType,
}: {
  safeSubmit: () => Promise<void>;
  close: () => void;
  relativePath: string;
  values: Record<string, unknown>;
  crudType: string;
}) => (
  <CreateBranchModal
    close={close}
    safeSubmit={safeSubmit}
    path={relativePath}
    values={values}
    crudType={crudType}
  />
);
