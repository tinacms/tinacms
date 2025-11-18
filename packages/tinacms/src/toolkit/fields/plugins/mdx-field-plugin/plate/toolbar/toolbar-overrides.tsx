export type ToolbarOverrideType =
  | 'heading'
  | 'link'
  | 'image'
  | 'quote'
  | 'ul'
  | 'ol'
  | 'code'
  | 'codeBlock'
  | 'bold'
  | 'strikethrough'
  | 'subscript'
  | 'superscript'
  | 'italic'
  | 'mermaid'
  | 'raw'
  | 'embed'
  | 'table'
  | 'hr';

export const STANDARD_ICON_WIDTH = 32;
export const HEADING_ICON_WITH_TEXT = 127;
export const HEADING_ICON_ONLY = 58;
export const EMBED_ICON_WIDTH = 78;
export const CONTAINER_MD_BREAKPOINT = 448; // Tailwind's 'md' breakpoint for container with default `max-width` scale https://tailwindcss.com/blog/tailwindcss-v3-2
export const FLOAT_BUTTON_WIDTH = 25;

export const HEADING_LABEL = 'Headings';

export type ToolbarOverrides = {
  toolbar?: ToolbarOverrideType[];
  showFloatingToolbar?: boolean;
};
