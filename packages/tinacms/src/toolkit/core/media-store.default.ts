import { DEFAULT_MEDIA_UPLOAD_TYPES } from '@toolkit/components/media/utils';
import { formatBranchName } from '@toolkit/plugin-branch-switcher/format-branch-name';
import type { TinaCMS } from '@toolkit/tina-cms';
import type { Client } from '../../internalClient';
import { runEditorialWorkflow } from '../form-builder/run-editorial-workflow';
import { CMS } from './cms';
import {
  E_BAD_ROUTE,
  E_UNAUTHORIZED,
  Media,
  MediaList,
  MediaListOptions,
  MediaStore,
  MediaUploadOptions,
} from './media';

const MEDIA_OP_TIMEOUT_MS = 30000;

interface MediaWorkflowBranchSwitchedEvent {
  type: 'media:workflow:branch-switched';
  branchName: string;
}

const s3ErrorRegex = /<Error>.*<Code>(.+)<\/Code>.*<Message>(.+)<\/Message>.*/;

export class DummyMediaStore implements MediaStore {
  accept = '*';
  async persist(files: MediaUploadOptions[]): Promise<Media[]> {
    return files.map(({ directory, file }) => ({
      id: file.name,
      type: 'file',
      directory,
      filename: file.name,
    }));
  }
  async list(): Promise<MediaList> {
    const items: Media[] = [];
    return {
      items,
      nextOffset: 0,
    };
  }
  async delete() {
    // Unnecessary
  }
}

interface StaticMediaItem {
  id: string;
  filename: string;
  src: string;
  directory: string;
  thumbnails: {
    '75x75': string;
    '400x400': string;
    '1000x1000': string;
  };
  type: 'file' | 'dir';
  children?: StaticMedia;
}
export interface StaticMedia {
  [offset: string]: StaticMediaItem[];
}

export class TinaMediaStore implements MediaStore {
  fetchFunction = (input: RequestInfo, init?: RequestInit) => {
    return fetch(input, init);
  };

  private api: Client;
  private cms: CMS;
  private isLocal: boolean;
  private url: string;
  private staticMedia: StaticMedia;
  isStatic?: boolean;

  constructor(cms: CMS, staticMedia?: StaticMedia) {
    this.cms = cms;
    if (staticMedia && Object.keys(staticMedia).length > 0) {
      this.isStatic = true;
      this.staticMedia = staticMedia;
    }
  }

  setup() {
    if (!this.api) {
      this.api = this.cms?.api?.tina;

      this.isLocal = !!this.api.isLocalMode;

      if (!this.isStatic) {
        const contentApiUrl = new URL(this.api.contentApiUrl);
        this.url = `${contentApiUrl.origin}/media`;
        if (!this.isLocal) {
          // TODO: type options
          // @ts-ignore
          if (this.api.options?.tinaioConfig?.assetsApiUrlOverride) {
            const url = new URL(this.api.assetsApiUrl);
            this.url = `${url.origin}/v1/${this.api.clientId}`;
          } else {
            this.url = `${contentApiUrl.origin.replace(
              'content',
              'assets'
            )}/v1/${this.api.clientId}`;
          }
        }
      }
    }
  }

  async isAuthenticated() {
    this.setup();
    return await this.api.authProvider.isAuthenticated();
  }

  accept = DEFAULT_MEDIA_UPLOAD_TYPES;

  // allow up to 100MB uploads
  maxSize = 100 * 1024 * 1024;

  /**
   * Returns the current branch as a single-encoded query-param value, or
   * an empty string when no branch is set.
   *
   * `this.api.branch` is already URL-encoded by `Client.setBranch()`, so we
   * decode then re-encode here to defend against double-encoding when this
   * value is concatenated into a URL.
   *
   * `Client.setBranch()` runs the constructor's `options.branch` through
   * `encodeURIComponent` without a guard, so an unset `options.branch`
   * lands here as the literal string `"undefined"`. We treat that and the
   * empty case as no-branch so we don't send `?branch=undefined` to the
   * assets-api (which would route the call to a non-existent staging path).
   */
  private encodedBranchParam(): string {
    if (!this.api.branch) return '';
    const decoded = decodeURIComponent(this.api.branch);
    if (!decoded || decoded === 'undefined') return '';
    return encodeURIComponent(decoded);
  }

  private shortStableHash(input: string): string {
    let hash = 2166136261;
    for (let index = 0; index < input.length; index++) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  /**
   * Derives a branch slug from the media path so different assets in the same
   * directory don't all contend for one branch name. Falls back to a stable
   * hash when the path sanitizes down to an empty segment.
   */
  private branchSlugForMediaPath(
    directory: string | undefined,
    filename: string | undefined
  ): string {
    const trimmedDirectory = (directory ?? '').replace(/^\/+|\/+$/g, '');
    const rawPath = [trimmedDirectory, filename].filter(Boolean).join('/');
    const flattened = rawPath.replace(/\//g, '-');
    const slug = formatBranchName(flattened).replace(/^-+|-+$/g, '');
    return slug || `asset-${this.shortStableHash(rawPath || 'root')}`;
  }

  /**
   * Waits for the admin shell to confirm the editor's React branch context
   * has caught up with `Client.branch` after an editorial-workflow switch.
   * The overlay (`media-workflow-overlay.tsx`) emits the matching event once
   * both states agree. Bounded by the same ceiling used for upload/delete
   * polling so a missing overlay can't deadlock the media op.
   */
  private awaitBranchSwitched(
    branchName: string,
    timeoutMs: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const decoded = decodeURIComponent(this.api.branch || '');
      if (decoded === branchName) {
        resolve();
        return;
      }

      let timer: ReturnType<typeof setTimeout> | undefined;
      const unsubscribe =
        this.cms.events.subscribe<MediaWorkflowBranchSwitchedEvent>(
          'media:workflow:branch-switched',
          (event) => {
            if (event.branchName !== branchName) return;
            if (timer) clearTimeout(timer);
            unsubscribe();
            resolve();
          }
        );

      timer = setTimeout(() => {
        unsubscribe();
        reject(
          new Error(
            `Timed out waiting for branch context to switch to ${branchName}`
          )
        );
      }, timeoutMs);
    });
  }

  /**
   * If the editor is on a protected branch with editorial workflow enabled,
   * create a feature branch + PR (matching the content-save flow) and wait
   * for the admin shell to switch the editor onto it before returning. The
   * caller then re-reads `this.api.branch` for the actual media op.
   *
   * No-op when not on a protected branch — media ops fall through.
   */
  private async interceptOnProtectedBranch(
    opType: 'upload' | 'delete',
    directory: string | undefined,
    filename: string | undefined
  ): Promise<void> {
    if (!this.api.usingProtectedBranch()) return;

    const tinaCms = this.cms as TinaCMS;
    const baseBranch = decodeURIComponent(this.api.branch || '');
    const mediaSlug = this.branchSlugForMediaPath(directory, filename);
    const branchName = `tina/media-${opType}-${mediaSlug}`;
    const prTitle = `Media ${opType} (${mediaSlug}) (PR from TinaCMS)`;

    tinaCms.events.dispatch({
      type: 'media:workflow:start',
      opType,
      branchName,
      baseBranch,
    });

    try {
      const result = await runEditorialWorkflow(tinaCms, {
        branchName,
        baseBranch,
        prTitle,
        onStep: (step) =>
          tinaCms.events.dispatch({ type: 'media:workflow:step', step }),
      });

      if (result.warning) {
        tinaCms.alerts.warn(
          `${result.warning} Please reconnect GitHub authoring here: ${this.api.gitSettingsLink}`,
          0
        );
      }
      tinaCms.alerts.success(
        `Branch created successfully - Pull Request at ${result.pullRequestUrl}`,
        0
      );

      const branchSwitched = this.awaitBranchSwitched(
        result.branchName,
        MEDIA_OP_TIMEOUT_MS
      );

      tinaCms.events.dispatch({
        type: 'media:workflow:complete',
        branchName: result.branchName,
      });

      await branchSwitched;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      tinaCms.events.dispatch({
        type: 'media:workflow:error',
        message,
      });
      throw err;
    }
  }

  private async persist_cloud(media: MediaUploadOptions[]): Promise<Media[]> {
    if (media.length === 0) {
      return [];
    }

    if (!(await this.isAuthenticated())) {
      return [];
    }

    const firstItem = media[0];
    await this.interceptOnProtectedBranch(
      'upload',
      firstItem.directory,
      firstItem.file.name
    );

    const encodedBranch = this.encodedBranchParam();
    const branchQuery = encodedBranch ? `?branch=${encodedBranch}` : '';

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
      const res = await this.api.authProvider.fetchWithToken(
        `${this.url}/upload_url/${path}${branchQuery}`,
        { method: 'GET' }
      );

      if (res.status === 412) {
        const { message = 'Unexpected error generating upload url' } =
          await res.json();
        throw new Error(message);
      }

      const { signedUrl, requestId } = await res.json();
      if (!signedUrl) {
        throw new Error('Unexpected error generating upload url');
      }

      const uploadRes = await this.fetchFunction(signedUrl, {
        method: 'PUT',
        body: item.file,
        headers: {
          'Content-Type': item.file.type || 'application/octet-stream',
          'Content-Length': String(item.file.size),
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

      const updateStartTime = Date.now();
      while (true) {
        // sleep for 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const { error, message } = await this.api.getRequestStatus(requestId);
        if (error !== undefined) {
          if (error) {
            throw new Error(message);
          } else {
            // success
            break;
          }
        }

        if (Date.now() - updateStartTime > 30000) {
          throw new Error('Time out waiting for upload to complete');
        }
      }
    }

    return this.fetchUploadedEntries(media);
  }

  /**
   * Resolves the just-uploaded items to canonical `Media` entries by hitting
   * the assets-api `list` endpoint, which is the source of truth for the
   * `src` URL — including the staging-branch path
   * (`__staging/<branch>/__file/...`) and the per-stage CDN host.
   * Constructing those URLs on the client would mirror server-side branch
   * routing and CDN-host logic, which is fragile to keep in sync.
   *
   * Best-effort: items not found within the first page of their directory
   * (e.g. very large directories) are omitted from the result rather than
   * throwing — the upload itself already succeeded.
   */
  private async fetchUploadedEntries(
    media: MediaUploadOptions[]
  ): Promise<Media[]> {
    const byDirectory = new Map<string, MediaUploadOptions[]>();
    for (const item of media) {
      let dir = item.directory || '';
      while (dir.endsWith('/')) dir = dir.slice(0, -1);
      const bucket = byDirectory.get(dir) ?? [];
      bucket.push(item);
      byDirectory.set(dir, bucket);
    }

    const thumbnailSizes = [
      { w: 75, h: 75 },
      { w: 400, h: 400 },
      { w: 1000, h: 1000 },
    ];

    const results: Media[] = [];
    for (const [directory, items] of byDirectory) {
      let listed: MediaList;
      try {
        listed = await this.list({
          directory,
          limit: Math.max(100, items.length * 4),
          thumbnailSizes,
        });
      } catch (err) {
        console.error('Failed to fetch canonical media entries:', err);
        continue;
      }

      const found = new Map<string, Media>();
      for (const entry of listed.items) {
        if (entry.type === 'file') {
          found.set(entry.filename, entry);
        }
      }
      for (const item of items) {
        const entry = found.get(item.file.name);
        if (entry) results.push(entry);
      }
    }
    return results;
  }

  private async persist_local(media: MediaUploadOptions[]): Promise<Media[]> {
    const newFiles: Media[] = [];
    const hasTinaMedia =
      Object.keys(
        this.cms.api.tina.schema.schema?.config?.media?.tina || {}
      ).includes('mediaRoot') &&
      Object.keys(
        this.cms.api.tina.schema.schema?.config?.media?.tina || {}
      ).includes('publicFolder');

    // Folder always has leading and trailing slashes
    let folder: string = hasTinaMedia
      ? this.cms.api.tina.schema.schema?.config?.media?.tina.mediaRoot
      : '/';

    if (!folder.startsWith('/')) {
      // ensure folder always has a /
      folder = '/' + folder;
    }
    if (!folder.endsWith('/')) {
      folder = folder + '/';
    }

    for (const item of media) {
      const { file, directory } = item;
      // Stripped directory does not have leading or trailing slashes
      let strippedDirectory = directory;
      if (strippedDirectory.startsWith('/')) {
        strippedDirectory = strippedDirectory.substr(1) || '';
      }
      if (strippedDirectory.endsWith('/')) {
        strippedDirectory =
          strippedDirectory.substr(0, strippedDirectory.length - 1) || '';
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('directory', directory);
      formData.append('filename', file.name);

      let uploadPath = `${
        strippedDirectory ? `${strippedDirectory}/${file.name}` : file.name
      }`;
      if (uploadPath.startsWith('/')) {
        uploadPath = uploadPath.substr(1);
      }
      const filePath = `${
        strippedDirectory
          ? `${folder}${strippedDirectory}/${file.name}`
          : folder + file.name
      }`;
      const res = await this.fetchFunction(`${this.url}/upload/${uploadPath}`, {
        method: 'POST',
        body: formData,
      });

      if (res.status != 200) {
        const responseData = await res.json();
        throw new Error(responseData.message);
      }

      const fileRes = await res.json();
      if (fileRes?.success) {
        const parsedRes: Media = {
          type: 'file',
          id: file.name,
          filename: file.name,
          directory,
          src: filePath,
          thumbnails: {
            '75x75': filePath,
            '400x400': filePath,
            '1000x1000': filePath,
          },
        };

        newFiles.push(parsedRes);
      } else {
        throw new Error('Unexpected error uploading media');
      }
    }
    return newFiles;
  }

  async persist(media: MediaUploadOptions[]): Promise<Media[]> {
    this.setup();

    if (this.isLocal) {
      return this.persist_local(media);
    } else {
      return this.persist_cloud(media);
    }
  }

  private genThumbnail(src: string, dimensions: { w: number; h: number }) {
    return !this.isLocal
      ? `${src}?fit=crop&max-w=${dimensions.w}&max-h=${dimensions.h}`
      : src;
  }

  async list(options?: MediaListOptions): Promise<MediaList> {
    this.setup();

    if (this.staticMedia) {
      const offset = options.offset || 0;
      const media = this.staticMedia[String(offset)];
      let hasMore = false;
      if (this.staticMedia[String(Number(offset) + 20)]) {
        hasMore = true;
      }
      if (options.directory) {
        let depth = 0;
        const pathToDirectory = options.directory.split('/');
        let currentFolder = media;
        let hasMore = false;
        while (depth < pathToDirectory.length) {
          const nextFolder = currentFolder.find(
            (item) =>
              item.type === 'dir' && item.filename === pathToDirectory[depth]
          );
          if (nextFolder) {
            const offset = options.offset || 0;
            currentFolder = nextFolder.children[String(offset)];
            if (nextFolder.children[String(Number(offset) + 20)]) {
              hasMore = true;
            }
          }
          depth++;
        }
        return {
          items: currentFolder,
          nextOffset: hasMore ? Number(offset) + 20 : null,
        };
      }
      return { items: media, nextOffset: hasMore ? Number(offset) + 20 : null };
    }

    let res;
    if (!this.isLocal) {
      const encodedBranch = this.encodedBranchParam();
      res = await this.api.authProvider.fetchWithToken(
        `${this.url}/list/${options.directory || ''}?limit=${
          options.limit || 20
        }${options.offset ? `&cursor=${options.offset}` : ''}${
          encodedBranch ? `&branch=${encodedBranch}` : ''
        }`
      );

      if (res.status == 401) {
        throw E_UNAUTHORIZED;
      }

      if (res.status == 404) {
        throw E_BAD_ROUTE;
      }
    } else {
      res = await this.fetchFunction(
        `${this.url}/list/${options.directory || ''}?limit=${
          options.limit || 20
        }${options.offset ? `&cursor=${options.offset}` : ''}`
      );

      if (res.status == 404) {
        throw E_BAD_ROUTE;
      }

      if (res.status >= 500) {
        const { e } = await res.json();
        const error = new Error('Unexpected error');
        console.error(e);
        throw error;
      }
    }
    const { cursor, files, directories } = await res.json();

    const items: Media[] = [];
    for (const dir of directories) {
      items.push({
        type: 'dir',
        id: dir,
        directory: options.directory || '',
        filename: dir,
      });
    }

    for (const file of files) {
      items.push({
        directory: options.directory || '',
        type: 'file',
        id: file.filename,
        filename: file.filename,
        src: file.src,
        thumbnails: options.thumbnailSizes.reduce((acc, { w, h }) => {
          acc[`${w}x${h}`] = this.genThumbnail(file.src, { w, h });
          return acc;
        }, {}),
      });
    }

    return {
      items,
      nextOffset: cursor || 0,
    };
  }

  parse = (img) => {
    return img.src;
  };

  async delete(media: Media) {
    const path = `${
      media.directory ? `${media.directory}/${media.filename}` : media.filename
    }`;
    if (!this.isLocal) {
      if (await this.isAuthenticated()) {
        await this.interceptOnProtectedBranch(
          'delete',
          media.directory,
          media.filename
        );
        const encodedBranch = this.encodedBranchParam();
        const branchQuery = encodedBranch ? `?branch=${encodedBranch}` : '';
        const res = await this.api.authProvider.fetchWithToken(
          `${this.url}/${path}${branchQuery}`,
          {
            method: 'DELETE',
          }
        );
        if (res.status == 200) {
          const { requestId } = await res.json();

          const deleteStartTime = Date.now();
          while (true) {
            // sleep for 1 second
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const { error, message } =
              await this.api.getRequestStatus(requestId);
            if (error !== undefined) {
              if (error) {
                throw new Error(message);
              } else {
                // success
                break;
              }
            }

            if (Date.now() - deleteStartTime > 30000) {
              throw new Error('Time out waiting for delete to complete');
            }
          }
        } else {
          throw new Error('Unexpected error deleting media asset');
        }
      } else {
        throw E_UNAUTHORIZED;
      }
    } else {
      await this.fetchFunction(`${this.url}/${path}`, {
        method: 'DELETE',
      });
    }
  }
}
