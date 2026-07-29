import type { HeadingLevel, ToolbarOverrideType } from '@tinacms/schema-tools';
export type { HeadingLevel, ToolbarOverrideType };

// Measured off the rendered toolbar in Chromium, not derived from the classes: a
// button is `h-9 px-2` around a `size-5` icon, and the row that holds the buttons
// sets no gap, so each of these is the whole horizontal cost of one item.
export const STANDARD_ICON_WIDTH = 36;
export const HEADING_ICON_WITH_TEXT = 130;
export const HEADING_ICON_ONLY = 62;
export const EMBED_ICON_WIDTH = 54;
// Highlight opens a colour swatch, so it carries a dropdown arrow that the plain
// icon buttons do not.
export const HIGHLIGHT_ICON_WIDTH = 54;
export const CONTAINER_MD_BREAKPOINT = 448; // Tailwind's 'md' breakpoint for container with default `max-width` scale https://tailwindcss.com/blog/tailwindcss-v3-2
export const OVERFLOW_MENU_WIDTH = 36;

export const HEADING_LABEL = 'Headings';

export type ToolbarOverrides = {
  toolbar?: ToolbarOverrideType[];
  showFloatingToolbar?: boolean;
  headingLevels?: HeadingLevel[];
};
