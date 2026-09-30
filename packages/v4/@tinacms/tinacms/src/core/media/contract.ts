// ADR-022: a media path is relative to the media root (`posts/hero.jpg`), never a
// URL. The provider turns a path into a URL with `resolveUrl`.
export interface MediaItem {
  path: string;
  kind: 'file' | 'directory';
}

export interface MediaPageRequest {
  cursor?: string;
  limit?: number;
}

export interface MediaPage {
  items: MediaItem[];
  cursor?: string;
}

export interface MediaProvider {
  upload(file: File, folder?: string): Promise<string>;
  list(folder: string, page?: MediaPageRequest): Promise<MediaPage>;
  delete(path: string): Promise<void>;
  resolveUrl(path: string): string;
}

export type MediaSlice = MediaProvider;

export const DEFAULT_MEDIA_URL = '/api/tina/media';

export const DEFAULT_MEDIA_ROOT = 'uploads';
