// The public entry `@tinacms/tinacms/preview`. It holds the half of the site-side visual
// editing that no framework owns (ADR-009 §4): the wire protocol and the tinaField
// address marker. It uses neither React nor zustand. The bindings for each framework sit
// under ./adapters/<framework>, and React is the first of them, at ./adapters/react. The
// editor half is usePreviewConnection, on the ./react entry. connectToEditor and the
// message constructors stay internal.
export { TINA_FIELD_ATTR, tinaField } from './protocol';
