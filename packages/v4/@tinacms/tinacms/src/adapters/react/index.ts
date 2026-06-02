// Browser-only entry — `tinacms/react`.
// Imported by the Admin UI host and by plugin client segments.
// Sibling server-side adapters (next/express/astro/hono) must NOT be imported from here.
//
// Intended exports (see https://github.com/tinacms/tinacmsv4-docs/blob/main/api/public-api.md#react-api-tinacmsreact):
//   TinaProvider, useTinaStore, useHasPermission
//   Address-keyed Form hooks (ADR-010):
//     useFieldAddress, useFieldValue, useFieldErrors, useFieldActivation,
//     useSiblingValue, useChildKeys, useFormActions
//   <Field address={…} /> — the runtime Component-resolution primitive (ADR-009)

export {};
