import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@tinacms/ui/components/alert-dialog';
import { Button } from '@tinacms/ui/components/button';
import { FormLevel } from '@tinacms/ui/components/form-level';
import {
  type ReactNode,
  use,
  useEffect,
  useEffectEvent,
  useState,
} from 'react';
import { useFormContext } from 'react-hook-form';
import { useStore } from 'zustand';
import { type FormScope, FormScopeContext } from '../editor/context';
import { Field, FieldNode } from '../editor/field';
import {
  fieldsAlong,
  holdsRevealedError,
  levelsFor,
  type OpenLevel,
} from '../editor/form-view-state';
import {
  useDiscardEdits,
  useFieldRegistry,
  useFormId,
  useFormSave,
  useSaveFailure,
  useStaleDraft,
} from '../editor/hooks';
import {
  useFormErrors,
  useFormStore,
  useIsFormDirty,
} from '../form/form-store';
import { DocumentStatus } from './document-status';

function SaveButton() {
  const formId = useFormId();
  const dirty = useIsFormDirty(formId);
  const save = useFormSave();
  const [failure, setFailure] = useSaveFailure();
  const errorCount = Object.keys(useFormErrors(formId)).length;
  const [pending, setPending] = useState(false);
  return (
    <div className='flex flex-col items-start gap-2'>
      <Button
        variant='primary'
        type='button'
        disabled={!dirty && !pending}
        busy={pending}
        count={errorCount}
        srLabel={`, ${errorCount} ${errorCount === 1 ? 'error' : 'errors'}`}
        onClick={() => {
          setFailure(null);
          setPending(true);
          save()
            .catch((cause) => {
              console.error('[tinacms] Save failed:', cause);
              if (cause instanceof Error && cause.message) {
                setFailure(cause.message);
              } else {
                setFailure('Save failed.');
              }
            })
            .finally(() => setPending(false));
        }}
      >
        Save
      </Button>
      {failure ? (
        <p role='alert' className='text-sm text-destructive'>
          {failure}
        </p>
      ) : null}
    </div>
  );
}

function DiscardButton() {
  const dirty = useIsFormDirty(useFormId());
  const discard = useDiscardEdits();
  return (
    <Button
      type='button'
      variant='destructive'
      disabled={!dirty}
      onClick={discard}
    >
      Discard
    </Button>
  );
}

// A modal, so no keystroke can overwrite the stored draft before the editor
// decides what happens to it.
function StaleDraftDialog() {
  const stale = useStaleDraft();
  return (
    <AlertDialog open={stale !== null}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Resume your unsaved edits?</AlertDialogTitle>
          <AlertDialogDescription>
            This document changed after you made these edits. Resume them on top
            of the current version, or discard them.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button type='button' variant='destructive' onClick={stale?.discard}>
            Discard draft
          </Button>
          <Button variant='primary' type='button' onClick={stale?.resume}>
            Resume edits
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ActiveFieldLevels({ scope }: { scope: FormScope }) {
  const registry = useFieldRegistry();
  const { getValues } = useFormContext();
  const active = useFormStore((state) => state.active);
  const showLevelsFor = useEffectEvent((address: string) => {
    const { view, collection } = scope;
    const { openLevels } = view.getState();
    const levels = levelsFor(
      address,
      collection.fields,
      (path) => getValues(path),
      (node) => registry.get(node.type)?.metadata?.drillable === true
    );
    const top = openLevels.at(-1)?.address;
    const sameLevels =
      levels.length === openLevels.length &&
      levels.every(
        (level, index) => level.address === openLevels[index]?.address
      );
    if (sameLevels || top === address || top?.startsWith(`${address}.`)) return;
    view.getState().showLevels(levels);
  });
  useEffect(() => {
    if (active && active.formId === scope.formId) showLevelsFor(active.address);
  }, [active, scope.formId]);
  return null;
}

// Reads the whole view and every error for the trail. `children` keeps its
// element identity, so a re-render here does not reach the fields.
function OpenLevelFrame({
  scope,
  current,
  children,
}: {
  scope: FormScope;
  current: OpenLevel;
  children: ReactNode;
}) {
  const errors = useFormErrors(useFormId());
  const { getValues } = useFormContext();
  const view = useStore(scope.view);
  const { collection, path } = scope;
  const { closeLevelsAbove } = scope.view.getState();

  const errorAddresses = Object.keys(errors);
  const steps = [
    {
      label: path.split('/').at(-1) ?? path,
      onClick: () => closeLevelsAbove(0),
      invalid: holdsRevealedError(view, errorAddresses),
    },
    ...fieldsAlong(current.address, collection.fields, getValues).map(
      (step) => {
        const keep = view.openLevels.filter(
          (level) =>
            level.address === step.address ||
            step.address.startsWith(`${level.address}.`)
        ).length;
        return {
          label: step.label,
          onClick: () => closeLevelsAbove(keep),
          invalid: holdsRevealedError(view, errorAddresses, step.address),
        };
      }
    ),
  ];
  return (
    <FormLevel steps={steps} onUp={steps.at(-2)?.onClick}>
      {children}
    </FormLevel>
  );
}

function FormFields({ scope }: { scope: FormScope }) {
  const current = useStore(scope.view, (state) => state.openLevels.at(-1));
  if (!current) {
    return (
      <FormLevel>
        {scope.collection.fields.map((node) => (
          <Field key={node.name} address={node.name} />
        ))}
      </FormLevel>
    );
  }
  return (
    <OpenLevelFrame scope={scope} current={current}>
      <FieldNode address={current.address} node={current.node} />
    </OpenLevelFrame>
  );
}

export function DocumentForm() {
  const scope = use(FormScopeContext);
  if (!scope) return null;

  return (
    <>
      <header className='mb-4 flex items-center justify-between gap-2'>
        <h2 className='truncate text-sm font-semibold' title={scope.path}>
          {scope.path.split('/').at(-1)}
        </h2>
        <DocumentStatus />
      </header>
      <StaleDraftDialog />
      <ActiveFieldLevels scope={scope} />
      <FormFields scope={scope} />
      <div className='flex items-start gap-2'>
        <SaveButton />
        <DiscardButton />
      </div>
    </>
  );
}
