import { use } from 'react';
import { useStore } from 'zustand';
import { toFieldAddress } from '../core/field/address';
import { FormScopeContext, type FormScope } from '../editor/context';
import { Field, FieldNode } from '../editor/field';

/**
 * Renders each field of the open collection, or the open form level when a list
 * item opened as one. A field draws its own label, so a unit test of a field or of
 * the editor uses this instead of `admin/document-form`, which would make a lower
 * layer import the admin shell.
 *
 * `admin/field-labels.test.tsx` covers the real composition.
 */
export function LabelledFields() {
  const scope = use(FormScopeContext);
  if (!scope) return null;
  return <Levelled scope={scope} />;
}

function Levelled({ scope }: { scope: FormScope }) {
  const current = useStore(scope.view, (state) => state.openLevels.at(-1));
  if (current) {
    return (
      <>
        <button
          type='button'
          onClick={() => scope.view.getState().closeLevelsAbove(0)}
        >
          Back to fields
        </button>
        <FieldNode address={current.address} node={current.node} />
      </>
    );
  }
  return (
    <>
      {scope.collection.fields.map((node) => (
        <Field key={node.name} address={toFieldAddress(node.name)} />
      ))}
    </>
  );
}
