import type { HeadingLevel, ToolbarOverrideType } from '@tinacms/schema-tools';
export type { HeadingLevel, ToolbarOverrideType };

export const STANDARD_ICON_WIDTH = 36;
export const HEADING_ICON_WITH_TEXT = 130;
export const HEADING_ICON_ONLY = 62;
export const EMBED_ICON_WIDTH = 54;
export const HIGHLIGHT_ICON_WIDTH = 54;
export const CONTAINER_MD_BREAKPOINT = 448;
export const OVERFLOW_MENU_WIDTH = 36;

export const HEADING_LABEL = 'Headings';

export type ToolbarOverrides = {
  toolbar?: ToolbarOverrideType[];
  showFloatingToolbar?: boolean;
  headingLevels?: HeadingLevel[];
};
