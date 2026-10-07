/**
 * Validates CSS colours from rich-text colour marks.
 *
 * This file is intentionally dependency-free — it's built as its own entry point
 * (`@tinacms/mdx/sanitize-css-color`) so renderers and editors that only need
 * colour validation (eg. `tinacms`'s rich-text renderer) don't pull in the
 * markdown-parsing toolchain the rest of `@tinacms/mdx` bundles.
 */

const COLOR_FUNCTIONS = new Set([
  'rgb',
  'rgba',
  'hsl',
  'hsla',
  'hwb',
  'lab',
  'lch',
  'oklab',
  'oklch',
  'color',
  'color-mix',
  'light-dark',
  'calc',
  'var',
]);

const isSafeColorFunction = (value: string) => {
  if (!/^[a-z-]+\([a-z0-9_.,%/#() +-]*\)$/i.test(value)) {
    return false;
  }
  let depth = 0;
  for (const [token, name = ''] of value.matchAll(/([a-z-]*)\(|\)/gi)) {
    if (token === ')') {
      depth--;
    } else if (COLOR_FUNCTIONS.has(name.toLowerCase())) {
      depth++;
    } else {
      return false;
    }
    if (depth < 0) {
      return false;
    }
  }
  return depth === 0;
};

/**
 * Whether `value` is a plain CSS colour that's safe to drop into a `style`:
 * hex, a named colour, or colour functions (`rgb()`, `hsl()`, `lab()`,
 * `oklch()`, `color-mix()`, `var(--name, fallback)` and the like) nested only
 * in each other. Anything else (`;`, braces, quotes, comments, `url(`) is
 * rejected so a colour can't smuggle in extra CSS. Used when parsing and
 * rendering rich-text text colour and highlight colour.
 */
export const isSafeCssColor = (value: string): boolean => {
  const color = value.trim().replace(/\s+!important$/i, '');
  return (
    /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color) ||
    /^[a-z]+$/i.test(color) ||
    isSafeColorFunction(color)
  );
};
