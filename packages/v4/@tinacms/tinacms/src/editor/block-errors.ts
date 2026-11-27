import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import { useFormStore } from '../form/form-store';
import type { FormId } from '../form/form-store';
import { failingLeaves, inDocumentOrder } from './field-errors';
import type { FormViewStore } from './form-view-state';

/** Lists the form's failing fields in the Errors pane, so Save reads "Resolve N errors". False when none fail. */
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
