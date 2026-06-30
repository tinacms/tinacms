import { create } from 'zustand';
import type { Brand } from '../core/brand';
import type { FieldAddress } from '../core/field/address';

// The Form state store (ADR-010, issue #6909). One trustworthy source of truth for
// whether an open document's form is pristine, dirty, or clean — read by save
// controls, navigation warnings and editor-state indicators instead of each view
// inferring it from its own local copy.
//
// Shape: a flat `address -> value` map per open document (keyed by `formId`); once
// edited, the values are diffed against the baseline they were loaded/last-saved from.
// Pristine is "never edited since load". Multiple forms coexist (a reference field
// hosts a second document's form) without overwriting each other's state.
//
// Scope (ponytail): this is the standalone source-of-truth store. Field values still
// render through react-hook-form today; wiring the editor to read/write here (and
// retiring the duplicate RHF state) is the next increment. Structure index, errors and
// active-field state (ADR-010) are added when composite fields / validation / visual
// editing land — none are needed for clean/dirty/pristine.

// A form is opened per document (ADR-010), so its id is that document's path. Branded
// like FieldAddress so it can't be confused with a field address or a bare string.
export type FormId = Brand<string, 'FormId'>;

export const toFormId = (path: string): FormId => {
  if (path.length === 0) {
    throw new Error('A form id must be a non-empty path.');
  }
  return path as FormId;
};

export type FormValues = Record<string, unknown>;

export type FormStatus = 'pristine' | 'dirty' | 'clean';

// One open document's form, modelled so illegal states can't be built: a pristine form
// carries no baseline (its values *are* the baseline), and a baseline exists only once
// the form has been edited or saved. Dirty vs clean is then derived from
// values-vs-baseline within the edited state — there is no "pristine with a divergent
// baseline" to mishandle.
type FormScope =
  | { readonly status: 'pristine'; readonly values: FormValues }
  | {
      readonly status: 'edited';
      readonly values: FormValues;
      readonly baseline: FormValues;
    };

export interface FormStore {
  forms: Record<string, FormScope>;
  // Flatten on load: seed a form's values. Re-registering an *edited* form is a no-op so
  // navigating away and back keeps unsaved edits (ADR-012 teardown); re-registering a
  // pristine form re-adopts the incoming content, so reloading the same id with changed
  // content is never stale.
  registerForm: (formId: FormId, values: FormValues) => void;
  setFieldValue: (
    formId: FormId,
    address: FieldAddress,
    value: unknown
  ) => void;
  // Save success: freeze the baseline at the current values -> status goes `clean`.
  markSaved: (formId: FormId) => void;
  // Explicit close: drop the scope (GC).
  removeForm: (formId: FormId) => void;
}

// ponytail: shallow key/value equality is correct while field values are primitives
// (the only field type today is `string`). When object/list/rich-text values land,
// equality should be owned by the field descriptor (each field type compares its own
// value, alongside its parse/serialize) rather than a central deep-compare bolted on
// here — the store then asks the field "did this change?" instead of guessing.
const valuesEqual = (current: FormValues, baseline: FormValues): boolean => {
  const keys = Object.keys(current);
  if (keys.length !== Object.keys(baseline).length) return false;
  return keys.every((key) => Object.is(current[key], baseline[key]));
};

export const formStatus = (scope: FormScope | undefined): FormStatus => {
  if (!scope || scope.status === 'pristine') return 'pristine';
  return valuesEqual(scope.values, scope.baseline) ? 'clean' : 'dirty';
};

export const fieldDirty = (
  scope: FormScope | undefined,
  address: FieldAddress
): boolean =>
  scope?.status === 'edited'
    ? !Object.is(scope.values[address], scope.baseline[address])
    : false;

export const useFormStore = create<FormStore>((set) => ({
  forms: {},

  registerForm: (formId, values) =>
    set((state) => {
      if (state.forms[formId]?.status === 'edited') return state;
      return {
        forms: {
          ...state.forms,
          [formId]: { status: 'pristine', values: { ...values } },
        },
      };
    }),

  setFieldValue: (formId, address, value) =>
    set((state) => {
      const scope = state.forms[formId];
      if (!scope) return state;
      // Re-setting a field to the value it already holds is a no-op — controlled inputs
      // re-fire onChange with the same value; don't churn state.
      if (Object.is(scope.values[address], value)) return state;
      // The first edit freezes the pristine values as the baseline to diff against.
      const baseline =
        scope.status === 'pristine' ? scope.values : scope.baseline;
      return {
        forms: {
          ...state.forms,
          [formId]: {
            status: 'edited',
            values: { ...scope.values, [address]: value },
            baseline,
          },
        },
      };
    }),

  markSaved: (formId) =>
    set((state) => {
      const scope = state.forms[formId];
      if (!scope) return state;
      return {
        forms: {
          ...state.forms,
          [formId]: {
            status: 'edited',
            values: scope.values,
            baseline: scope.values,
          },
        },
      };
    }),

  removeForm: (formId) =>
    set((state) => {
      if (!state.forms[formId]) return state;
      const { [formId]: _removed, ...rest } = state.forms;
      return { forms: rest };
    }),
}));

export const useFormStatus = (formId: FormId): FormStatus =>
  useFormStore((state) => formStatus(state.forms[formId]));

export const useIsFormDirty = (formId: FormId): boolean =>
  useFormStore((state) => formStatus(state.forms[formId]) === 'dirty');

export const useIsFieldDirty = (
  formId: FormId,
  address: FieldAddress
): boolean => useFormStore((state) => fieldDirty(state.forms[formId], address));
