import type { HighlightColour } from '@tinacms/schema-tools/src/util';
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
  | 'italic'
  | 'strikethrough'
  | 'highlight'
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
export type HighlightColorOption = {
  /**
   * Display name for the highlight color (e.g., "Yellow", "Green").
   */
  label: string;

  /**
   * The actual highlight color value, represented as a HighlightColour class instance.
   */
  value: HighlightColour;
};
export type ToolbarOverrides = {
  toolbar?: ToolbarOverrideType[];
  showFloatingToolbar?: boolean;
 /**
   * Array of highlight color options.
   * Each item should include:
   * - `label`: a human-readable name for the color
   * - `value`: an instance of the HighlightColour class representing the color
   */
  highlightColors?: HighlightColorOption[];
};
