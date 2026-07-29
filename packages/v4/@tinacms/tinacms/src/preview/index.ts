// The public entry `@tinacms/tinacms/preview`. It holds the half of the site-side visual
// editing that no framework owns (ADR-009 §4): the wire protocol and the tinaField
// address marker. It uses neither React nor zustand. The bindings for each framework sit
// under ./adapters/<framework>, and React is the first of them, at ./adapters/react. The
// editor half is usePreviewConnection, on the ./react entry. connectToEditor, the message
// constructors and createPreviewStore stay internal: a binding for a new framework lives
// under ./adapters and imports the store directly, so it is not a published contract yet.
export { TINA_FIELD_ATTR, tinaField } from './protocol';
