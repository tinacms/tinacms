import { FormBuilder, FormStatus } from '@toolkit/form-builder';
import type { Form } from '@toolkit/forms';
import type { FormMetaPlugin } from '@toolkit/plugin-form-meta';
import { useCMS } from '@toolkit/react-core';
import * as React from 'react';
import { BiDotsVertical, BiHomeAlt } from 'react-icons/bi';
import { FormLists } from './form-list';
import { SidebarContext } from './sidebar';
import { SidebarLoadingPlaceholder } from './sidebar-loading-placeholder';
import { SidebarNoFormsPlaceholder } from './sidebar-no-forms-placeholder';

// this is the minimum time to show the loading indicator (in milliseconds)
// this is to prevent the loading indicator from flashing or the 'no forms' placeholder from showing pre-maturely
const minimumTimeToShowLoadingIndicator = 1000;

export interface FormsViewProps {
  loadingPlaceholder?: React.FC;
}

export const FormsView = ({ loadingPlaceholder }: FormsViewProps = {}) => {
  const cms = useCMS();
  const { setFormIsPristine } = React.useContext(SidebarContext);
  const [isShowingLoading, setIsShowingLoading] = React.useState(true); // Default to showing loading
  const [initialLoadComplete, setInitialLoadComplete] = React.useState(false);

  // Handle loading state with minimum display time
  React.useEffect(() => {
    // Always start with loading state
    if (cms.state.isLoadingContent) {
      setIsShowingLoading(true);

      // Even if loading completes quickly, show the placeholder for a minimum time
      const timer = setTimeout(() => {
        if (!cms.state.isLoadingContent) {
          setIsShowingLoading(false);
          setInitialLoadComplete(true);
        }
      }, minimumTimeToShowLoadingIndicator);

      return () => clearTimeout(timer);
    } else {
      // If not loading anymore, check if we need to maintain the placeholder
      const timer = setTimeout(() => {
        setIsShowingLoading(false);
        setInitialLoadComplete(true);
      }, minimumTimeToShowLoadingIndicator);

      return () => clearTimeout(timer);
    }
  }, [cms.state.isLoadingContent]);

  if (isShowingLoading || !initialLoadComplete) {
    // Loading - show when explicitly loading or during initial render
    const LoadingPlaceholder = loadingPlaceholder || SidebarLoadingPlaceholder;
    return <LoadingPlaceholder />;
  }

  if (!cms.state.formLists.length) {
    // No Forms
    return <SidebarNoFormsPlaceholder />;
  }
  const isMultiform = cms.state.forms.length > 1;
  const activeForm = cms.state.forms.find(
    ({ tinaForm }) => tinaForm.id === cms.state.activeFormId
  );
  const isEditing = !!activeForm;
  if (isMultiform && !activeForm) {
    return <FormLists isEditing={isEditing} />;
  }
  const formMetas = cms.plugins.all<FormMetaPlugin>('form:meta');
  return (
    <>
      {activeForm && (
        <FormWrapper isEditing={isEditing} isMultiform={isMultiform}>
          {isMultiform && <MultiformFormHeader activeForm={activeForm} />}
          {!isMultiform && <FormHeader activeForm={activeForm} />}
          {formMetas?.map((meta) => (
            <React.Fragment key={meta.name}>
              <meta.Component />
            </React.Fragment>
          ))}
          <FormBuilder form={activeForm} onPristineChange={setFormIsPristine} />
        </FormWrapper>
      )}
    </>
  );
};

interface FormWrapperProps {
  isEditing: boolean;
  isMultiform: boolean;
  children: React.ReactNode;
}

const FormWrapper: React.FC<FormWrapperProps> = ({ isEditing, children }) => {
  return (
    <div
      className='flex-1 flex flex-col flex-nowrap overflow-hidden h-full w-full relative bg-white'
      style={
        isEditing
          ? {
              transform: 'none',
              animationName: 'fly-in-left',
              animationDuration: '150ms',
              animationDelay: '0',
              animationIterationCount: 1,
              animationTimingFunction: 'ease-out',
            }
          : {
              transform: 'translate3d(100%, 0, 0)',
            }
      }
    >
      {children}
    </div>
  );
};

export interface MultiformFormHeaderProps {
  activeForm: { activeFieldName?: string; tinaForm: Form };
}

export const MultiformFormHeader = ({
  activeForm,
}: MultiformFormHeaderProps) => {
  const cms = useCMS();
  const { formIsPristine } = React.useContext(SidebarContext);

  return (
    <div
      className={
        'pt-4 pb-4 border-b border-gray-200 bg-gradient-to-t from-white to-gray-50'
      }
    >
      <div className='px-6 flex gap-2 justify-between items-center'>
        <button
          type='button'
          className='pointer-events-auto text-xs text-blue-400 hover:text-blue-500 hover:underline transition-all ease-out duration-150'
          onClick={() => {
            const state = activeForm.tinaForm.finalForm.getState();
            if (state.invalid === true) {
              cms.alerts.error('Cannot navigate away from an invalid form.');
            } else {
              cms.dispatch({ type: 'forms:set-active-form-id', value: null });
            }
          }}
        >
          <BiDotsVertical className='h-auto w-5 inline-block opacity-70' />
        </button>
        <button
          type='button'
          className='pointer-events-auto text-xs text-blue-400 hover:text-blue-500 hover:underline transition-all ease-out duration-150'
          onClick={() => {
            const collectionName = cms.api.tina.schema.getCollectionByFullPath(
              cms.state.activeFormId
            ).name;

            window.location.href = `${
              new URL(window.location.href).pathname
            }#/collections/${collectionName}/~`;
          }}
        >
          <BiHomeAlt className='h-auto w-5 inline-block opacity-70' />
        </button>

        <span className='opacity-30 text-sm leading-tight whitespace-nowrap flex-0'>
          /
        </span>
        <span className='block w-full text-sm leading-tight whitespace-nowrap truncate'>
          {activeForm.tinaForm.label || activeForm.tinaForm.id}
        </span>
        <FormStatus pristine={formIsPristine} />
      </div>
    </div>
  );
};

export interface FormHeaderProps {
  activeForm: { activeFieldName?: string; tinaForm: Form };
}

export const FormHeader = ({ activeForm }: FormHeaderProps) => {
  const { formIsPristine } = React.useContext(SidebarContext);
  const cms = useCMS();

  const shortFormLabel = activeForm.tinaForm.label
    ? activeForm.tinaForm.label.replace(/^.*[\\\/]/, '')
    : false;

  return (
    <div
      className={
        'pt-4 pb-4 border-b border-gray-200 bg-gradient-to-t from-white to-gray-50'
      }
    >
      <div className='px-6 flex gap-2 justify-between items-center'>
        <button
          type='button'
          className='pointer-events-auto text-xs text-blue-400 hover:text-blue-500 hover:underline transition-all ease-out duration-150'
          onClick={() => {
            const collectionName = cms.api.tina.schema.getCollectionByFullPath(
              cms.state.activeFormId
            ).name;
            window.location.href = `${
              new URL(window.location.href).pathname
            }#/collections/${collectionName}/~`;
          }}
        >
          <BiHomeAlt className='h-auto w-5 inline-block opacity-70' />
        </button>
        {shortFormLabel && (
          <span className='block w-full text-sm leading-tight whitespace-nowrap truncate'>
            {shortFormLabel}
          </span>
        )}

        <FormStatus pristine={formIsPristine} />
      </div>
    </div>
  );
};
