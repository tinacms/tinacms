// ADR-022: a media path is relative to the media root (`posts/hero.jpg`), never a
// URL. The provider turns a path into a URL with `resolveUrl`.
export interface MediaItem {
  path: string;
  kind: 'file' | 'directory';
}

export interface MediaPageRequest {
  cursor?: string;
  limit?: number;
  search?: string;
  /** Lowercase extensions without the dot, for example `['jpg', 'png']`. */
  extensions?: string[];
}

export interface MediaPage {
  items: MediaItem[];
  cursor?: string;
}

export interface MediaUrlOptions {
  width?: number;
  height?: number;
}

export interface MediaFeatures {
  search?: boolean;
  extensionFilter?: boolean;
  /** MIME types, or `type/*` wildcards: `image/*`, `application/pdf`. */
  acceptedMimeTypes?: string[];
  /** Extensions, lowercase and without the dot: `svg`, `pdf`. */
  acceptedExtensions?: string[];
  /** Bytes. */
  maxSize?: number;
  readOnly?: boolean;
}

export type MediaStatus =
  | { kind: 'ready' }
  | {
      kind: 'needs-setup';
      message: string;
      actionLabel: string;
      actionUrl: string;
    };

const MEDIA_ERROR_MESSAGES = {
  'not-found': 'This file no longer exists. Refresh and try again.',
  'name-taken': 'A file with that name already exists in this folder.',
  'invalid-name':
    "That name isn't valid. Avoid slashes and special characters.",
  'invalid-path': "That file name or folder isn't valid.",
  'too-large': 'That file is too large to upload.',
  unauthorized: "You don't have permission to do that.",
  unsupported: "This media store doesn't support that.",
  'backend-failure': 'Something went wrong. Please try again.',
} satisfies Record<string, string>;

export type MediaErrorCode = keyof typeof MEDIA_ERROR_MESSAGES;

export const isMediaErrorCode = (value: unknown): value is MediaErrorCode =>
  typeof value === 'string' && value in MEDIA_ERROR_MESSAGES;

/** `message` is the sentence to show the user; `detail` is the technical reason. */
export class MediaError extends Error {
  readonly code: MediaErrorCode;
  readonly detail?: string;

  constructor(code: MediaErrorCode, detail?: string) {
    super(MEDIA_ERROR_MESSAGES[code]);
    this.name = 'MediaError';
    this.code = code;
    this.detail = detail;
  }
}

/** Each operation reports a known failure as a `MediaError`. */
export interface MediaProvider {
  upload(file: File, folder?: string): Promise<string>;
  list(folder: string, page?: MediaPageRequest): Promise<MediaPage>;
  delete(path: string): Promise<void>;
  // ADR-022 §5: a provider without transforms ignores `options` and returns
  // the original URL.
  resolveUrl(path: string, options?: MediaUrlOptions): string;
  /** Resolves to the new media path. */
  rename?(from: string, to: string): Promise<string>;
  features?: MediaFeatures;
  status?(): Promise<MediaStatus>;
}

export type MediaSlice = MediaProvider;

export const DEFAULT_MEDIA_URL = '/api/tina/media';

export const DEFAULT_MEDIA_ROOT = 'uploads';
