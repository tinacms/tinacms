import { Button } from '@tinacms/ui/components/button';
import { Label } from '@tinacms/ui/components/label';
import { use, useState } from 'react';
import { toFieldAddress } from '../core/field/address';
import type { FieldSchema } from '../core/schema/types';
import { FormScopeContext } from '../editor/context';
import { Field } from '../editor/field';
import {
  useDiscardEdits,
  useFieldRegistry,
  useFormId,
  useFormSave,
} from '../editor/hooks';
import { useIsFieldDirty, useIsFormDirty } from '../form/form-store';
import { DocumentStatus } from './document-status';

function FieldRow({ node }: { node: FieldSchema }) {
  const name = node.name;
  const dirty = useIsFieldDirty(useFormId(), toFieldAddress(name));
  const labelable =
    useFieldRegistry().get(node.type)?.metadata?.labelable !== false;
  return (
    <div className='mb-4 min-w-0'>
      <Label
        className='mb-1'
        id={`${name}-label`}
        htmlFor={labelable ? name : undefined}
      >
        {node.label ?? name}
        {dirty ? (
          <>
            <span
              aria-hidden='true'
              className='size-1.5 rounded-full bg-primary'
            />
            <span className='sr-only'>(unsaved)</span>
          </>
        ) : null}
      </Label>
      <Field address={name} />
    </div>
  );
}

function SaveButton() {
  const dirty = useIsFormDirty(useFormId());
  const save = useFormSave();
  const [failure, setFailure] = useState<string | null>(null);
  return (
    <div className='flex flex-col items-start gap-2'>
      <Button
        type='button'
        className='aria-disabled:pointer-events-none aria-disabled:opacity-50'
        aria-disabled={!dirty}
        onClick={() => {
          if (!dirty) return;
          setFailure(null);
          save().catch((cause) => {
            console.error('[tinacms] Save failed:', cause);
            setFailure(
              cause instanceof Error && cause.message
                ? cause.message
                : 'Save failed.'
            );
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
      variant='outline'
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
      {scope.collection.fields.map((node) => (
        <FieldRow key={node.name} node={node} />
      ))}
      <div className='flex items-start gap-2'>
        <SaveButton />
        <DiscardButton />
      </div>
    </>
  );
}
