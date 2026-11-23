import { use } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormScopeContext } from '../../../editor/context';
import { fieldsAlong } from '../../../editor/form-view-state';

/** The name of the form level that holds the field, for the picker's "For <field> in <parent>" line. */
export function useParentLabel(address: string): string | undefined {
  const scope = use(FormScopeContext);
  const { getValues } = useFormContext();
  if (!scope) return undefined;
  const along = fieldsAlong(address, scope.collection.fields, (path) =>
    getValues(path)
  );
  return along.at(-2)?.label;
}
