import {
  MEDIA_MIME_TYPES,
  type MediaExtension,
  extensionOf,
} from '@tinacms/schema-tools';
import type { Accept } from 'react-dropzone';

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
 * react-dropzone's `accept` shape for a field's resolved extensions, keyed by
 * MIME type with the extensions as values. Bare extension keys would be
 * dropped from the native file picker, which then offers every file and only
 * rejects the choice afterwards.
 *
 * Returns undefined for an empty list so callers fall through to the global
 * `media.accept`.
 */
export const dropzoneAcceptFromExtensions = (
  extensions: MediaExtension[]
): Accept | undefined => {
  if (!extensions.length) return undefined;

  const accept: Accept = {};
  for (const ext of extensions) {
    const mimeType = MEDIA_MIME_TYPES[ext];
    accept[mimeType] ??= [];
    accept[mimeType].push(`.${ext}`);
  }
  return accept;
};

/**
 * Which extensions get a thumbnail rather than a file icon. Deliberately not
 * `MEDIA_CATEGORIES.image`: that drives the `accept` filter and the two lists
 * differ — `tiff` previews, `ico` does not.
 */
const PREVIEWABLE_IMAGE_EXTENSIONS = new Set([
  'gif',
  'jpg',
  'jpeg',
  'tiff',
  'png',
  'svg',
  'webp',
  'avif',
]);

const PREVIEWABLE_VIDEO_EXTENSIONS = new Set([
  'mp4',
  'webm',
  'ogg',
  'm4v',
  'mov',
  'avi',
  'flv',
  'mkv',
]);

export const isImage = (filename: string): boolean =>
  PREVIEWABLE_IMAGE_EXTENSIONS.has(extensionOf(filename ?? ''));

export const isVideo = (filename: string): boolean =>
  PREVIEWABLE_VIDEO_EXTENSIONS.has(extensionOf(filename ?? ''));

export const absoluteImgURL = (str: string) => {
  if (str.startsWith('http')) return str;
  return `${window.location.origin}${str}`;
};

// Longest base name (excluding extension) we keep. Stays well under the
// common 255-byte filesystem limit and the 1024-char S3 key limit even after
// a directory prefix is prepended.
const MAX_BASENAME_LENGTH = 200;

// Stands in for a base name that sanitizes away to nothing.
const FALLBACK_NAME = 'file';

/**
 * Splits a filename into its base and extension using the same final-dot rule
 * as {@link sanitizeFilename}, so both agree on what the extension is.
 */
export const splitFilename = (
  filename: string
): { base: string; ext: string } => {
  const lastDot = filename.lastIndexOf('.');
  const hasExt = lastDot > 0 && lastDot < filename.length - 1;
  return {
    base: hasExt ? filename.slice(0, lastDot) : filename,
    ext: hasExt ? filename.slice(lastDot) : '',
  };
};

/**
 * Normalizes filenames to NFC and replaces characters that are unsafe for
 * URLs or common filesystems with a hyphen, while preserving the extension.
 *
 * Example: `image-a\u0308.jpg` becomes `image-ä.jpg`,
 * so URLs use `%C3%A4` instead of the decomposed `%CC%88` sequence.
 */
export const sanitizeFilename = (filename: string): string => {
  if (!filename) return FALLBACK_NAME;

  const normalized = filename.normalize('NFC');
  const justName = normalized.split(/[\\/]/).pop() || '';
  const { base: rawBase, ext: rawExt } = splitFilename(justName);

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

  if (!base) base = FALLBACK_NAME;

  if (base.length > MAX_BASENAME_LENGTH) {
    base =
      base.slice(0, MAX_BASENAME_LENGTH).replace(/[.\-]+$/, '') ||
      FALLBACK_NAME;
  }

  return `${base}${ext}`;
};

/**
 * Validation and preview for the rename modal, given what the editor has typed
 * and the file's current name.
 *
 * The base is sanitized on its own and the extension re-attached afterwards, so
 * a base containing slashes or dots can never rewrite or drop the extension.
 */
export const previewRename = (input: string, currentFilename: string) => {
  const base = input.trim();
  const extension = splitFilename(currentFilename).ext;
  const sanitizedBase = sanitizeFilename(base);
  const sanitized = `${sanitizedBase}${extension}`;

  const isEmpty = base.length === 0;
  // Nothing usable survived, so sanitizeFilename fell back to its placeholder
  // rather than producing something derived from the input.
  const isStripped =
    !isEmpty && sanitizedBase === FALLBACK_NAME && base !== FALLBACK_NAME;
  const usable = !isEmpty && !isStripped;

  return {
    sanitized,
    extension,
    valid: usable && sanitized !== currentFilename,
    preview: usable && sanitized !== `${base}${extension}` ? sanitized : null,
    hint: isEmpty
      ? 'Enter a file name.'
      : isStripped
        ? "That name isn't valid. Try using letters, numbers or hyphens."
        : null,
  };
};
