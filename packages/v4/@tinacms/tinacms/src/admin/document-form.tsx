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
import { use, useEffect, useEffectEvent } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormScopeContext } from '../editor/context';
import { Field, FieldNode } from '../editor/field';
import { holdsRevealedError, levelsFor } from '../editor/form-view-state';
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
  const canSave = dirty;
  return (
    <div className='flex flex-col items-start gap-2'>
      <Button
        variant='primary'
        type='button'
        className='aria-disabled:pointer-events-none aria-disabled:opacity-50'
        aria-disabled={!canSave}
        onClick={() => {
          if (!canSave) return;
          setFailure(null);
          save().catch((cause) => {
            console.error('[tinacms] Save failed:', cause);
            if (cause instanceof Error && cause.message) {
              setFailure(cause.message);
            } else {
              setFailure('Save failed.');
            }
          });
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
      variant='secondary'
      className='aria-disabled:pointer-events-none aria-disabled:opacity-50'
      aria-disabled={!dirty}
      onClick={() => {
        if (!dirty) return;
        discard();
      }}
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
          <Button type='button' variant='secondary' onClick={stale?.discard}>
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

function useOpenLevelsForActiveField() {
  const scope = use(FormScopeContext);
  const registry = useFieldRegistry();
  const { getValues } = useFormContext();
  const active = useFormStore((state) => state.active);
  const showLevelsFor = useEffectEvent((address: string) => {
    if (!scope) return;
    const { view, collection } = scope;
    const levels = levelsFor(
      address,
      collection.fields,
      (path) => getValues(path),
      (node) => registry.get(node.type)?.metadata?.drillable === true
    );
    const top = view.openLevels.at(-1)?.address;
    const sameLevels =
      levels.length === view.openLevels.length &&
      levels.every(
        (level, index) => level.address === view.openLevels[index]?.address
      );
    if (sameLevels || top === address || top?.startsWith(`${address}.`)) return;
    view.showLevels(levels);
  });
  useEffect(() => {
    if (active && active.formId === scope?.formId)
      showLevelsFor(active.address);
  }, [active, scope?.formId]);
}

function FormFields() {
  const scope = use(FormScopeContext);
  const errors = useFormErrors(useFormId());
  useOpenLevelsForActiveField();
  if (!scope) return null;
  const { view, collection, path } = scope;

  if (view.openLevels.length === 0) {
    return (
      <FormLevel>
        {collection.fields.map((node) => (
          <Field key={node.name} address={node.name} />
        ))}
      </FormLevel>
    );
  }

  const errorAddresses = Object.keys(errors);
  const open = view.openLevels;
  const steps = [
    {
      label: path.split('/').at(-1) ?? path,
      onClick: () => view.closeLevelsAbove(0),
      invalid: holdsRevealedError(view, errorAddresses),
    },
    ...open.map((level, index) => ({
      label: level.label,
      onClick: () => view.closeLevelsAbove(index + 1),
      invalid: holdsRevealedError(view, errorAddresses, level.address),
    })),
  ];
  const current = open[open.length - 1];
  return (
    <FormLevel
      steps={steps}
      onUp={() => view.closeLevelsAbove(open.length - 1)}
    >
      <FieldNode address={current.address} node={current.node} />
    </FormLevel>
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
      <FormFields />
      <div className='flex items-start gap-2'>
        <SaveButton />
        <DiscardButton />
      </div>
    </>
  );
}
