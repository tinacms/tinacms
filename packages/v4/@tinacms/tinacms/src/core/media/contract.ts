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

export type MediaRenameErrorCode =
  | 'not-found'
  | 'name-taken'
  | 'invalid-name'
  | 'invalid-path'
  | 'unauthorized'
  | 'unsupported'
  | 'backend-failure';

export class MediaRenameError extends Error {
  readonly code: MediaRenameErrorCode;

  constructor(code: MediaRenameErrorCode, message: string) {
    super(message);
    this.name = 'MediaRenameError';
    this.code = code;
  }
}

export interface MediaProvider {
  upload(file: File, folder?: string): Promise<string>;
  list(folder: string, page?: MediaPageRequest): Promise<MediaPage>;
  delete(path: string): Promise<void>;
  // ADR-022 §5: a provider without transforms ignores `options` and returns
  // the original URL.
  resolveUrl(path: string, options?: MediaUrlOptions): string;
  /** Resolves to the new media path. Throws `MediaRenameError`. */
  rename?(from: string, to: string): Promise<string>;
  features?: MediaFeatures;
  status?(): Promise<MediaStatus>;
}

export type MediaSlice = MediaProvider;

export const DEFAULT_MEDIA_URL = '/api/tina/media';

export const DEFAULT_MEDIA_ROOT = 'uploads';
