/**
 * Sanitizes a URL, rejecting disallowed schemes (eg. `javascript:alert(document.domain)`).
 *
 * This file is intentionally dependency-free — it's built as its own entry point
 * (`@tinacms/mdx/sanitize-url`) so consumers that only need URL sanitization (eg.
 * `tinacms`'s rich-text renderer) don't have to pull in the full remark/mdast/micromark
 * markdown-parsing toolchain that the rest of `@tinacms/mdx` bundles.
 */

/**
 * Characters that carry no meaning inside a scheme, so they cannot be used to
 * disguise one. Stripped before looking for a scheme, never from the URL itself.
 */
const IGNORED_IN_SCHEME = /[\u0000-\u001f\u007f\u200b-\u200d\ufeff]/g;

/** A scheme, per RFC 3986: a letter, then letters, digits, `+`, `-` or `.`. */
const SCHEME_PREFIX = /^[a-zA-Z][a-zA-Z0-9+.\-]*:/;

const namesAScheme = (url: string) =>
  SCHEME_PREFIX.test(url.replace(IGNORED_IN_SCHEME, '').trim());

export const sanitizeUrl = (url: string | undefined) => {
  const allowedSchemes = ['http', 'https', 'mailto', 'tel', 'xref'];
  if (!url) return '';

  let parsedUrl: URL | null = null;

  try {
    parsedUrl = new URL(url);
  } catch (error) {
    /**
     * A URL that does not parse is either relative, which carries no scheme and
     * stays as it is, or malformed while still naming one. Returning the raw
     * value for the second case would hand back the input unchecked, so only the
     * first is kept.
     */
    if (namesAScheme(url)) {
      console.warn(`Invalid URL scheme detected ${url}`);
      return '';
    }
    return url;
  }

  const scheme = parsedUrl.protocol.slice(0, -1);
  if (allowedSchemes && !allowedSchemes.includes(scheme)) {
    console.warn(`Invalid URL scheme detected ${scheme}`);
    return '';
  }

  /**
   * Trailing slash is added from new URL(...) for urls with no pathname,
   * if the passed in url had one, keep it there, else just use the origin
   * eg:
   *
   * http://example.com/ -> http://example.com/
   * http://example.com -> http://example.com
   * http://example.com/a/b -> http://example.com/a/b
   * http://example.com/a/b/ -> http://example.com/a/b/
   */
  if (parsedUrl.pathname === '/') {
    if (url.endsWith('/')) {
      return parsedUrl.href;
    }
    // Include search (query parameters) and hash if they exist
    return `${parsedUrl.origin}${parsedUrl.search}${parsedUrl.hash}`;
  } else {
    return parsedUrl.href;
  }
};
