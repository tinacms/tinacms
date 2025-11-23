import type {
  Media,
  MediaList,
  MediaListOptions,
  MediaStore,
  MediaUploadOptions,
} from 'tinacms';
import { DEFAULT_MEDIA_UPLOAD_TYPES } from 'tinacms';
import { E_UNAUTHORIZED, E_BAD_ROUTE, interpretErrorMessage } from './errors';

export type AzureMediaStoreOptions = {
  baseUrl?: string;
};

export class AzureMediaStore implements MediaStore {
  baseUrl: string;
  constructor(options?: AzureMediaStoreOptions) {
    this.baseUrl = options?.baseUrl || '/api/azure/media';
  }
  fetchFunction = (input: RequestInfo, init?: RequestInit) =>
    fetch(input, init);

  accept = DEFAULT_MEDIA_UPLOAD_TYPES;

  async persist(media: MediaUploadOptions[]): Promise<Media[]> {
    const newFiles: Media[] = [];

    for (const item of media) {
      const { file, directory } = item;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('directory', directory);
      formData.append('filename', file.name);

      const res = await this.fetchFunction(this.baseUrl, {
        method: 'POST',
        body: formData,
      });

      if (res.status !== 200) {
        const responseData = await res.json();
        throw new Error(responseData.message);
      }
      const fileRes = await res.json();

      const parsedRes: Media = {
        type: 'file',
        id: fileRes.name,
        filename: fileRes.filename,
        directory: '/',
        thumbnails: {
          '75x75': fileRes.url,
          '400x400': fileRes.url,
          '1000x1000': fileRes.url,
        },
        src: fileRes.url,
      };

      newFiles.push(parsedRes);
    }
    return newFiles;
  }
  async delete(media: Media) {
    await this.fetchFunction(
      `${this.baseUrl}/${encodeURIComponent(media.id)}`,
      {
        method: 'DELETE',
      }
    );
  }
  async list(options: MediaListOptions): Promise<MediaList> {
    const query = this.buildQuery(options);
    const response = await this.fetchFunction(this.baseUrl + query);

    if (response.status === 401) {
      throw E_UNAUTHORIZED;
    }
    if (response.status === 404) {
      throw E_BAD_ROUTE;
    }
    if (response.status >= 500) {
      const { e } = await response.json();
      const error = interpretErrorMessage(e);
      throw error;
    }
    const { items, offset } = await response.json();
    return {
      items: items.map((item) => item),
      nextOffset: offset,
    };
  }

  parse = (img: Media) => {
    return img.src;
  };

  buildQuery(options: MediaListOptions): string {
    const params = Object.entries(options)
      .filter(([_, value]) => value !== '' && value !== undefined)
      .map(([key, value]) => {
        return typeof value === 'object'
          ? `${key}=${encodeURIComponent(JSON.stringify(value))}`
          : `${key}=${encodeURIComponent(String(value))}`;
      })
      .join('&');

    return `?${params}`;
  }
}
