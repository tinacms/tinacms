const MEDIA = {
  jpg: { mime: 'image/jpeg', category: 'image' },
  jpeg: { mime: 'image/jpeg', category: 'image' },
  png: { mime: 'image/png', category: 'image' },
  gif: { mime: 'image/gif', category: 'image' },
  webp: { mime: 'image/webp', category: 'image' },
  svg: { mime: 'image/svg+xml', category: 'image' },
  avif: { mime: 'image/avif', category: 'image' },
  ico: { mime: 'image/x-icon', category: 'image' },

  mp4: { mime: 'video/mp4', category: 'video' },
  webm: { mime: 'video/webm', category: 'video' },
  mov: { mime: 'video/quicktime', category: 'video' },

  mp3: { mime: 'audio/mpeg', category: 'audio' },
  wav: { mime: 'audio/wav', category: 'audio' },
  ogg: { mime: 'audio/ogg', category: 'audio' },

  pdf: { mime: 'application/pdf', category: 'document' },
  json: { mime: 'application/json', category: 'document' },
  csv: { mime: 'text/csv', category: 'document' },
  txt: { mime: 'text/plain', category: 'document' },
} as const;

export type MediaExtension = keyof typeof MEDIA;
type MediaTypeEntry = (typeof MEDIA)[MediaExtension];
export type MediaCategory = MediaTypeEntry['category'];
export type MediaAccept = MediaExtension | MediaCategory;

export const MEDIA_CATEGORY_LABELS: Record<MediaCategory, string> = {
  image: 'Images',
  video: 'Video',
  audio: 'Audio',
  document: 'Documents',
};

export const MEDIA_KIND_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'folders', label: 'Folders' },
  { value: 'files', label: 'Files' },
] as const;

export type MediaKindFilter = (typeof MEDIA_KIND_OPTIONS)[number]['value'];

export type MediaTypeFilterValue = MediaCategory | 'all';

export type MediaViewMode = 'grid' | 'list';

const EXTENSIONS = Object.keys(MEDIA) as MediaExtension[];

const extensionsWhere = (
  match: (entry: MediaTypeEntry) => boolean
): MediaExtension[] => EXTENSIONS.filter((ext) => match(MEDIA[ext]));

export const extensionsForCategory = (
  category: MediaCategory
): MediaExtension[] => extensionsWhere((entry) => entry.category === category);

export const DEFAULT_MEDIA_UPLOAD_TYPES = [
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

const isMediaExtension = (value: string): value is MediaExtension =>
  value in MEDIA;

export const extensionOf = (value: string): string => {
  const path = value.split(/[?#]/)[0] ?? '';
  const dot = path.lastIndexOf('.');
  const slash = path.lastIndexOf('/');
  return dot > slash + 1 ? path.slice(dot + 1).toLowerCase() : '';
};

export const mediaNameOf = (path: string): string =>
  path.split('/').at(-1) ?? path;

export const joinMediaPath = (folder: string, name: string): string =>
  folder ? `${folder}/${name}` : name;

export const resolveMediaAccept = (
  accept?: MediaAccept | MediaAccept[]
): MediaExtension[] => [
  ...new Set(
    [accept ?? []]
      .flat()
      .flatMap((value) =>
        isMediaExtension(value)
          ? extensionsWhere((entry) => entry.mime === MEDIA[value].mime)
          : extensionsForCategory(value)
      )
  ),
];

export interface UploadRules {
  mimeTypes: string[];
  extensions: string[];
}

export const DEFAULT_UPLOAD_RULES: UploadRules = {
  mimeTypes: DEFAULT_MEDIA_UPLOAD_TYPES,
  extensions: [],
};

export const uploadRulesOf = (extensions: MediaExtension[]): UploadRules => ({
  mimeTypes: [...new Set(extensions.map((ext) => MEDIA[ext].mime))],
  extensions,
});

export const inputAcceptOf = ({ mimeTypes, extensions }: UploadRules): string =>
  [...mimeTypes, ...extensions.map((ext) => `.${ext}`)].join(',');

export const acceptEntryLabel = (entry: MediaAccept): string =>
  isMediaExtension(entry) ? entry.toUpperCase() : MEDIA_CATEGORY_LABELS[entry];

const mimeTypeOf = (file: File): string => {
  if (file.type) return file.type;
  const ext = extensionOf(file.name);
  return isMediaExtension(ext) ? MEDIA[ext].mime : '';
};

const matchesMimeType = (file: File, mimeType: string): boolean => {
  const rule = mimeType.trim().toLowerCase();
  if (rule === '*/*') return true;
  const type = mimeTypeOf(file).toLowerCase();
  if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
  return type === rule;
};

const isAccepted = (file: File, rules: UploadRules): boolean =>
  rules.mimeTypes.some((mimeType) => matchesMimeType(file, mimeType)) ||
  rules.extensions.includes(extensionOf(file.name));

export const uploadRejectionOf = (
  file: File,
  rules: UploadRules,
  maxSize: number | undefined
): string | null => {
  const reasons: string[] = [];
  if (!isAccepted(file, rules)) {
    reasons.push('Invalid file type');
  }
  if (maxSize !== undefined && file.size > maxSize) {
    reasons.push('File too large');
  }
  return reasons.length > 0 ? reasons.join(', ') : null;
};

// Not the `image` category: `tiff` gets a preview, `ico` does not.
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
  PREVIEWABLE_IMAGE_EXTENSIONS.has(extensionOf(filename));

export const isVideo = (filename: string): boolean =>
  PREVIEWABLE_VIDEO_EXTENSIONS.has(extensionOf(filename));

export const typeBadgeOf = (filename: string): string | null => {
  const name = mediaNameOf(filename);
  if (name.startsWith('.')) return null;
  const ext = name.split('.').pop()?.toLowerCase();
  if (!ext || ext === name.toLowerCase() || ext.length > 5) return null;
  return ext === 'jpg' ? 'JPEG' : ext.toUpperCase();
};

export const absoluteUrlOf = (url: string): string =>
  new URL(url, window.location.origin).href;

const MAX_BASENAME_LENGTH = 200;

const FALLBACK_NAME = 'file';

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

// NFC keeps `ä` as one code point, so the URL holds `%C3%A4` and not a
// decomposed `%CC%88` sequence.
export const sanitizeFilename = (filename: string): string => {
  if (!filename) return FALLBACK_NAME;

  const normalized = filename.normalize('NFC');
  const justName = normalized.split(/[\\/]/).pop() ?? '';
  const { base: rawBase, ext: rawExt } = splitFilename(justName);

  const clean = (input: string) =>
    input
      .replace(/\s+/g, '-')
      .replace(/[\x00-\x1F\x7F]/g, '')
      .replace(/[<>:"|?*#%&]/g, '-')
      .replace(/-+/g, '-');

  let base = clean(rawBase).replace(/^[.-]+|[.-]+$/g, '');
  const ext = clean(rawExt);

  if (!base) base = FALLBACK_NAME;

  if (base.length > MAX_BASENAME_LENGTH) {
    base =
      base.slice(0, MAX_BASENAME_LENGTH).replace(/[.-]+$/, '') || FALLBACK_NAME;
  }

  return `${base}${ext}`;
};

// The base is sanitized alone and the extension added after, so a base with
// slashes or dots cannot change or remove the extension.
export const previewRename = (input: string, currentFilename: string) => {
  const base = input.trim();
  const extension = splitFilename(currentFilename).ext;
  const sanitizedBase = sanitizeFilename(base);
  const sanitized = `${sanitizedBase}${extension}`;

  const isEmpty = base.length === 0;
  const isStripped =
    !isEmpty && sanitizedBase === FALLBACK_NAME && base !== FALLBACK_NAME;
  const usable = !isEmpty && !isStripped;

  let hint: string | null = null;
  if (isEmpty) {
    hint = 'Enter a file name.';
  } else if (isStripped) {
    hint = "That name isn't valid. Try using letters, numbers or hyphens.";
  }

  return {
    sanitized,
    extension,
    valid: usable && sanitized !== currentFilename,
    preview: usable && sanitized !== `${base}${extension}` ? sanitized : null,
    hint,
  };
};
