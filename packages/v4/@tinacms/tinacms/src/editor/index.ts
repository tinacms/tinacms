// The browser entry, `tinacms/react`. The host of the admin UI imports it, and so do the
// client segments of the plugins. It must not import the server adapters, which are
// next, express, astro, and hono, in the adapters/ folder.
//
// It holds the provider, the `<Field>` primitive that resolves a component (ADR-009),
// the form hooks keyed by address (ADR-010), and the editor half of visual editing. That
// half is usePreviewConnection, and the site half sits on the ./preview entry.
// react-hook-form renders the field values. The form state store owns the pristine,
// dirty, and clean status.

export { type FieldAddress, toFieldAddress } from '../core/field/address';
// The read-only surface of the form store. It gives the pristine, dirty, and clean
// status, and the mirror of the values and the errors of any open form. useFormValues
// and useFormErrors read that mirror, so a collection indicator works whether or not the
// form is mounted. The store handle and its write functions stay inside the package,
// because the editor owns the writes. A plugin client segment therefore cannot write the
// form state (ADR-010 §6).
export {
  type FieldErrors,
  type FormId,
  type FormStatus,
  toFormId,
  useFormErrors,
  useFormStatus,
  useFormValues,
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
// The cache over the content capability. A plugin's client segment reads content
// through these, and not through the slice: the slice is a transport, and these hold
// the deduplication, the staleness policy, and the save's write-back.
export {
  type CollectionDocuments,
  CONTENT_STALE_TIME,
  contentKeys,
  type DocumentRead,
  type DocumentSave,
  type SaveDocumentInput,
  useCollectionDocuments,
  useDocument,
  useInvalidateContent,
  useSaveDocument,
} from './content-queries';
export {
  type ActiveField,
  useActiveField,
  useContentSlice,
  useDiscardEdits,
  useDocumentPath,
  useFieldActivation,
  useFieldAddress,
  useFieldErrors,
  useFieldRegistry,
  useFieldSchema,
  useFieldValue,
  useFormId,
  useFormSave,
  useFormSeedKey,
  useTinaStore,
} from './hooks';
