import { DEFAULT_MEDIA_UPLOAD_TYPES } from '@toolkit/components/media/utils';
import { formatBranchName } from '@toolkit/plugin-branch-switcher/format-branch-name';
import type { TinaCMS } from '@toolkit/tina-cms';
import type { Client } from '../../internalClient';
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

// Sized to mirror the server-side `waitForIndexing` budget in tinacloud
// (js/content-api/src/editorial-workflow.ts). The "unknown" window covers
// the webhook-fires → SQS-handler-starts gap; the attempt cap covers the
// time between indexing start and `persistBranchMetadata` completing.
const INDEX_POLL_INTERVAL_MS = 5000;
const INDEX_MAX_ATTEMPTS = 60;
const INDEX_MAX_UNKNOWN = 24;

interface MediaWorkflowConfirmBranchEvent {
  type: 'media:workflow:confirm-branch';
  opType: 'upload' | 'delete';
  branchName: string;
  baseBranch: string;
  onConfirm: (branchName: string) => Promise<void>;
  onCancel: () => void;
  onSaveToProtectedBranch: () => void;
}

interface MediaBranchContext {
  branchName: string;
  baseBranch: string;
  prTitle: string;
}

const MEDIA_OPERATION_CANCELLED = 'MEDIA_OPERATION_CANCELLED';

class MediaOperationCancelledError extends Error {
  code = MEDIA_OPERATION_CANCELLED;

  constructor() {
    super('Media operation cancelled.');
    this.name = 'MediaOperationCancelledError';
  }
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

  /**
   * Branch to route media calls through *during* a protected-branch
   * workflow, before the React branch state has been switched.
   *
   * Why this is necessary: changing `currentBranch` via `setCurrentBranch`
   * re-runs `setupEditorialWorkflow` in `TinaCloudProvider`, which checks
   * `project.metadata[currentBranch]` and bumps the editor back to the
   * default branch when the entry is missing. The entry only lands once
   * the asset commit has fired its push webhook through to
   * `persistBranchMetadata`. To avoid that race we keep React state on
   * the protected branch through the upload/index/PR steps and only
   * switch it after `waitForBranchIndexed` has guaranteed metadata is
   * populated. The override is read by `encodedBranchParam` so the
   * assets-api calls in between still see the new branch.
   */
  private workflowBranchOverride: string | undefined;

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
    if (this.workflowBranchOverride) {
      return encodeURIComponent(this.workflowBranchOverride);
    }
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

  private trimEdges(value: string, char: string): string {
    let start = 0;
    let end = value.length;

    while (start < end && value[start] === char) {
      start++;
    }

    while (end > start && value[end - 1] === char) {
      end--;
    }

    return value.slice(start, end);
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
    const trimmedDirectory = this.trimEdges(directory ?? '', '/');
    const rawPath = [trimmedDirectory, filename].filter(Boolean).join('/');
    const flattened = rawPath.replaceAll('/', '-');
    const slug = this.trimEdges(formatBranchName(flattened), '-');
    return slug || `asset-${this.shortStableHash(rawPath || 'root')}`;
  }

  /**
   * Prompts the user via the overlay for how to handle a media op on a
   * protected branch. Resolves to a `MediaBranchContext` when the user
   * picks "create a branch", `undefined` when they pick "save to
   * protected branch", and rejects with `MediaOperationCancelledError`
   * when they cancel.
   */
  private requestMediaBranchChoice(
    opType: 'upload' | 'delete',
    branchName: string,
    baseBranch: string
  ): Promise<MediaBranchContext | undefined> {
    return new Promise((resolve, reject) => {
      this.cms.events.dispatch<MediaWorkflowConfirmBranchEvent>({
        type: 'media:workflow:confirm-branch',
        opType,
        branchName,
        baseBranch,
        onConfirm: async (selectedBranchName) => {
          resolve(
            await this.prepareMediaBranch(
              opType,
              selectedBranchName,
              baseBranch
            )
          );
        },
        onCancel: () => reject(new MediaOperationCancelledError()),
        onSaveToProtectedBranch: () => resolve(undefined),
      });
    });
  }

  private prTitleForBranch(branchName: string): string {
    const branchSlug = branchName.startsWith('tina/')
      ? branchName.slice('tina/'.length)
      : branchName;
    return `${branchSlug.replace('-', ' ')} (PR from TinaCMS)`;
  }

  /**
   * Polls the content-api index status for the media branch until it reports
   * `complete`. The commit that triggers indexing is produced server-side by
   * `onS3AssetCreated` (`bridge.put`) — *after* the client-side upload settles.
   * Without this wait the editor can race the indexing pipeline: the user's
   * upload modal closes, they reload, and `TinaCloudProvider.setupEditorialWorkflow`
   * finds no `project.metadata[branch]` entry yet and bumps them to default.
   *
   * Shape mirrors `waitForIndexing` server-side in tinacloud's
   * `editorial-workflow.ts` so media and content end up with the same
   * "metadata is populated when this returns" guarantee.
   */
  private async waitForBranchIndexed(branchName: string): Promise<void> {
    let unknownCount = 0;
    for (let attempt = 0; attempt < INDEX_MAX_ATTEMPTS; attempt++) {
      const { status } = await this.api.getIndexStatus({ ref: branchName });

      if (status === 'complete') return;
      if (status === 'failed') {
        throw new Error(`Indexing failed for branch ${branchName}`);
      }
      if (status === 'unknown') {
        unknownCount++;
        if (unknownCount >= INDEX_MAX_UNKNOWN) {
          throw new Error(
            `Indexing never started for branch ${branchName} — the push webhook may not have been processed`
          );
        }
      } else {
        unknownCount = 0;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, INDEX_POLL_INTERVAL_MS)
      );
    }

    throw new Error(`Timed out waiting for indexing on branch ${branchName}`);
  }

  /**
   * Creates the branch on GitHub and installs the local override so the
   * subsequent upload/delete + indexing + PR steps route through it
   * without changing React state. React state remains on the protected
   * branch until `finalizeMediaWorkflow` switches it after indexing is
   * confirmed complete.
   */
  private async prepareMediaBranch(
    opType: 'upload' | 'delete',
    branchName: string,
    baseBranch: string
  ): Promise<MediaBranchContext> {
    const tinaCms = this.cms as TinaCMS;

    tinaCms.events.dispatch({
      type: 'media:workflow:start',
      opType,
      branchName,
      baseBranch,
    });

    const createdBranchName = await this.api.createBranch({
      branchName,
      baseBranch,
    });
    const branchContext = {
      branchName: createdBranchName || branchName,
      baseBranch,
      prTitle: this.prTitleForBranch(createdBranchName || branchName),
    };

    this.workflowBranchOverride = branchContext.branchName;

    return branchContext;
  }

  /**
   * Runs the post-asset-write phase of the media workflow:
   *   - step 2: wait for server-side indexing of the new branch to complete,
   *     so `project.metadata[branch]` is populated before we hand the user
   *     back to the editor.
   *   - switch React state to the new branch — only after indexing has
   *     populated metadata. Doing this earlier races
   *     `TinaCloudProvider.setupEditorialWorkflow`, which checks
   *     `project.metadata[currentBranch]` and bumps the editor to the
   *     default branch when the entry is missing.
   *   - step 3: open the pull request.
   *   - step 4: signal completion.
   *
   * Errors are surfaced via `media:workflow:error` rather than rethrown —
   * the asset write itself already succeeded; the user shouldn't see the
   * upload/delete as failed because a later step failed.
   */
  private async finalizeMediaWorkflow(
    branchContext: MediaBranchContext
  ): Promise<void> {
    const tinaCms = this.cms as TinaCMS;

    try {
      tinaCms.events.dispatch({ type: 'media:workflow:step', step: 2 });
      await this.waitForBranchIndexed(branchContext.branchName);

      // Switch React state to the new branch. The overlay's handler
      // calls `setCurrentBranch`, which propagates through
      // `BranchDataProvider` → TinaCloudProvider's render-time sync →
      // `Client.setBranch`. We don't need to wait for that propagation
      // here: PR creation reads `branchContext.branchName` directly,
      // and the override stays in place until we clear it below — so
      // any media call that races the React render still routes
      // through the new branch.
      tinaCms.events.dispatch({
        type: 'media:workflow:complete',
        branchName: branchContext.branchName,
      });
      this.workflowBranchOverride = undefined;

      tinaCms.events.dispatch({ type: 'media:workflow:step', step: 3 });
      const result = await this.api.createPullRequest({
        baseBranch: branchContext.baseBranch,
        branch: branchContext.branchName,
        title: branchContext.prTitle,
      });

      tinaCms.events.dispatch({ type: 'media:workflow:step', step: 4 });
      tinaCms.alerts.success(
        `Branch created successfully - Pull Request at ${result?.url || ''}`,
        0
      );
      tinaCms.events.dispatch({ type: 'media:workflow:finish' });
    } catch (err) {
      this.workflowBranchOverride = undefined;
      const message = err instanceof Error ? err.message : String(err);
      tinaCms.events.dispatch({
        type: 'media:workflow:error',
        message,
      });
    }
  }

  /**
   * Runs an upload/delete op under a (possibly-undefined) protected-branch
   * workflow. When the user picked "create a branch", clears the workflow
   * override and dispatches `media:workflow:error` on failures originating
   * before `finalizeMediaWorkflow` runs (`finalizeMediaWorkflow` handles
   * its own failures internally). Without a `branchContext` this is a
   * pass-through.
   */
  private async runMediaOpWithWorkflow<T>(
    branchContext: MediaBranchContext | undefined,
    op: () => Promise<T>
  ): Promise<T> {
    if (!branchContext) return op();
    try {
      const result = await op();
      await this.finalizeMediaWorkflow(branchContext);
      return result;
    } catch (err) {
      this.workflowBranchOverride = undefined;
      (this.cms as TinaCMS).events.dispatch({
        type: 'media:workflow:error',
        message: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }

  private async prepareProtectedMediaBranch(
    opType: 'upload' | 'delete',
    directory: string | undefined,
    filename: string | undefined
  ): Promise<MediaBranchContext | undefined> {
    if (!this.api.usingProtectedBranch()) return;

    const baseBranch = decodeURIComponent(this.api.branch || '');
    const mediaSlug = this.branchSlugForMediaPath(directory, filename);
    const branchName = `media-${opType}-${mediaSlug}`;
    return this.requestMediaBranchChoice(opType, branchName, baseBranch);
  }

  private async persist_cloud(media: MediaUploadOptions[]): Promise<Media[]> {
    if (media.length === 0) {
      return [];
    }

    if (!(await this.isAuthenticated())) {
      return [];
    }

    const firstItem = media[0];
    const branchContext = await this.prepareProtectedMediaBranch(
      'upload',
      firstItem.directory,
      firstItem.file.name
    );

    return this.runMediaOpWithWorkflow(branchContext, async () => {
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
    });
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
        const branchContext = await this.prepareProtectedMediaBranch(
          'delete',
          media.directory,
          media.filename
        );
        await this.runMediaOpWithWorkflow(branchContext, async () => {
          const encodedBranch = this.encodedBranchParam();
          const branchQuery = encodedBranch ? `?branch=${encodedBranch}` : '';
          const res = await this.api.authProvider.fetchWithToken(
            `${this.url}/${path}${branchQuery}`,
            { method: 'DELETE' }
          );
          if (res.status !== 200) {
            throw new Error('Unexpected error deleting media asset');
          }
          const { requestId } = await res.json();

          const deleteStartTime = Date.now();
          while (true) {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const { error, message } =
              await this.api.getRequestStatus(requestId);
            if (error !== undefined) {
              if (error) throw new Error(message);
              return;
            }
            if (Date.now() - deleteStartTime > 30000) {
              throw new Error('Time out waiting for delete to complete');
            }
          }
        });
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
