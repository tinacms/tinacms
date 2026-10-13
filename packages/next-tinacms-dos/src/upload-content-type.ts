// NOTE: Duplicated byte-for-byte in next-tinacms-s3 and next-tinacms-dos, which share
// no runtime module. tests/upload-content-type.test.ts keeps the copies in step.

const MEDIA_TYPE = /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/;

// Browsers sniff the body when the type is one of these.
const SNIFFED_TYPES = new Set(['unknown/unknown', 'application/unknown']);

const DOCUMENT_ARCHIVE_TYPES = new Set([
  'message/rfc822',
  'application/x-mimearchive',
]);

const SVG_EXTENSIONS = new Set(['svg', 'svgz']);

// Browsers run these types as documents. Keep in sync with the extensions in upload-type.ts.
const isActiveDocumentType = (type: string): boolean => {
  const subtype = type.slice(type.indexOf('/') + 1);
  return (
    DOCUMENT_ARCHIVE_TYPES.has(type) ||
    // WebKit renders multipart/x-mixed-replace as a document, and no media file is multipart.
    type.startsWith('multipart/') ||
    subtype.includes('html') ||
    subtype === 'xml' ||
    subtype.endsWith('+xml') ||
    subtype.startsWith('xml-') ||
    subtype === 'xsl' ||
    /(java|ecma|j|live)script/.test(subtype)
  );
};

// Values match the `File.type` that browsers report for each extension.
const TYPES_BY_EXTENSION: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  svg: 'image/svg+xml',
  bmp: 'image/bmp',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  ogv: 'video/ogg',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  pdf: 'application/pdf',
  txt: 'text/plain',
  csv: 'text/csv',
  json: 'application/json',
  zip: 'application/zip',
};

const keyExtension = (key: string): string => {
  const name = key.split('/').pop() || '';
  const dot = name.lastIndexOf('.');
  return dot < 0 ? '' : name.slice(dot + 1).toLowerCase();
};

/**
 * Returns the normalized content type for an upload to `key`, or `null` when
 * the type is malformed or not allowed for that key. If `contentType` is
 * `undefined`, use the type for the key's extension.
 */
export const resolveUploadContentType = (
  key: string,
  contentType: unknown
): string | null => {
  if (contentType === undefined) {
    const extension = keyExtension(key);
    return Object.prototype.hasOwnProperty.call(TYPES_BY_EXTENSION, extension)
      ? TYPES_BY_EXTENSION[extension]
      : null;
  }
  if (typeof contentType !== 'string') return null;
  const type = contentType.trim().toLowerCase();
  if (!MEDIA_TYPE.test(type) || SNIFFED_TYPES.has(type)) return null;
  if (type === 'image/svg+xml') {
    return SVG_EXTENSIONS.has(keyExtension(key)) ? type : null;
  }
  return isActiveDocumentType(type) ? null : type;
};
