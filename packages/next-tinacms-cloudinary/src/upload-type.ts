/**
 * NOTE: Duplicated byte-for-byte across the media adapters and @tinacms/cli.
 * These packages share no runtime module, so the check is copied rather than
 * imported. Keep every copy identical; tests/upload-type.test.ts asserts they
 * stay in sync. SVG stays allowed on purpose; sanitising it is tracked
 * separately.
 *
 * Extensions a browser runs as an active document when a media file is served
 * inline: HTML, an XML document (which can host xhtml-namespaced script), or a
 * script. Only the final extension is checked, since that is what a static
 * server or CDN derives the content-type from.
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
 * server then keys the content-type off what is left. A leading dot that is the
 * only dot (e.g. `.html`) counts as the extension, since that is what a server
 * serves it as.
 */
const getFinalExtension = (filename: string): string => {
  const base = ((filename || '').split(/[\\/]/).pop() || '').replace(
    /[.\s]+$/,
    ''
  );
  const dot = base.lastIndexOf('.');
  if (dot < 0) return '';
  if (dot === 0) return base.slice(1).toLowerCase();
  return base.slice(dot + 1).toLowerCase();
};

/**
 * True when a filename's final extension is not allowed for media uploads. The
 * part before a colon is checked as well as the whole name, so a Windows
 * alternate-data-stream name like `a.html::$DATA` cannot hide the extension.
 */
export const isDisallowedUploadType = (filename: string): boolean => {
  const name = (filename || '').split(/[\\/]/).pop() || '';
  return (
    DISALLOWED_UPLOAD_EXTENSIONS.has(getFinalExtension(name)) ||
    DISALLOWED_UPLOAD_EXTENSIONS.has(getFinalExtension(name.split(':')[0]))
  );
};
