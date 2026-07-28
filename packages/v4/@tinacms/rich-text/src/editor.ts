// `@tinacms/rich-text/editor` — the Plate editor.
//
// Separate from the root entry because this is the heavy half: importing it pulls
// Plate, Radix and the rest. A host loads it from a lazily-imported module (v4's
// field plugin does it from its client segment) so the weight only lands in the
// browser bundle when a rich-text field is actually rendered.
export { RichEditor, type RichEditorProps } from './plate';
export {
  EditorContext,
  type EditorContextValue,
  useEditorContext,
} from './plate/editor-context';
export type { RichEditorField } from './plate/editor-field';
export type { MdxTemplate, TemplateField } from './plate/types';
export type {
  ToolbarOverrides,
  ToolbarOverrideType,
} from './plate/toolbar/toolbar-overrides';
