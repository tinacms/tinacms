// Public entry: `@tinacms/tinacms/preview` — the framework-agnostic half of
// site-side visual editing (ADR-009 §4): the wire protocol and the tinaField
// address marker. No React, no zustand — framework bindings live under
// ./adapters/<framework> (React first: ./adapters/react). The editor-side half
// (usePreviewConnection) lives on the ./react entry; connectToEditor and the
// raw message constructors stay internal.
export { TINA_FIELD_ATTR, tinaField } from './protocol';
