/**
 * Extensions a browser may run as an active document when a media file is
 * served inline from the app origin. The static server picks a content-type
 * from the final extension, so only that extension is checked.
 */
const DISALLOWED_UPLOAD_EXTENSIONS = new Set([
  'html',
  'htm',
  'xhtml',
  'xht',
  'shtml',
  'xml',
  'xsl',
  'xslt',
  'js',
  'mjs',
  'cjs',
  'mhtml',
  'mht',
]);

/** Lowercased final extension of a filename, or '' when there is none. */
export const getFinalExtension = (filename: string): string => {
  const base = (filename || '').split(/[\\/]/).pop() || '';
  const dot = base.lastIndexOf('.');
  if (dot <= 0 || dot === base.length - 1) return '';
  return base.slice(dot + 1).toLowerCase();
};

/** True when a filename's final extension is not allowed for media uploads. */
export const isDisallowedUploadType = (filename: string): boolean =>
  DISALLOWED_UPLOAD_EXTENSIONS.has(getFinalExtension(filename));
