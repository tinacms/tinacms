/**
 * Sanitizes a URL, rejecting disallowed schemes (eg. `javascript:alert(document.domain)`).
 *
 * This file is intentionally dependency-free — it's built as its own entry point
 * (`@tinacms/mdx/sanitize-url`) so consumers that only need URL sanitization (eg.
 * `tinacms`'s rich-text renderer) don't have to pull in the full remark/mdast/micromark
 * markdown-parsing toolchain that the rest of `@tinacms/mdx` bundles.
 */
export const sanitizeUrl = (url: string | undefined) => {
  const allowedSchemes = ['http', 'https', 'mailto', 'tel', 'xref'];
  if (!url) return '';

  let parsedUrl: URL | null = null;

  try {
    parsedUrl = new URL(url);
  } catch (error) {
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
