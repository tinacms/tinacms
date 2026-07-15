import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Brand } from '../core/brand';
import { type FieldAddress, toFieldAddress } from '../core/field/address';
import { invariant } from '../core/invariant';
import type { TinaDocument } from '../core/schema/types';

// The Form state store (ADR-010, issue #6909). One trustworthy source of truth for
// whether an open document's form is pristine, dirty, or clean — read by save
// controls, navigation warnings and editor-state indicators instead of each view
// inferring it from its own local copy.
//
// Shape: a flat `address -> value` map per open document (keyed by `formId`); once
// edited, the values are diffed against the baseline they were loaded/last-saved from.
// Pristine is "never edited since load". Multiple forms coexist without overwriting
// each other's state — each is keyed by its own formId (e.g. once a reference field can
// host a second document's form inline; that field type isn't built yet).
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
  invariant(
    path.length > 0,
    'form-id-empty',
    'A form id must be a non-empty path.'
  );
  return path as FormId;
};

// Keyed by branded FieldAddress so a raw string can't seed or index a form's values.
export type FormValues = Record<FieldAddress, unknown>;

// Brand a flat document's keys as field addresses — the constructor for FormValues.
// Flat addresses only, the same assumption as the editor's field hooks; nested
// fields need a path walk here too when composite fields land.
export const toFormValues = (document: TinaDocument): FormValues => {
  const values: FormValues = {};
  for (const [name, value] of Object.entries(document)) {
    values[toFieldAddress(name)] = value;
  }
  return values;
};

// Inverse of toFormValues — flat addresses are field names today, so the document is
// a key-for-key copy; a path walk lands here alongside toFormValues when nesting does.
export const toDocument = (values: FormValues): TinaDocument => ({ ...values });

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
  // Keyed by FormId (one open document per form, ADR-010); a missing key is a form
  // that isn't open, so a lookup returns `FormScope | undefined`.
  forms: Partial<Record<FormId, FormScope>>;
  // The single active field across all open forms (ADR-009 visual editing): a
  // preview click activates exactly one field; the owning field reacts (focus)
  // via useFieldActivation. Form-scoped rather than per-scope because activation
  // is orthogonal to dirty state.
  active: { formId: FormId; address: FieldAddress } | null;
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
  setActive: (formId: FormId, address: FieldAddress | null) => void;
  // Save success: freeze the baseline at what was actually saved -> status goes
  // `clean`. The caller passes its pre-save snapshot so edits made while the save
  // was in flight still diff dirty; omitted, the current values are the baseline.
  markSaved: (formId: FormId, savedValues?: FormValues) => void;
  // Explicit close: drop the scope (GC).
  removeForm: (formId: FormId) => void;
}

// ponytail: shallow key/value equality is correct while field values are primitives
// (the only field type today is `string`). When object/list/rich-text values land,
// equality should be owned by the field descriptor (each field type compares its own
// value, alongside its parse/serialize) rather than a central deep-compare bolted on
// here — the store then asks the field "did this change?" instead of guessing.
const valuesEqual = (current: FormValues, baseline: FormValues): boolean => {
  // Compared over the union of both key sets so a key holding undefined equals its
  // absence — JSON can't represent "present but undefined", and controlled inputs
  // clear to undefined, so the two are one state.
  // Object.keys erases the brand; these keys came in as FieldAddress.
  const keys = new Set([
    ...Object.keys(current),
    ...Object.keys(baseline),
  ]) as Set<FieldAddress>;
  return [...keys].every((key) => Object.is(current[key], baseline[key]));
};

export const formStatus = (scope: FormScope | undefined): FormStatus => {
  if (!scope || scope.status === 'pristine') return 'pristine';
  return valuesEqual(scope.values, scope.baseline) ? 'clean' : 'dirty';
};

// Per-field dirty behind the exported `useIsFieldDirty`. Same primitive assumption as
// `valuesEqual`: `Object.is` is correct while field values are primitives; an
// in-place-mutated object/list value would misread here too once composite fields land.
export const fieldDirty = (
  scope: FormScope | undefined,
  address: FieldAddress
): boolean =>
  scope?.status === 'edited'
    ? !Object.is(scope.values[address], scope.baseline[address])
    : false;

// Middleware composes at create() time (Zustand's contract): here just `devtools`, which
// streams clean/dirty/pristine transitions to the Redux DevTools extension. It's a no-op
// when the extension is absent — production and tests — so it adds no runtime behaviour
// there, only labelled actions in development. No `persist`: form values are volatile,
// reloaded from the document on boot, never rehydrated from storage.
//
// The devtools display names: the store's title and its per-action labels in the Redux
// DevTools timeline, named once so the call sites can't drift.
const DEVTOOLS_STORE_NAME = 'TinaFormStore';
const DEVTOOLS_ACTION = {
  register: 'form/register',
  setFieldValue: 'form/setFieldValue',
  setActive: 'form/setActive',
  markSaved: 'form/markSaved',
  removeForm: 'form/removeForm',
} as const;
type DevtoolsActionLabel =
  (typeof DEVTOOLS_ACTION)[keyof typeof DEVTOOLS_ACTION];

export const useFormStore = create<FormStore>()(
  devtools(
    (set) => {
      // Apply a labelled state patch. Wraps Zustand's set(partial, replace, action) with
      // `replace` pinned to false — every form action merges its patch into state, never
      // replaces the whole store — so the call sites read as intent, not a raw flag.
      const apply = (
        patch: (state: FormStore) => FormStore | Partial<FormStore>,
        action: DevtoolsActionLabel
      ) => set(patch, false, action);

      return {
        forms: {},
        active: null,

        registerForm: (formId, values) =>
          apply((state) => {
            // TODO(v4): `edited` covers clean (saved) forms too, so a clean form won't
            // re-adopt externally-changed content on reload; the future auto-save/draft
            // slice will arbitrate reload-vs-keep against dirty state.
            if (state.forms[formId]?.status === 'edited') return state;
            return {
              forms: {
                ...state.forms,
                [formId]: { status: 'pristine', values: { ...values } },
              },
            };
          }, DEVTOOLS_ACTION.register),

        setFieldValue: (formId, address, value) =>
          apply((state) => {
            const scope = state.forms[formId];
            if (!scope) return state;
            // Re-setting a field to the value it already holds is a no-op — controlled
            // inputs re-fire onChange with the same value; don't churn state. Primitive
            // assumption (see valuesEqual): an in-place-mutated object/list re-passed here
            // reads equal and would be dropped — composite fields need field-owned equality.
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
          }, DEVTOOLS_ACTION.setFieldValue),

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
                  status: 'edited',
                  values: scope.values,
                  baseline: savedValues ?? scope.values,
                },
              },
            };
          }, DEVTOOLS_ACTION.markSaved),

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

export const useFormStatus = (formId: FormId): FormStatus =>
  useFormStore((state) => formStatus(state.forms[formId]));

export const useIsFormDirty = (formId: FormId): boolean =>
  useFormStore((state) => formStatus(state.forms[formId]) === 'dirty');

export const useIsFieldDirty = (
  formId: FormId,
  address: FieldAddress
): boolean => useFormStore((state) => fieldDirty(state.forms[formId], address));
