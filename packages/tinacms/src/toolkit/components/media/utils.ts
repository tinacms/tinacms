const supportedFileTypes = [
  'text/*',
  'application/pdf',
  'application/octet-stream',
  'application/json',
  'application/ld+json',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/postscript',
  'model/fbx',
  'model/gltf+json',
  'model/ply',
  'model/u3d+mesh',
  'model/vnd.usdz+zip',
  'application/x-indesign',
  'application/vnd.apple.mpegurl',
  'application/dash+xml',
  'application/mxf',
  'image/*',
  'video/*',
];
export const DEFAULT_MEDIA_UPLOAD_TYPES = supportedFileTypes.join(',');

export const dropzoneAcceptFromString = (str: string) => {
  return Object.assign(
    {},
    ...(str || DEFAULT_MEDIA_UPLOAD_TYPES).split(',').map((x) => ({ [x]: [] }))
  );
};

/**
 * Extensions a browser may run as an active document when a media file is
 * served inline from the app origin. Only the final extension is checked,
 * since that is what a static server derives the content-type from.
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

export const isImage = (filename: string): boolean => {
  // http://stackoverflow.com/questions/10473185/regex-javascript-image-file-extension
  // (\?.*)? is to match query strings (like from TinaCloud)
  return /\.(gif|jpg|jpeg|tiff|png|svg|webp|avif)(\?.*)?$/i.test(filename);
};

export const isVideo = (filename: string): boolean => {
  return /\.(mp4|webm|ogg|m4v|mov|avi|flv|mkv)(\?.*)?$/i.test(filename);
};

export const absoluteImgURL = (str: string) => {
  if (str.startsWith('http')) return str;
  return `${window.location.origin}${str}`;
};

// Longest base name (excluding extension) we keep. Stays well under the
// common 255-byte filesystem limit and the 1024-char S3 key limit even after
// a directory prefix is prepended.
const MAX_BASENAME_LENGTH = 200;

/**
 * Normalizes filenames to NFC and replaces characters that are unsafe for
 * URLs or common filesystems with a hyphen, while preserving the extension.
 *
 * Example: `image-a\u0308.jpg` becomes `image-ä.jpg`,
 * so URLs use `%C3%A4` instead of the decomposed `%CC%88` sequence.
 */
export const sanitizeFilename = (filename: string): string => {
  if (!filename) return 'file';

  const normalized = filename.normalize('NFC');
  const justName = normalized.split(/[\\/]/).pop() || '';

  const lastDot = justName.lastIndexOf('.');
  const hasExt = lastDot > 0 && lastDot < justName.length - 1;
  const rawBase = hasExt ? justName.slice(0, lastDot) : justName;
  const rawExt = hasExt ? justName.slice(lastDot) : '';

  const clean = (input: string) =>
    input
      .replace(/\s+/g, '-')
      // strip control characters
      .replace(/[\x00-\x1F\x7F]/g, '')
      // replace characters that break URLs (#, %, &) or are reserved on
      // common filesystems (< > : " | ? *) with a hyphen
      .replace(/[<>:"|?*#%&]/g, '-')
      // collapse the separator runs the steps above can introduce
      .replace(/-+/g, '-');

  let base = clean(rawBase).replace(/^[.\-]+|[.\-]+$/g, '');
  const ext = clean(rawExt);

  if (!base) base = 'file';

  if (base.length > MAX_BASENAME_LENGTH) {
    base = base.slice(0, MAX_BASENAME_LENGTH).replace(/[.\-]+$/, '') || 'file';
  }

  return `${base}${ext}`;
};
