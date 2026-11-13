import type { FieldAddress } from '../core/field/address';
import type { TinaDocument } from '../core/schema/types';
import type { FormId } from '../form/form-store';

/** What a mounted form lends to a save that runs outside it. */
export interface FormBindings {
  /** Reveals the form's errors in place. Resolves false when the form is invalid. */
  validate: () => Promise<boolean>;
  getValues: () => TinaDocument;
  setValue: (address: FieldAddress, value: unknown) => void;
  reseedFields: () => void;
  resetReveal: () => void;
}

const mounted = new Map<FormId, FormBindings>();

/** A form registers on mount. The returned function removes it, unless a newer mount replaced it. */
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
