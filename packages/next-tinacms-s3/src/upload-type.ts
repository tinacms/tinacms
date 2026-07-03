/**
 * Extensions a browser may run as an active document when a media file is
 * served inline. Only the final extension is checked, since that is what a
 * static server / CDN derives the content-type from.
 */
const DISALLOWED_UPLOAD_EXTENSIONS = new Set([
  'html',
  'htm',
  'xhtml',
  'xht',
  'shtml',
  'svg',
  'svgz',
  'xml',
  'xsl',
  'xslt',
  'js',
  'mjs',
  'cjs',
  'mhtml',
  'mht',
]);

const getFinalExtension = (filename: string): string => {
  const base = (filename || '').split(/[\\/]/).pop() || '';
  const dot = base.lastIndexOf('.');
  if (dot <= 0 || dot === base.length - 1) return '';
  return base.slice(dot + 1).toLowerCase();
};

/** True when a filename's final extension is not allowed for media uploads. */
export const isDisallowedUploadType = (filename: string): boolean =>
  DISALLOWED_UPLOAD_EXTENSIONS.has(getFinalExtension(filename));
