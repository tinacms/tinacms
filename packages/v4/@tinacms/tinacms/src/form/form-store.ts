import { useMemo } from 'react';
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
// Scope (ponytail): RHF owns and renders field values and derives errors inside an
// open form; this store carries the one-way mirror of both (the provider is the sole
// writer) plus the status/active state it owns outright. The mirror is what outlives
// the form's mount — navigation back re-adopts kept edits — and what everything
// non-RHF subscribes to: collection-level dirty/error indicators, the preview
// adapter's wire, any future framework adapter. Structure index (ADR-010) arrives
// with composite fields.

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

// Sparse per-address validation messages, mirrored one-way from RHF (the owner that
// derives them). Lives only on the edited scope: a pristine form has never been
// validated — RHF's onChange mode shows no errors at mount, and the model matches.
export type FieldErrors = Partial<Record<FieldAddress, string[]>>;

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
      readonly errors: FieldErrors;
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
  // The error mirror's single write path: whole-map replace, called by the provider
  // whenever RHF re-derives. No-op for a pristine scope (never validated) and for an
  // equal map (RHF churns error-object identity per keystroke).
  setFieldErrors: (formId: FormId, errors: FieldErrors) => void;
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

// Message arrays are rebuilt by RHF on every derivation; compare content so an
// unchanged mirror write doesn't churn subscriber identity.
const errorsEqual = (current: FieldErrors, next: FieldErrors): boolean => {
  const keys = Object.keys(current) as FieldAddress[];
  if (keys.length !== Object.keys(next).length) return false;
  return keys.every((key) => {
    const a = current[key];
    const b = next[key];
    return (
      a !== undefined &&
      b !== undefined &&
      a.length === b.length &&
      a.every((message, index) => message === b[index])
    );
  });
};

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
  setFieldErrors: 'form/setFieldErrors',
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
                  // Value writes never touch errors — RHF re-derives and the
                  // mirror (setFieldErrors) follows.
                  errors: scope.status === 'pristine' ? {} : scope.errors,
                },
              },
            };
          }, DEVTOOLS_ACTION.setFieldValue),

        setFieldErrors: (formId, errors) =>
          apply((state) => {
            const scope = state.forms[formId];
            // Pristine means never validated — there is nothing to mirror onto
            // (and RHF's onChange mode derives no errors before the first edit).
            if (scope?.status !== 'edited') return state;
            if (errorsEqual(scope.errors, errors)) return state;
            // values/baseline references are preserved: an error write must not
            // read as a value change to values subscribers (preview wire, dirty).
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
                  status: 'edited',
                  values: scope.values,
                  baseline: savedValues ?? scope.values,
                  // A save changes no values, so it changes no errors; the
                  // mirror overwrites on RHF's next derivation anyway.
                  errors: scope.status === 'edited' ? scope.errors : {},
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

// Any open form's live values, mounted or not — chrome, collection views and
// panels read the mirror without touching the hosting form's RHF instance.
// The selector returns the stable values reference; the document copy is
// memoized on it so callers get a stable identity per actual change.
export const useFormValues = (formId: FormId): TinaDocument | undefined => {
  const values = useFormStore((state) => state.forms[formId]?.values);
  return useMemo(() => (values ? toDocument(values) : undefined), [values]);
};

const NO_FIELD_ERRORS: FieldErrors = {};

// Any open form's mirrored errors ({} for pristine/unregistered) — what lets a
// collection view badge "this document has errors" while another form is open.
export const useFormErrors = (formId: FormId): FieldErrors =>
  useFormStore((state) => {
    const scope = state.forms[formId];
    return scope?.status === 'edited' ? scope.errors : NO_FIELD_ERRORS;
  });
