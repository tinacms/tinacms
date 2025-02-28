/**

*/

import type {
  Media,
  MediaList,
  MediaListOptions,
  MediaStore,
  MediaUploadOptions,
} from 'tinacms';
import { DEFAULT_MEDIA_UPLOAD_TYPES } from 'tinacms';
const s3ErrorRegex = /<Error>.*<Code>(.+)<\/Code>.*<Message>(.+)<\/Message>.*/;

import { E_UNAUTHORIZED, E_BAD_ROUTE, interpretErrorMessage } from './errors';

export class S3MediaStore implements MediaStore {
  fetchFunction = (input: RequestInfo, init?: RequestInit) => {
    return fetch(input, init);
  };
  accept = DEFAULT_MEDIA_UPLOAD_TYPES;
  basePath = '';

  protected fetchWithBasePath(path: string, init?: RequestInit) {
    const fullPath = this.getFullPath(path);
    const normalizedPath = fullPath.startsWith('/') ? fullPath : `/${fullPath}`;
    return this.fetchFunction(normalizedPath, init);
  }

  protected getFullPath(path: string): string {
    return `${this.basePath}${path}`;
  }

  async persist(media: MediaUploadOptions[]): Promise<Media[]> {
    const newFiles: Media[] = [];

    for (const item of media) {
      let directory = item.directory;
      if (directory?.endsWith('/')) {
        directory = directory.substr(0, directory.length - 1);
      }
      const path = `${
        directory && directory !== '/'
          ? `${directory}/${item.file.name}`
          : item.file.name
      }`;

      const res = await this.fetchWithBasePath(
        `/api/s3/media/upload_url?key=${path}`,
        {
          method: 'GET',
        }
      );

      if (res.status != 200) {
        const responseData = await res.json();
        throw new Error(responseData.message);
      }
      const { signedUrl, src } = await res.json();
      if (!signedUrl || !src) {
        throw new Error('Unexpected error generating upload url');
      }

      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        body: item.file,
        headers: {
          'Content-Type': item.file.type || 'application/octet-stream',
        },
      });

      if (!uploadRes.ok) {
        const xmlRes = await uploadRes.text();
        const matches = s3ErrorRegex.exec(xmlRes);
        console.error(xmlRes);
        if (!matches) {
          throw new Error('Unexpected error uploading media asset');
        } else {
          throw new Error(`Upload error: '${matches[2]}'`);
        }
      }

      /**
       * Images uploaded to S3 aren't instantly available via the API;
       * waiting a couple seconds here seems to ensure they show up in the next fetch.
       */
      await new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });
      /**
       * Format the response from S3 to match Media interface
       * Valid S3 `resource_type` values: `image`, `video`, `raw` and `auto`
       * uploading a directory is not supported as such, type is defaulted to `file`
       */

      newFiles.push({
        directory: item.directory,
        filename: item.file.name,
        id: item.file.name,
        type: 'file',
        thumbnails: {
          '75x75': src,
          '400x400': src,
          '1000x1000': src,
        },
        src,
      });
    }
    return newFiles;
  }
  async delete(media: Media) {
    await this.fetchWithBasePath(
      `/api/s3/media/${encodeURIComponent(media.id)}`,
      {
        method: 'DELETE',
      }
    );
  }
  async list(options: MediaListOptions): Promise<MediaList> {
    const query = this.buildQuery(options);
    const response = await this.fetchWithBasePath('/api/s3/media' + query);

    if (response.status == 401) {
      throw E_UNAUTHORIZED;
    }
    if (response.status == 404) {
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

  parse = (img) => {
    return img.src;
  };

  private buildQuery(options: MediaListOptions) {
    const params = Object.keys(options)
      .filter((key) => options[key] !== '' && options[key] !== undefined)
      .map((key) => `${key}=${options[key]}`)
      .join('&');

    return `?${params}`;
  }
}
