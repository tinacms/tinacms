// Browser-only entry — `tinacms/react`.
// Imported by the Admin UI host and by plugin client segments.
// The server-side adapters (next/express/astro/hono in the adapters/ folder) must NOT be imported from here.
//
// Provider + the `<Field>` Component-resolution primitive (ADR-009), the
// address-keyed Form hooks (ADR-010), and the editor half of visual editing
// (usePreviewConnection — the site half lives on the ./preview entry). Field
// values render through react-hook-form; clean/dirty/pristine state is the
// form-state store's single source of truth.

export { type FieldAddress, toFieldAddress } from '../core/field/address';
// Read-only source of truth for form clean/dirty/pristine state. The store handle
// and its mutators stay package-internal (the editor drives writes) so plugin client
// segments cannot poke form state directly (ADR-010 §6).
export {
  type FormId,
  type FormStatus,
  toFormId,
  useFormStatus,
  useIsFieldDirty,
  useIsFormDirty,
} from '../form/form-store';
export type { SaveHandler } from './context';
export { Field, type FieldProps } from './field';
export {
  FormProvider,
  type FormProviderProps,
  TinaProvider,
  type TinaProviderProps,
} from './provider';
export {
  type PreviewConnectionOptions,
  usePreviewConnection,
} from './preview-connection';
export {
  type ActiveField,
  useActiveField,
  useFieldActivation,
  useFieldAddress,
  useFieldErrors,
  useFieldRegistry,
  useFieldSchema,
  useFieldValue,
  useFormId,
  useFormSave,
  useTinaStore,
} from './hooks';
