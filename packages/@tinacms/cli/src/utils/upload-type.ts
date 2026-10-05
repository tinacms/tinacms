/**
 * NOTE: The disallowed set, getFinalExtension and isDisallowedUploadType below
 * are duplicated byte-for-byte in each next-tinacms-* adapter's upload-type.ts.
 * These packages share no runtime module, so the check is copied rather than
 * imported. Keep every copy identical; tests/upload-type.test.ts asserts they
 * stay in sync. (looksLikeHtml / shouldInspectBody are dev-server-only and stay
 * here.)
 *
 * Extensions a browser runs as an active document when a media file is served
 * inline from the app origin: HTML, an XML document (which can host
 * xhtml-namespaced script), or a script. A static server or CDN picks the
 * content-type from the final extension, so the final extension is what we
 * check. SVG stays allowed on purpose; sanitising it is tracked separately.
 */
const DISALLOWED_UPLOAD_EXTENSIONS = new Set([
  // HTML and web archives
  'html',
  'htm',
  'xhtml',
  'xht',
  'shtml',
  'mhtml',
  'mht',
  // XML document types
  'xml',
  'xsl',
  'xslt',
  'xsd',
  'rng',
  'rdf',
  'rss',
  'atom',
  'mathml',
  'wsdl',
  'smil',
  'xul',
  'plist',
  'xbl',
  // Script
  'js',
  'mjs',
  'cjs',
  'ecma',
]);

/**
 * Lowercased final extension of a filename, or '' when there is none. Trailing
 * dots and whitespace are stripped first, because Windows drops them and a
 * server then keys the content-type off what is left. A colon is NOT treated
 * as a separator: on a POSIX host `a.png:b.html` is one filename whose real
 * extension is `html`, so splitting on it would hide the extension.
 */
export const getFinalExtension = (filename: string): string => {
  const base = ((filename || '').split(/[\\/]/).pop() || '').replace(
    /[.\s]+$/,
    ''
  );
  const dot = base.lastIndexOf('.');
  if (dot < 0) return '';
  // A leading dot is the only dot (e.g. `.html`): treat the rest as the
  // extension, since that is what a server serves it as.
  if (dot === 0) return base.slice(1).toLowerCase();
  return base.slice(dot + 1).toLowerCase();
};

/**
 * True when a filename's final extension is not allowed for media uploads.
 * The part before a colon is checked as well as the whole name: on Windows
 * `a.html::$DATA` writes the file `a.html`, while on a POSIX host the whole
 * string is the name, so both readings must be safe. The colon split runs on
 * the basename, so a Windows drive letter in an absolute path cannot stand in
 * for the stream name.
 */
export const isDisallowedUploadType = (filename: string): boolean => {
  const name = (filename || '').split(/[\\/]/).pop() || '';
  return (
    DISALLOWED_UPLOAD_EXTENSIONS.has(getFinalExtension(name)) ||
    DISALLOWED_UPLOAD_EXTENSIONS.has(getFinalExtension(name.split(':')[0]))
  );
};

/**
 * Text extensions a dev static server serves with a concrete `text/*` type on
 * every platform, so the browser never sniffs them and a leading HTML tag in a
 * legitimate document (a Markdown file opening with a raw `<div>`) is not
 * refused. The body check below is skipped only for these.
 *
 * Keep this tiny and text-only. An extension added here that a server does NOT
 * map (ico, mkv, riv and most binary or exotic types) would skip the body
 * check and let an HTML-bodied file through on the Vite dev server, which is
 * the hole the body check exists to close. Anything not listed is body-checked,
 * which is harmless for a real binary file and only refuses an HTML body.
 */
const SNIFF_EXEMPT_EXTENSIONS = new Set([
  'txt',
  'text',
  'md',
  'markdown',
  'csv',
  'tsv',
  'json',
  'jsonld',
  'yaml',
  'yml',
  'rtf',
]);

/**
 * True when a file's body should be inspected because its extension is not a
 * text type a server serves safely, so the browser may sniff the body.
 */
export const shouldInspectBody = (filename: string): boolean =>
  !SNIFF_EXEMPT_EXTENSIONS.has(getFinalExtension(filename));

/**
 * Tag names a browser's MIME sniffing reads as HTML when a file is served with
 * no content-type (the Vite dev server does this for an unknown or absent
 * extension). Each must be followed by a tag-terminating byte, so `<a>` counts
 * but `<article>` does not. SVG and XML start with `<svg` or `<?xml`, neither
 * of which is here, so a name check still owns the XML-document case. Mirrors
 * the HTML signatures in the WHATWG mime-sniffing standard.
 */
const HTML_TAG_SIGNATURES = [
  '<!doctype html',
  '<html',
  '<head',
  '<body',
  '<script',
  '<iframe',
  '<h1',
  '<div',
  '<font',
  '<table',
  '<a',
  '<style',
  '<title',
  '<b',
  '<br',
  '<p',
];

// Bytes that end a tag name, per the sniffing standard (space or `>`), plus the
// whitespace a browser skips and the `/` of a self-closing tag.
const TAG_TERMINATORS = new Set([' ', '>', '/', '\t', '\n', '\r', '\f']);

/**
 * True when a file's leading bytes would be sniffed as HTML. Guards the one
 * case a filename cannot: an unknown or absent extension that a server serves
 * with no content-type, leaving the browser to sniff the body.
 */
export const looksLikeHtml = (head: Buffer | Uint8Array): boolean => {
  const text = Buffer.from(head.buffer, head.byteOffset, head.byteLength)
    .toString('utf8', 0, Math.min(head.byteLength, 512))
    // skip a UTF-8 BOM and leading whitespace, as the sniffing standard does
    .replace(/^﻿/, '')
    .replace(/^\s+/, '')
    .toLowerCase();
  if (text.startsWith('<!--')) return true;
  return HTML_TAG_SIGNATURES.some((sig) => {
    if (!text.startsWith(sig)) return false;
    const next = text[sig.length];
    return next === undefined || TAG_TERMINATORS.has(next);
  });
};
