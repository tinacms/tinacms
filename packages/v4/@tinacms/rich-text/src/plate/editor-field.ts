import type { ToolbarOverrides } from './toolbar/toolbar-overrides';
import type { MdxTemplate } from './types';

export interface RichEditorField {
  templates?: MdxTemplate[];
  overrides?: ToolbarOverrides;
}
