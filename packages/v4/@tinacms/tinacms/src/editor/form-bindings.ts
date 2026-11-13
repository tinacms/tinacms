import type { FieldAddress } from '../core/field/address';
import type { TinaDocument } from '../core/schema/types';
import type { FormId } from '../form/form-store';

export interface FormBindings {
  /** Reveals the form's errors in place. Resolves false when the form is invalid. */
  validate: () => Promise<boolean>;
  getValues: () => TinaDocument;
  setValue: (address: FieldAddress, value: unknown) => void;
  reseedFields: () => void;
  resetReveal: () => void;
}

// Bindings are read at each save step, so a form that mounts or unmounts mid-save is handled.
const mounted = new Map<FormId, FormBindings>();

export const registerFormBindings = (
  formId: FormId,
  bindings: FormBindings
): (() => void) => {
  mounted.set(formId, bindings);
  return () => {
    if (mounted.get(formId) === bindings) mounted.delete(formId);
  };
};

export const readFormBindings = (formId: FormId): FormBindings | undefined =>
  mounted.get(formId);
