import { use } from 'react';
import { toFieldAddress } from '../core/field/address';
import { FormScopeContext } from '../editor/context';
import { Field } from '../editor/field';

/**
 * Renders each field of the open collection. A field draws its own label, so a
 * unit test of a field or of the editor uses this instead of
 * `admin/document-form`, which would make a lower layer import the admin shell.
 *
 * `admin/field-labels.test.tsx` covers the real composition.
 */
export function LabelledFields() {
  const scope = use(FormScopeContext);
  if (!scope) return null;

  return (
    <>
      {scope.collection.fields.map((node) => (
        <Field key={node.name} address={toFieldAddress(node.name)} />
      ))}
    </>
  );
}
