import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import { useFormStore } from '../form/form-store';
import type { FormId } from '../form/form-store';
import { failingLeaves, inDocumentOrder } from './field-errors';
import type { FormViewStore } from './form-view-state';

/**
 * Lists the form's failing fields in the Errors pane and opens it, so Save
 * reads "Resolve N errors". Reads the errors from the form store. A client
 * block and a Backend refusal with field errors both come through here.
 * Returns false when no field fails.
 */
export const blockOnFormErrors = (
  formId: FormId,
  view: FormViewStore,
  collection: CollectionSchema,
  getValues: () => TinaDocument
): boolean => {
  const form = useFormStore.getState().forms[formId];
  const errors = form?.status === 'edited' ? form.errors : {};
  const failing = Object.keys(errors);
  const leaves = failingLeaves(failing).map((address) => ({ address }));
  if (leaves.length === 0) return false;
  const ordered = inDocumentOrder(leaves, collection.fields, getValues);
  view.getState().block(
    ordered.map((leaf) => leaf.address),
    failing.filter(
      (address) => !leaves.some((leaf) => leaf.address === address)
    )
  );
  return true;
};
