import type { ToolbarOverrides } from './toolbar/toolbar-overrides';
import type { MdxTemplate } from './types';

// The slice of a field's schema the editor actually reads: which embeds exist
// and which toolbar controls to show. Named here rather than imported from the
// host so the dependency stays one-way — the host's RichTextFieldSchema
// satisfies this structurally and carries the rest (name, isBody, codec).
export interface RichEditorField {
  templates?: MdxTemplate[];
  overrides?: ToolbarOverrides;
}
