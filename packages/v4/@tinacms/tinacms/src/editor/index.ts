// Browser-only entry — `tinacms/react`.
// Imported by the Admin UI host and by plugin client segments.
// The server-side adapters (next/express/astro/hono in the adapters/ folder) must NOT be imported from here.
//
// Provider + the `<Field>` Component-resolution primitive (ADR-009) and the
// address-keyed Form hooks (ADR-010). Field state runs on react-hook-form.

export type { FieldAddress } from '../core/field/address';
export { Field, type FieldProps } from './field';
export {
  FormProvider,
  type FormProviderProps,
  TinaProvider,
  type TinaProviderProps,
} from './provider';
export {
  useFieldActivation,
  useFieldAddress,
  useFieldErrors,
  useFieldValue,
} from './hooks';
