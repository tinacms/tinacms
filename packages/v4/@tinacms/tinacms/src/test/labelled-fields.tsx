import { Fragment, use } from 'react';
import { toFieldAddress } from '../core/field/address';
import { FormScopeContext } from '../editor/context';
import { Field } from '../editor/field';

/**
 * Gives each field of the open collection an accessible name, and renders
 * nothing else. A unit test of a field or of the editor uses this instead of
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
        <Fragment key={node.name}>
          {/* `htmlFor` names a labelable widget. A widget with
              `metadata.labelable: false` reads the id through
              `aria-labelledby` instead. */}
          <label htmlFor={node.name} id={`${node.name}-label`}>
            {node.label ?? node.name}
          </label>
          <Field address={toFieldAddress(node.name)} />
        </Fragment>
      ))}
    </>
  );
}
