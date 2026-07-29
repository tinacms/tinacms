// The editing pane. It holds the fields of the open document, and the save. Component
// resolution renders each field (ADR-009). <Field> finds the plugin from the `type` of
// the schema node, so this file never learns what a rich-text field is.
//
// It does not own the form scope. DocumentScope owns it, above the whole layout, because
// the preview needs the same scope and sits outside this pane.

import { Button } from '@tinacms/ui/components/button';
import { Label } from '@tinacms/ui/components/label';
import { use, useState } from 'react';
import { toFieldAddress } from '../core/field/address';
import type { FieldSchema } from '../core/schema/types';
import { FormScopeContext } from '../editor/context';
import { Field } from '../editor/field';
import { useFieldRegistry, useFormId, useFormSave } from '../editor/hooks';
import { useIsFieldDirty, useIsFormDirty } from '../form/form-store';
import { DocumentStatus } from './document-status';

// The shell owns this label, and the field plugin does not. A plugin renders FieldWrapper
// with no label, because its control carries an aria-label of the field address. That
// left the visible text and the accessible name as two different strings, which is WCAG
// 2.5.3 Label in Name wherever a collection's `label` differs from its `name`, and a
// label that focused nothing when clicked. `htmlFor` ties them together, and each control
// now carries its address as an id, which settles the focus half.
//
// The accessible name is not settled. The string, number and boolean controls still set
// `aria-label` to the address, and that outranks this label, so Label in Name closes when
// those fields drop it.
//
// The dirty mark reads as text. An aria-label on a bare span is ignored on a generic
// element, so the 6px dot was the only signal it gave.
function FieldRow({ node }: { node: FieldSchema }) {
  const name = node.name;
  const dirty = useIsFieldDirty(useFormId(), toFieldAddress(name));
  // Rich text is the case this asks about: its control is a contenteditable, which HTML
  // cannot label, so `for` would point at nothing.
  const labelable =
    useFieldRegistry().get(node.type)?.metadata?.labelable !== false;
  return (
    <div className='mb-4 min-w-0'>
      <Label className='mb-1' htmlFor={labelable ? name : undefined}>
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
  // A write can fail, and the form stays dirty when it does, so the edit is still there
  // to retry. Without this the rejection went unhandled and the only signal the author
  // got was the badge staying "Unsaved", which is also what a save in flight looks like.
  const [failure, setFailure] = useState<string | null>(null);
  return (
    <div className='flex flex-col items-start gap-2'>
      {/* aria-disabled, and not disabled. `disabled` takes the button out of the tab
          order at the moment it is pressed, so keyboard focus fell to <body> after
          every save. */}
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

export function DocumentForm() {
  // This reads the scope, and does not require it. The pane sits in a layout that also
  // renders with no open document. An empty pane is a state, and not a fault.
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
      <SaveButton />
    </>
  );
}
