import type {
  HeadingLevel,
  RichTextColorOption,
  ToolbarOverrideType,
} from '@tinacms/schema-tools';
export type { HeadingLevel, RichTextColorOption, ToolbarOverrideType };

export type ToolbarOverrides = {
  /**
   * An allow-list: a tool not listed does not show, and the order of the list
   * is ignored because the toolbar places each tool by kind. An unknown key is
   * ignored. Leave it out to show every tool.
   */
  toolbar?: ToolbarOverrideType[];
  showFloatingToolbar?: boolean;
  headingLevels?: HeadingLevel[];
  textColors?: RichTextColorOption[];
};
