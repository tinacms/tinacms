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

export type FormId = Brand<string, 'FormId'>;

export const toFormId = (path: string): FormId => {
  invariant(
    path.length > 0,
    'form-id-empty',
    'A form id must be a non-empty path.'
  );
  return path as FormId;
};

export type FormValues = Record<FieldAddress, unknown>;

export const toFormValues = (document: TinaDocument): FormValues => {
  const values: FormValues = {};
  for (const [name, value] of Object.entries(document)) {
    values[toFieldAddress(name)] = value;
  }
  return values;
};

export const toDocument = (values: FormValues): TinaDocument => ({ ...values });

export type FormStatus = 'pristine' | 'dirty' | 'clean';

export type FieldErrors = Partial<Record<FieldAddress, string[]>>;

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

export const isEdited = (
  scope: OpenForm | undefined
): scope is Extract<OpenForm, { status: 'edited' }> =>
  scope?.status === 'edited';

export interface FormStore {
  forms: Partial<Record<FormId, OpenForm>>;
  active: { formId: FormId; address: FieldAddress } | null;
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
  setFieldErrors: (formId: FormId, errors: FieldErrors) => void;
  setActive: (formId: FormId, address: FieldAddress | null) => void;
  markSaved: (formId: FormId, savedValues?: FormValues) => void;
  discardEdits: (formId: FormId) => void;
  removeForm: (formId: FormId) => void;
}

const valuesEqual = (
  current: FormValues,
  baseline: FormValues,
  equal: FieldEquality
): boolean => {
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

// The edited state also covers a clean form, so a clean form must not keep values that
// hide a changed document. A dirty form keeps its edits across mounts. A clean form
// keeps its values only while the document matches the baseline of the last save. A
// different document shows that another writer changed the file after the save.
export const keepsValues = (
  scope: OpenForm | undefined,
  incoming: FormValues
): scope is Extract<OpenForm, { status: 'edited' }> => {
  if (!isEdited(scope)) return false;
  if (formStatus(scope) === 'dirty') return true;
  return valuesEqual(scope.baseline, incoming, scope.equal);
};

export const fieldDirty = (
  scope: OpenForm | undefined,
  address: FieldAddress
): boolean =>
  isEdited(scope)
    ? !scope.equal(address, scope.values[address], scope.baseline[address])
    : false;

const errorsEqual = (current: FieldErrors, next: FieldErrors): boolean =>
  JSON.stringify(current) === JSON.stringify(next);

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
      const apply = (
        patch: (state: FormStore) => FormStore | Partial<FormStore>,
        action: DevtoolsActionLabel
      ) => set(patch, false, action);

      return {
        forms: {},
        active: null,

        registerForm: (formId, values, equal = STRUCTURAL_EQUALITY) =>
          apply((state) => {
            if (keepsValues(state.forms[formId], values)) return state;
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
            if (scope.equal(address, scope.values[address], value))
              return state;
            return {
              forms: {
                ...state.forms,
                [formId]: {
                  ...scope,
                  status: 'edited',
                  values: { ...scope.values, [address]: value },
                  baseline: isEdited(scope) ? scope.baseline : scope.values,
                  errors: isEdited(scope) ? scope.errors : {},
                },
              },
            };
          }, DEVTOOLS_ACTION.setFieldValue),

        setFieldErrors: (formId, errors) =>
          apply((state) => {
            const scope = state.forms[formId];
            if (!isEdited(scope)) return state;
            if (errorsEqual(scope.errors, errors)) return state;
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
                  // A caller passes the form library's own value tree, which it
                  // keeps mutating in place. The baseline must be a private
                  // snapshot or a later edit mutates it too and never reads as
                  // dirty.
                  baseline: structuredClone(savedValues ?? scope.values),
                  errors: isEdited(scope) ? scope.errors : {},
                },
              },
            };
          }, DEVTOOLS_ACTION.markSaved),

        discardEdits: (formId) =>
          apply((state) => {
            const scope = state.forms[formId];
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

export const readFormStore = (): FormStore => useFormStore.getState();

export const useFormStatus = (formId: FormId): FormStatus =>
  useFormStore((state) => formStatus(state.forms[formId]));

export const useIsFormDirty = (formId: FormId): boolean =>
  useFormStore((state) => formStatus(state.forms[formId]) === 'dirty');

export const useIsFieldDirty = (
  formId: FormId,
  address: FieldAddress
): boolean => useFormStore((state) => fieldDirty(state.forms[formId], address));

export const useFormValues = (formId: FormId): TinaDocument | undefined => {
  const values = useFormStore((state) => state.forms[formId]?.values);
  return useMemo(() => (values ? toDocument(values) : undefined), [values]);
};

const NO_FIELD_ERRORS: FieldErrors = {};

export const useFormErrors = (formId: FormId): FieldErrors =>
  useFormStore((state) => {
    const scope = state.forms[formId];
    return isEdited(scope) ? scope.errors : NO_FIELD_ERRORS;
  });
