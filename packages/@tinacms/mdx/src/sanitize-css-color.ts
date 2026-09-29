/**
 * Validates CSS colours from rich-text colour marks.
 *
 * This file is intentionally dependency-free — it's built as its own entry point
 * (`@tinacms/mdx/sanitize-css-color`) so renderers and editors that only need
 * colour validation (eg. `tinacms`'s rich-text renderer) don't pull in the
 * markdown-parsing toolchain the rest of `@tinacms/mdx` bundles.
 */

const SAFE_CSS_COLOR_PATTERNS = [
  /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i,
  /^[a-z]+$/i,
  /^(?:rgba?|hsla?|oklch|oklab)\([0-9.,%/ a-z-]*\)$/i,
  /^var\(--[a-z0-9_-]+\)$/i,
];

/**
 * Whether `value` is a plain CSS colour that's safe to drop into a `style`:
 * hex, a named colour, `rgb()`/`hsl()`/`oklch()`/`oklab()` (and alpha forms)
 * or `var(--name)`. Anything else — `;`, braces, quotes, `url(` — is rejected
 * so a colour can't smuggle in extra CSS. Used when parsing and rendering
 * rich-text text colour and highlight colour.
 */
export const isSafeCssColor = (value: string): boolean =>
  SAFE_CSS_COLOR_PATTERNS.some((pattern) => pattern.test(value));
