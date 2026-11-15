import type { ToolbarOverrideType } from './toolbar-overrides';

export const IN_LINE = ['bold', 'italic', 'link', 'ul', 'ol', 'quote'] as const;
export const MORE_FORMATTING = [
  'strikethrough',
  'code',
  'highlight',
  'textColor',
] as const;
export const INSERT = ['image', 'table', 'codeBlock', 'mermaid', 'hr'] as const;

export type InLineTool = (typeof IN_LINE)[number];
export type MoreFormattingTool = (typeof MORE_FORMATTING)[number];
export type InsertTool = (typeof INSERT)[number];

export type ToolbarLayout = {
  textStyle: boolean;
  inLine: InLineTool[];
  moreFormatting: MoreFormattingTool[];
  templates: boolean;
  inserts: InsertTool[];
  showInsert: boolean;
};

/**
 * Places each allowed tool in its slot. `allow` is an allow-list: its order is
 * ignored. A slot with no tools stays empty, and Insert draws only when it
 * holds something other than a disabled Image.
 */
export function resolveToolbarLayout(
  allow: readonly ToolbarOverrideType[] | undefined,
  templateCount: number
): ToolbarLayout {
  const allowed = (key: ToolbarOverrideType) => !allow || allow.includes(key);
  const inserts = INSERT.filter(allowed);
  const templates = allowed('embed') && templateCount > 0;
  return {
    textStyle: allowed('heading'),
    inLine: IN_LINE.filter(allowed),
    moreFormatting: MORE_FORMATTING.filter(allowed),
    templates,
    inserts,
    showInsert: templates || inserts.some((key) => key !== 'image'),
  };
}

export const hasAnyTool = (layout: ToolbarLayout) =>
  layout.textStyle ||
  layout.inLine.length > 0 ||
  layout.moreFormatting.length > 0 ||
  layout.showInsert;
