// Keep this file free of runtime imports. Media handlers load it as its own
// entry point, without the root bundle.

/** The media types an upload may have when `media.accept` is not set. */
export const DEFAULT_MEDIA_ACCEPT: readonly string[] = Object.freeze([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/tiff',
  'image/bmp',
  'image/heic',
  'image/heif',
  'text/plain',
  'text/csv',
  'text/markdown',
  'text/vtt',
  'audio/*',
  'video/*',
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
  'application/mxf',
]);

/** The MIME type for a lowercased file extension without the dot. */
export const MEDIA_EXTENSION_MIME_TYPES: Readonly<Record<string, string>> =
  Object.freeze({
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    jpe: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    avif: 'image/avif',
    ico: 'image/x-icon',
    tif: 'image/tiff',
    tiff: 'image/tiff',
    bmp: 'image/bmp',
    heic: 'image/heic',
    heif: 'image/heif',
    txt: 'text/plain',
    csv: 'text/csv',
    md: 'text/markdown',
    markdown: 'text/markdown',
    vtt: 'text/vtt',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    oga: 'audio/ogg',
    opus: 'audio/ogg',
    m4a: 'audio/mp4',
    aac: 'audio/aac',
    flac: 'audio/flac',
    weba: 'audio/webm',
    mid: 'audio/midi',
    midi: 'audio/midi',
    mp4: 'video/mp4',
    m4v: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    ogv: 'video/ogg',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska',
    mpeg: 'video/mpeg',
    mpg: 'video/mpeg',
    '3gp': 'video/3gpp',
    pdf: 'application/pdf',
    json: 'application/json',
    jsonld: 'application/ld+json',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ps: 'application/postscript',
    eps: 'application/postscript',
    ai: 'application/postscript',
    fbx: 'model/fbx',
    gltf: 'model/gltf+json',
    ply: 'model/ply',
    u3d: 'model/u3d+mesh',
    usdz: 'model/vnd.usdz+zip',
    indd: 'application/x-indesign',
    m3u8: 'application/vnd.apple.mpegurl',
    mxf: 'application/mxf',
    html: 'text/html',
    htm: 'text/html',
    shtml: 'text/html',
    xhtml: 'application/xhtml+xml',
    xht: 'application/xhtml+xml',
    svg: 'image/svg+xml',
    svgz: 'image/svg+xml',
    xml: 'application/xml',
    xsl: 'application/xslt+xml',
    xslt: 'application/xslt+xml',
    js: 'text/javascript',
    mjs: 'text/javascript',
    cjs: 'text/javascript',
    css: 'text/css',
    swf: 'application/x-shockwave-flash',
    mht: 'multipart/related',
    mhtml: 'multipart/related',
    hta: 'application/hta',
    mpd: 'application/dash+xml',
    rdf: 'application/rdf+xml',
    atom: 'application/atom+xml',
    rss: 'application/rss+xml',
    opml: 'text/x-opml',
  });

const RESTRICTED_EXTENSIONS = new Set([
  'html',
  'htm',
  'shtml',
  'xhtml',
  'xht',
  'svg',
  'svgz',
  'xml',
  'xsl',
  'xslt',
  'js',
  'mjs',
  'cjs',
  'css',
  'swf',
  'mht',
  'mhtml',
  'hta',
  'mpd',
  'rdf',
  'atom',
  'rss',
  'opml',
]);

const RESTRICTED_MIME_TYPES = new Set([
  'text/html',
  'application/xhtml+xml',
  'image/svg+xml',
  'text/xml',
  'application/xml',
  'text/xsl',
  'text/css',
  'application/x-shockwave-flash',
  'application/hta',
  'multipart/related',
  'multipart/x-mixed-replace',
  'application/ecmascript',
  'application/javascript',
  'application/x-ecmascript',
  'application/x-javascript',
  'text/ecmascript',
  'text/javascript',
  'text/javascript1.0',
  'text/javascript1.1',
  'text/javascript1.2',
  'text/javascript1.3',
  'text/javascript1.4',
  'text/javascript1.5',
  'text/jscript',
  'text/livescript',
  'text/x-ecmascript',
  'text/x-javascript',
]);

// Browsers guess the type of a file served with one of these.
const UNKNOWN_MIME_TYPES = new Set(['unknown/unknown', 'application/unknown']);

const TOKEN = "[!#$%&'*+.^_`|~0-9a-z-]+";
const MIME_TYPE = new RegExp(`^${TOKEN}/${TOKEN}$`);
const MIME_WILDCARD = new RegExp(`^${TOKEN}/\\*$`);
const EXTENSION_ENTRY = /^\.[^./\\\s]+$/;
const CONTROL_CHARACTER = /[\u0000-\u001f\u007f]/;

const isRestrictedMimeType = (type: string) =>
  RESTRICTED_MIME_TYPES.has(type) || type.endsWith('+xml');

export type UploadTypeResult =
  | { allowed: true; contentType: string; restricted: boolean }
  | { allowed: false; reason: 'name' | 'type'; extension: string };

/**
 * Every dot-separated part of a file name after the first part, lowercased.
 * The name is read literally: `?` and `#` are ordinary characters.
 */
export function uploadExtensions(filename: string): string[] {
  return filename
    .split('.')
    .slice(1)
    .map((part) => part.toLowerCase());
}

/** Whether a single path segment can be used as the name of an upload. */
export function isUploadNameAllowed(filename: string): boolean {
  if (typeof filename !== 'string' || filename === '') return false;
  if (filename.includes('/') || filename.includes('\\')) return false;
  if (filename.startsWith('.')) return false;
  if (filename.endsWith('.') || /\s$/.test(filename)) return false;
  if (filename.includes(':')) return false;
  if (CONTROL_CHARACTER.test(filename)) return false;
  return true;
}

function parseAccept(accept: string | string[] | undefined): Set<string> {
  const raw = Array.isArray(accept) ? accept : [accept];
  const entries = new Set<string>();
  for (const item of raw) {
    if (typeof item !== 'string') continue;
    for (const part of item.split(',')) {
      const entry = part.trim().toLowerCase();
      if (entry === '*' || entry === '*/*') {
        entries.add('*/*');
      } else if (
        EXTENSION_ENTRY.test(entry) ||
        MIME_TYPE.test(entry) ||
        MIME_WILDCARD.test(entry)
      ) {
        entries.add(entry);
      }
    }
  }
  if (entries.size > 0) return entries;
  return parseAccept([...DEFAULT_MEDIA_ACCEPT]);
}

function declaredType(contentType: string): string | undefined {
  const type = contentType.split(';')[0].trim().toLowerCase();
  if (!MIME_TYPE.test(type)) return undefined;
  if (type.includes('*') || UNKNOWN_MIME_TYPES.has(type)) return undefined;
  return type;
}

/**
 * Check an upload's file name and declared content type against an
 * `accept` list in the `media.accept` format. When `accept` has no valid
 * entry, `DEFAULT_MEDIA_ACCEPT` applies. Some types need an exact entry: a
 * wildcard does not admit them, and `restricted` is true in the result.
 */
export function checkUploadType(
  input: { filename: string; contentType?: string },
  accept?: string | string[]
): UploadTypeResult {
  const { filename, contentType } = input;
  if (!isUploadNameAllowed(filename)) {
    return { allowed: false, reason: 'name', extension: '' };
  }

  const parts = uploadExtensions(filename);
  const finalExtension = parts.length > 0 ? parts[parts.length - 1] : '';
  const rejectType = (extension: string): UploadTypeResult => ({
    allowed: false,
    reason: 'type',
    extension,
  });

  let type: string;
  if (typeof contentType === 'string' && contentType.trim() !== '') {
    const declared = declaredType(contentType);
    if (!declared) return rejectType(finalExtension);
    type = declared;
  } else {
    type =
      MEDIA_EXTENSION_MIME_TYPES[finalExtension] ?? 'application/octet-stream';
  }

  const entries = parseAccept(accept);
  const isExtensionGranted = (extension: string) =>
    extension !== '' &&
    (entries.has(`.${extension}`) ||
      entries.has(MEDIA_EXTENSION_MIME_TYPES[extension]));

  const restrictedParts = parts.filter((part) =>
    RESTRICTED_EXTENSIONS.has(part)
  );
  const typeIsRestricted = isRestrictedMimeType(type);

  for (const part of restrictedParts) {
    if (!isExtensionGranted(part)) return rejectType(part);
  }
  if (
    typeIsRestricted &&
    !entries.has(type) &&
    !(
      isExtensionGranted(finalExtension) &&
      MEDIA_EXTENSION_MIME_TYPES[finalExtension] === type
    )
  ) {
    return rejectType(finalExtension);
  }

  const [mediaType] = type.split('/');
  const matches =
    entries.has(type) ||
    entries.has(`${mediaType}/*`) ||
    entries.has('*/*') ||
    (finalExtension !== '' && entries.has(`.${finalExtension}`));
  if (!matches) return rejectType(finalExtension);

  return {
    allowed: true,
    contentType: type,
    restricted: restrictedParts.length > 0 || typeIsRestricted,
  };
}
