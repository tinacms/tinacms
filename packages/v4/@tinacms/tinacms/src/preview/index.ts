// Public entry: `@tinacms/tinacms/preview` — the site-side half of visual
// editing (ADR-009 §4). Deliberately tiny (react + the wire protocol, no
// zustand, no editor/admin bundle): this is what a preview page ships to the
// browser. The editor-side half (usePreviewConnection) lives on the ./react
// entry; connectToEditor and the raw message constructors stay internal.
export { TINA_FIELD_ATTR, tinaField } from './protocol';
export {
  useTina,
  type UseTinaOptions,
  type UseTinaResult,
} from './use-tina';
