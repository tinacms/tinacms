import { useMemo } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Brand } from '../core/brand';
import { type FieldAddress, toFieldAddress } from '../core/field/address';
import {
  type FieldEquality,
  STRUCTURAL_EQUALITY,
  sameValue,
} from '../core/form/compare';
import { invariant } from '../core/invariant';
import type { TinaDocument } from '../core/schema/types';

// The form state store (ADR-010, issue #6909). It holds the status of each open
// document: pristine, dirty, or clean. Save controls, navigation warnings, and the
// editor indicators all read the status from here.
//
// Each open form keeps a flat map of values, keyed by its form id. After the first
// edit, the store compares those values with a baseline. The baseline is the content
// the form loaded, or the content it last saved. Open forms do not overwrite each
// other, because each one has its own form id.
//
// RHF owns the values and the errors inside a mounted form. This store keeps a
// one-way mirror of both, and the provider is the only writer. The mirror outlives
// the mount, so a return to the form keeps the unsaved edits. Everything outside RHF
// reads the mirror. The structure index (ADR-010) arrives with the composite fields.

// There is one form per document (ADR-010), so the form id is the document path. The
// brand keeps it distinct from a field address and from a plain string.
export type FormId = Brand<string, 'FormId'>;

export const toFormId = (path: string): FormId => {
  invariant(
    path.length > 0,
    'form-id-empty',
    'A form id must be a non-empty path.'
  );
  return path as FormId;
};

// The brand stops a plain string from seeding or indexing the values of a form.
export type FormValues = Record<FieldAddress, unknown>;

// The constructor for FormValues. It brands the keys of a flat document as field
// addresses. It handles flat addresses only, which is what the editor field hooks
// assume. Composite fields will need a path walk here.
export const toFormValues = (document: TinaDocument): FormValues => {
  const values: FormValues = {};
  for (const [name, value] of Object.entries(document)) {
    values[toFieldAddress(name)] = value;
  }
  return values;
};

// The inverse of toFormValues. A flat address is a field name today, so the document
// is a key-for-key copy.
export const toDocument = (values: FormValues): TinaDocument => ({ ...values });

export type FormStatus = 'pristine' | 'dirty' | 'clean';

// The validation messages for each address, mirrored from RHF. RHF derives them, and
// they exist only on an edited form. RHF validates on change, so a pristine form has
// no errors yet.
export type FieldErrors = Partial<Record<FieldAddress, string[]>>;

// One open document's form. A pristine form has no baseline, because its values are
// the baseline. A baseline appears when the form is edited or saved. The store then
// compares the values with the baseline to tell dirty from clean. This shape makes a
// pristine form with a different baseline impossible to build.
// The name is OpenForm, not FormScope. FormScope is the form context of the editor in
// editor/context.ts.
// The `equal` of a form arrives with it, from the host that registered it, because the
// answer belongs to the fields and the store holds no field registry. Refer to
// core/form/compare.ts.
type OpenForm =
  | {
      readonly status: 'pristine';
      readonly values: FormValues;
      readonly equal: FieldEquality;
    }
  | {
      readonly status: 'edited';
      readonly values: FormValues;
      readonly baseline: FormValues;
      readonly errors: FieldErrors;
      readonly equal: FieldEquality;
    };

// The only place that compares the discriminant. Every consumer calls this instead.
export const isEdited = (
  scope: OpenForm | undefined
): scope is Extract<OpenForm, { status: 'edited' }> =>
  scope?.status === 'edited';

export interface FormStore {
  // Keyed by form id, so a missing key is a form that is not open.
  forms: Partial<Record<FormId, OpenForm>>;
  // The one active field across all open forms (ADR-009, visual editing). A click in
  // the preview activates a single field, and that field then focuses itself with
  // useFieldActivation. It sits on the store, not on the form, because activation
  // does not depend on the dirty state.
  active: { formId: FormId; address: FieldAddress } | null;
  // Seed a form with the values it loaded. A second call on an edited form does
  // nothing, so a return to the form keeps the unsaved edits (ADR-012). A second call
  // on a pristine form adopts the new content, so a reload is never stale.
  // The `equal` is the equality of this form's fields, from fieldEqualityFor. Without
  // it, every field of the form compares as structure.
  registerForm: (
    formId: FormId,
    values: FormValues,
    equal?: FieldEquality
  ) => void;
  setFieldValue: (
    formId: FormId,
    address: FieldAddress,
    value: unknown
  ) => void;
  // The only write path for the error mirror. It replaces the whole map. The provider
  // calls it each time RHF derives the errors again. It does nothing for a pristine
  // form, and nothing for an equal map.
  setFieldErrors: (formId: FormId, errors: FieldErrors) => void;
  setActive: (formId: FormId, address: FieldAddress | null) => void;
  // After a save, move the baseline to the values that were saved. The status becomes
  // clean. The caller passes the snapshot it saved, so an edit made during the save
  // stays dirty. Without a snapshot, the current values become the baseline.
  markSaved: (formId: FormId, savedValues?: FormValues) => void;
  // Throw the edits away and put the form back on its baseline: the content it loaded,
  // or the content it last saved. The form becomes pristine, and its mirrored errors go
  // with the edits that raised them, because this is the form a fresh load would give.
  // The host resets RHF alongside it. Refer to discardEdits in editor/provider.tsx.
  discardEdits: (formId: FormId) => void;
  // Close the form and drop its state.
  removeForm: (formId: FormId) => void;
}

const valuesEqual = (
  current: FormValues,
  baseline: FormValues,
  equal: FieldEquality
): boolean => {
  // Compare the union of both key sets, so an undefined value equals an absent key.
  // JSON cannot hold "present but undefined", and a controlled input clears to
  // undefined. The two are one state.
  // Object.keys drops the brand. These keys arrived as field addresses.
  const keys = new Set([
    ...Object.keys(current),
    ...Object.keys(baseline),
  ]) as Set<FieldAddress>;
  return [...keys].every((key) => equal(key, current[key], baseline[key]));
};

export const formStatus = (scope: OpenForm | undefined): FormStatus => {
  if (!isEdited(scope)) return 'pristine';
  return valuesEqual(scope.values, scope.baseline, scope.equal)
    ? 'clean'
    : 'dirty';
};

// The dirty test for one field, behind the exported useIsFieldDirty. It compares
// values like valuesEqual, and for the same reason.
export const fieldDirty = (
  scope: OpenForm | undefined,
  address: FieldAddress
): boolean =>
  isEdited(scope)
    ? !scope.equal(address, scope.values[address], scope.baseline[address])
    : false;

// RHF builds new message arrays each time it derives the errors. This compares their
// content, so an unchanged write does not disturb the subscribers. The maps hold
// arrays of strings, so JSON is safe here. A different key order costs one more write.
const errorsEqual = (current: FieldErrors, next: FieldErrors): boolean =>
  JSON.stringify(current) === JSON.stringify(next);

// Zustand composes its middleware at create() time. This store uses devtools only,
// which sends the status changes to the Redux DevTools extension. Without the
// extension, in production and in the tests, devtools does nothing. The store does
// not use persist, because it loads the values from the document at each boot.
//
// The names below are the title of the store and its action labels in the DevTools
// timeline. They are declared once, so the call sites cannot drift.
const DEVTOOLS_STORE_NAME = 'TinaFormStore';
const DEVTOOLS_ACTION = {
  register: 'form/register',
  setFieldValue: 'form/setFieldValue',
  setFieldErrors: 'form/setFieldErrors',
  setActive: 'form/setActive',
  markSaved: 'form/markSaved',
  discardEdits: 'form/discardEdits',
  removeForm: 'form/removeForm',
} as const;
type DevtoolsActionLabel =
  (typeof DEVTOOLS_ACTION)[keyof typeof DEVTOOLS_ACTION];

export const useFormStore = create<FormStore>()(
  devtools(
    (set) => {
      // Apply a labelled patch to the state. It calls the Zustand set(partial,
      // replace, action) with replace set to false. Every action merges its patch
      // into the state, and no action replaces the whole store.
      const apply = (
        patch: (state: FormStore) => FormStore | Partial<FormStore>,
        action: DevtoolsActionLabel
      ) => set(patch, false, action);

      return {
        forms: {},
        active: null,

        registerForm: (formId, values, equal = STRUCTURAL_EQUALITY) =>
          apply((state) => {
            // TODO(v4): the edited state also covers a clean form, so a clean form
            // does not adopt new content on a reload. The draft slice will choose
            // between the new content and the kept edits.
            if (isEdited(state.forms[formId])) return state;
            return {
              forms: {
                ...state.forms,
                [formId]: { status: 'pristine', values: { ...values }, equal },
              },
            };
          }, DEVTOOLS_ACTION.register),

        setFieldValue: (formId, address, value) =>
          apply((state) => {
            const scope = state.forms[formId];
            if (!scope) return state;
            // A write that the document would not see does nothing, because a
            // controlled input fires onChange again with the same value, and Plate
            // rewrites its tree on a click alone. A field must send a new value, and
            // must not change a value in place. This test drops a value that was
            // changed in place.
            if (scope.equal(address, scope.values[address], value))
              return state;
            // The first edit keeps the pristine values as the baseline.
            return {
              forms: {
                ...state.forms,
                [formId]: {
                  // Spread, so a rebuild carries the `equal` of the form rather
                  // than relisting it. A rebuild that forgot it would silently
                  // compare every field of the form as structure.
                  ...scope,
                  status: 'edited',
                  values: { ...scope.values, [address]: value },
                  baseline: isEdited(scope) ? scope.baseline : scope.values,
                  // A value write leaves the errors alone. RHF derives them
                  // again, and setFieldErrors then updates the mirror.
                  errors: isEdited(scope) ? scope.errors : {},
                },
              },
            };
          }, DEVTOOLS_ACTION.setFieldValue),

        setFieldErrors: (formId, errors) =>
          apply((state) => {
            const scope = state.forms[formId];
            // A pristine form has no errors to mirror. RHF validates on change, so
            // it derives no errors before the first edit.
            if (!isEdited(scope)) return state;
            if (errorsEqual(scope.errors, errors)) return state;
            // Keep the values and the baseline references. An error write must not
            // look like a value change to the preview wire or to the dirty test.
            return {
              forms: {
                ...state.forms,
                [formId]: { ...scope, errors: { ...errors } },
              },
            };
          }, DEVTOOLS_ACTION.setFieldErrors),

        setActive: (formId, address) =>
          apply(
            () => ({ active: address == null ? null : { formId, address } }),
            DEVTOOLS_ACTION.setActive
          ),

        markSaved: (formId, savedValues) =>
          apply((state) => {
            const scope = state.forms[formId];
            if (!scope) return state;
            return {
              forms: {
                ...state.forms,
                [formId]: {
                  ...scope,
                  status: 'edited',
                  baseline: savedValues ?? scope.values,
                  // A save changes no values, so it changes no errors.
                  errors: isEdited(scope) ? scope.errors : {},
                },
              },
            };
          }, DEVTOOLS_ACTION.markSaved),

        discardEdits: (formId) =>
          apply((state) => {
            const scope = state.forms[formId];
            // A form with no edits has nothing to discard. That covers a pristine
            // form, and a form that is not open at all.
            if (!isEdited(scope)) return state;
            return {
              forms: {
                ...state.forms,
                [formId]: {
                  status: 'pristine',
                  values: scope.baseline,
                  equal: scope.equal,
                },
              },
            };
          }, DEVTOOLS_ACTION.discardEdits),

        removeForm: (formId) =>
          apply((state) => {
            if (!state.forms[formId]) return state;
            const { [formId]: _removed, ...rest } = state.forms;
            return {
              forms: rest,
              active: state.active?.formId === formId ? null : state.active,
            };
          }, DEVTOOLS_ACTION.removeForm),
      };
    },
    { name: DEVTOOLS_STORE_NAME }
  )
);

// A read of the store that does not subscribe, for the places that need the current
// state and not a render on every change. Callers use this rather than
// useFormStore.getState() when the read happens during a render: the hook is a value
// there and not a call, which breaks the rules of React and makes the React Compiler
// skip the whole component. At module scope it is a plain read.
export const readFormStore = (): FormStore => useFormStore.getState();

export const useFormStatus = (formId: FormId): FormStatus =>
  useFormStore((state) => formStatus(state.forms[formId]));

export const useIsFormDirty = (formId: FormId): boolean =>
  useFormStore((state) => formStatus(state.forms[formId]) === 'dirty');

export const useIsFieldDirty = (
  formId: FormId,
  address: FieldAddress
): boolean => useFormStore((state) => fieldDirty(state.forms[formId], address));

// The live values of any open form, mounted or not. The chrome, the collection views,
// and the panels read the mirror. They do not touch the RHF instance of the form. The
// selector returns a stable reference to the values. The memo then gives the caller a
// stable document for each real change. This package ships its source, so a consumer
// that holds the document in a dependency list sees this hook as written.
export const useFormValues = (formId: FormId): TinaDocument | undefined => {
  const values = useFormStore((state) => state.forms[formId]?.values);
  return useMemo(() => (values ? toDocument(values) : undefined), [values]);
};

const NO_FIELD_ERRORS: FieldErrors = {};

// The mirrored errors of any open form. A pristine form and an unopened form both
// give an empty map. A collection view uses this to mark a document that has errors.
export const useFormErrors = (formId: FormId): FieldErrors =>
  useFormStore((state) => {
    const scope = state.forms[formId];
    return isEdited(scope) ? scope.errors : NO_FIELD_ERRORS;
  });
