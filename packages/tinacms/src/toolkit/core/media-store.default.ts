import {
  DEFAULT_MEDIA_UPLOAD_TYPES,
  sanitizeFilename,
} from '@toolkit/components/media/utils';
import {
  EDITORIAL_WORKFLOW_STATUS,
  type EditorialWorkflowStatus,
} from '@toolkit/form-builder/editorial-workflow-constants';
import {
  type MediaWorkflowConfirmBranchEvent,
  getEditorialWorkflowPrTitle,
} from '@toolkit/form-builder/editorial-workflow-utils';
import { formatBranchName } from '@toolkit/plugin-branch-switcher/format-branch-name';
import type { TinaCMS } from '@toolkit/tina-cms';
import type { Client } from '../../internalClient';
import {
  E_BAD_ROUTE,
  E_SELF_HOSTED_MEDIA,
  E_UNAUTHORIZED,
  Media,
  MediaList,
  MediaListOptions,
  MediaRenameError,
  MediaRenameErrorCode,
  MediaStore,
  MediaUploadOptions,
} from './media';

interface MediaBranchContext {
  branchName: string;
  baseBranch: string;
  requestId: string;
}

type MediaBranchDecision =
  | { kind: 'workflow'; context: MediaBranchContext }
  | { kind: 'cancelled' }
  | { kind: 'direct' };

type MediaOpType = 'upload' | 'delete' | 'rename';

interface MediaWorkflowRequest {
  opType: MediaOpType;
  /** The asset the workflow concerns; for a rename, the source. */
  repoPath: string;
  /** Rename only: the already-sanitised target. */
  targetRepoPath?: string;
  /**
   * Whether the branch prompt may offer the direct "Save to Protected Branch"
   * action. False for a rename on any protected branch, which must go through
   * the workflow; uploads and deletes still offer it.
   */
  allowSaveToProtectedBranch: boolean;
}

const MEDIA_WORKFLOW_STEP = {
  BRANCH: 1,
  CONTENT: 2,
  PR: 3,
  COMPLETE: 4,
} as const;

const MEDIA_WORKFLOW_STATUS_TO_STEP: Partial<
  Record<EditorialWorkflowStatus, number>
> = {
  [EDITORIAL_WORKFLOW_STATUS.SETTING_UP]: MEDIA_WORKFLOW_STEP.BRANCH,
  [EDITORIAL_WORKFLOW_STATUS.CREATING_BRANCH]: MEDIA_WORKFLOW_STEP.BRANCH,
  [EDITORIAL_WORKFLOW_STATUS.INDEXING]: MEDIA_WORKFLOW_STEP.CONTENT,
  [EDITORIAL_WORKFLOW_STATUS.CONTENT_GENERATION]: MEDIA_WORKFLOW_STEP.CONTENT,
  [EDITORIAL_WORKFLOW_STATUS.CREATING_PR]: MEDIA_WORKFLOW_STEP.PR,
  [EDITORIAL_WORKFLOW_STATUS.COMPLETE]: MEDIA_WORKFLOW_STEP.COMPLETE,
};

const s3ErrorRegex = /<Error>.*<Code>(.+)<\/Code>.*<Message>(.+)<\/Message>.*/;

const CANONICAL_THUMBNAIL_SIZES = [
  { w: 75, h: 75 },
  { w: 400, h: 400 },
  { w: 1000, h: 1000 },
];

const RENAME_ERROR_CODES: MediaRenameErrorCode[] = [
  'NOT_FOUND',
  'NAME_COLLISION',
  'INVALID_FILENAME',
  'INVALID_PATH',
  'UNAUTHORIZED',
  'UNSUPPORTED',
  'BACKEND_FAILURE',
];

/**
 * Signals that the editor dismissed the branch prompt, so nothing was renamed.
 * Rejecting is how a `rename` that must resolve to a `Media` reports "no work
 * happened"; the rename modal recognises it and closes without an error.
 */
export class MediaRenameCancelled extends Error {
  public ERR_TYPE = 'MediaRenameCancelled';

  constructor() {
    super('Media rename cancelled.');
  }
}

export class DummyMediaStore implements MediaStore {
  accept = '*';
  async persist(files: MediaUploadOptions[]): Promise<Media[]> {
    return files.map(({ directory, file }) => {
      const filename = sanitizeFilename(file.name);
      return {
        id: filename,
        type: 'file',
        directory,
        filename,
      };
    });
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
  private cms: TinaCMS;
  private isLocal: boolean;
  private url: string;
  private listUrl: string;
  private staticMedia: StaticMedia;
  isStatic?: boolean;

  // Route assets-api calls through the created branch until indexing makes it safe to switch React branch state.
  private workflowBranchOverride: string | undefined;
  private mediaWorkflowInProgress = false;

  /**
   * An instance property rather than a prototype method on purpose: the media
   * manager decides whether to offer the action by checking whether the store
   * defines `rename`, so an instance that cannot rename must not carry one — a
   * prototype method would advertise support everywhere and surface an action
   * that always fails. Static and self-hosted repo media get no `rename`.
   */
  rename?: (from: string, to: string) => Promise<Media>;

  constructor(cms: TinaCMS, staticMedia?: StaticMedia) {
    this.cms = cms;
    if (staticMedia && Object.keys(staticMedia).length > 0) {
      this.isStatic = true;
      this.staticMedia = staticMedia;
    }
    if (!this.isStatic && !this.isUnsupportedSelfHostedRepoMedia()) {
      this.rename = cms?.api?.tina?.isLocalMode
        ? (from, to) => this.rename_local(from, to)
        : (from, to) => this.rename_cloud(from, to);
    }
  }

  /**
   * Repo-backed media (`media.tina`) is served by TinaCloud's assets API. A
   * self-hosted site (a custom content API, and not local dev) has no such
   * endpoint, so these operations can never succeed there. Detecting the case
   * lets us fail with a clear, actionable message instead of a misleading
   * TinaCloud/provider error (e.g. a bogus 404 "Bad Route").
   */
  private isUnsupportedSelfHostedRepoMedia(): boolean {
    const api = this.api ?? this.cms?.api?.tina;
    return Boolean(api && !api.isLocalMode && api.isCustomContentApi);
  }

  setup() {
    // Static repo media is generated at build time and served without the
    // assets API, so it keeps working self-hosted (read-only) — only live
    // repo-media operations hit the unsupported path.
    if (!this.isStatic && this.isUnsupportedSelfHostedRepoMedia()) {
      throw E_SELF_HOSTED_MEDIA;
    }

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
          this.listUrl = this.url.replace('/v1/', '/v2/');
        }
      }
    }
  }

  async isAuthenticated() {
    this.setup();
    return await this.api.authProvider.isAuthenticated();
  }

  accept = DEFAULT_MEDIA_UPLOAD_TYPES;

  searchable = true;

  // allow up to 100MB uploads
  maxSize = 100 * 1024 * 1024;

  /**
   * Returns the workflow branch override or current branch as a single-encoded
   * query-param value, or an empty string when no branch is set.
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

  private branchSlugForMediaPath(
    directory: string | undefined,
    filename: string | undefined
  ): string {
    const trimmedDirectory = this.trimEdges(directory ?? '', '/');
    const rawPath = [trimmedDirectory, filename].filter(Boolean).join('/');
    const flattened = rawPath.replaceAll('/', '-');
    const slug = this.trimEdges(formatBranchName(flattened), '-');
    if (!slug) return `asset-${this.shortStableHash(rawPath || 'root')}`;
    return rawPath !== rawPath.toLowerCase()
      ? `${slug}-${this.shortStableHash(rawPath)}`
      : slug;
  }

  /** Joins a directory and filename into a normalized `dir/file` repo path. */
  private joinMediaPath(
    directory: string | undefined,
    filename: string | undefined
  ): string {
    const dir = this.trimEdges(directory ?? '', '/');
    return dir && dir !== '/' ? `${dir}/${filename ?? ''}` : (filename ?? '');
  }

  private branchQueryParam(): string {
    const encodedBranch = this.encodedBranchParam();
    return encodedBranch ? `?branch=${encodedBranch}` : '';
  }

  private requestMediaBranchChoice(
    branchName: string,
    baseBranch: string,
    request: MediaWorkflowRequest
  ): Promise<MediaBranchDecision> {
    // The decision is driven entirely by the branch prompt rendered by
    // <MediaWorkflowOverlay />. We can't infer its presence from
    // dispatch()'s return value: ambient `'*'` subscribers (the alerts
    // bridge) make every event look "handled", so a missing overlay would
    // leave this promise unresolved forever. Detect the purpose-built
    // listener explicitly and fail fast instead.
    if (
      !this.cms.events.hasExplicitListenerFor('media:workflow:confirm-branch')
    ) {
      throw new Error(
        'Cannot start a media editorial workflow: no branch prompt is mounted. ' +
          'Ensure <MediaWorkflowOverlay /> is rendered (TinaCloudProvider mounts it automatically).'
      );
    }

    return new Promise((resolve) => {
      this.cms.events.dispatch<MediaWorkflowConfirmBranchEvent>({
        type: 'media:workflow:confirm-branch',
        branchName,
        baseBranch,
        allowSaveToProtectedBranch: request.allowSaveToProtectedBranch,
        onConfirm: async (selectedBranchName) => {
          const context = await this.prepareMediaBranch(
            selectedBranchName,
            baseBranch,
            request
          );
          resolve({
            kind: 'workflow',
            context,
          });
        },
        onCancel: () => resolve({ kind: 'cancelled' }),
        onSaveToProtectedBranch: () => resolve({ kind: 'direct' }),
      });
    });
  }

  private async prepareMediaBranch(
    branchName: string,
    baseBranch: string,
    request: MediaWorkflowRequest
  ): Promise<MediaBranchContext> {
    if (this.mediaWorkflowInProgress) {
      throw new Error('A media workflow is already in progress.');
    }
    this.mediaWorkflowInProgress = true;

    try {
      this.cms.events.dispatch({
        type: 'media:workflow:start',
        branchName,
        baseBranch,
      });

      const workflow = await this.api.startMediaEditorialWorkflow({
        branchName,
        baseBranch,
        prTitle: getEditorialWorkflowPrTitle(branchName),
        operation: request.opType,
        repoPath: request.repoPath,
        ...(request.targetRepoPath
          ? { targetRepoPath: request.targetRepoPath }
          : {}),
      });
      const branchContext = {
        branchName: workflow.branchName || branchName,
        baseBranch,
        requestId: workflow.requestId,
      };

      this.workflowBranchOverride = branchContext.branchName;

      return branchContext;
    } catch (err) {
      this.resetWorkflowState();
      throw err;
    }
  }

  private resetWorkflowState(): void {
    this.workflowBranchOverride = undefined;
    this.mediaWorkflowInProgress = false;
  }

  private async finalizeMediaWorkflow(
    branchContext: MediaBranchContext,
    onCatalogued?: () => Promise<void>
  ): Promise<void> {
    try {
      const result = await this.api.waitForEditorialWorkflowStatus(
        branchContext.requestId,
        (status) => {
          const step =
            MEDIA_WORKFLOW_STATUS_TO_STEP[
              status.status as EditorialWorkflowStatus
            ];
          if (step) {
            this.cms.events.dispatch({
              type: 'media:workflow:step',
              step,
            });
          }
        }
      );

      // The asset is now catalogued in the workflow branch's media index, and
      // the branch override still routes list calls there — run the
      // post-catalogue step before we clear the override.
      if (onCatalogued) await onCatalogued();

      this.resetWorkflowState();

      this.cms.events.dispatch({
        type: 'media:workflow:complete',
        branchName: result.branchName || branchContext.branchName,
      });

      if (result.warning) {
        this.cms.alerts.warn(result.warning, 0);
      }
      this.cms.alerts.success(
        `Branch created successfully - Pull Request at ${
          result?.pullRequestUrl || ''
        }`,
        0
      );
      this.cms.events.dispatch({ type: 'media:workflow:finish' });
    } catch (err) {
      this.resetWorkflowState();
      this.dispatchMediaWorkflowError(err);
    }
  }

  private dispatchMediaWorkflowError(err: unknown): void {
    this.cms.events.dispatch({
      type: 'media:workflow:error',
      message: err instanceof Error ? err.message : String(err),
    });
  }

  private async runMediaOpWithWorkflow<T>(
    decision: MediaBranchDecision,
    op: () => Promise<T>
  ): Promise<T> {
    if (decision.kind !== 'workflow') return op();
    try {
      const result = await op();
      await this.finalizeMediaWorkflow(decision.context);
      return result;
    } catch (err) {
      this.resetWorkflowState();
      this.cms.events.dispatch({ type: 'media:workflow:finish' });
      throw err;
    }
  }

  private async prepareProtectedMediaBranch(
    opType: 'upload' | 'delete',
    directory: string | undefined,
    filename: string | undefined
  ): Promise<MediaBranchDecision> {
    if (!this.api.usingProtectedBranch()) return { kind: 'direct' };

    const baseBranch = decodeURIComponent(this.api.branch || '');
    const mediaSlug = this.branchSlugForMediaPath(directory, filename);
    const branchName = `media-${opType}-${mediaSlug}`;
    // Uploads mint a new name, so sanitize it to match the upload URL and the
    // committed asset. Deletes reference an *existing* file — use its stored
    // name verbatim, since re-sanitizing could point at a path that doesn't
    // exist for legacy or externally-added files.
    const repoFilename =
      opType === 'upload' && filename ? sanitizeFilename(filename) : filename;
    const repoPath = this.joinMediaPath(directory, repoFilename);
    return this.requestMediaBranchChoice(branchName, baseBranch, {
      opType,
      repoPath,
      allowSaveToProtectedBranch: true,
    });
  }

  private async waitForRequestStatus(
    requestId: string,
    timeoutMessage: string
  ): Promise<void> {
    const startTime = Date.now();
    while (true) {
      // sleep for 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const { error, message } = await this.api.getRequestStatus(requestId);
      if (error !== undefined) {
        if (error) {
          throw new Error(message);
        } else {
          // success
          return;
        }
      }

      if (Date.now() - startTime > 30000) {
        throw new Error(timeoutMessage);
      }
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
    const decision = await this.prepareProtectedMediaBranch(
      'upload',
      firstItem.directory,
      firstItem.file.name
    );
    if (decision.kind === 'cancelled') return [];

    if (decision.kind === 'workflow') {
      return this.persistCloudViaWorkflow(media, decision.context);
    }

    const branchQuery = this.branchQueryParam();
    for (const item of media) {
      await this.uploadCloudMediaItem(item, branchQuery, {
        waitForStatus: true,
      });
    }
    return this.fetchUploadedEntries(media);
  }

  /**
   * Uploads assets through the editorial workflow. The asset is staged, the
   * server-side workflow catalogues it in the new branch's media index, and
   * only then do we list it — while the branch override still routes list
   * calls to the workflow branch, so the freshly uploaded item is returned to
   * the caller (and added to the media manager) without needing a manual
   * refresh.
   */
  private async persistCloudViaWorkflow(
    media: MediaUploadOptions[],
    branchContext: MediaBranchContext
  ): Promise<Media[]> {
    try {
      const branchQuery = this.branchQueryParam();
      for (const item of media) {
        await this.uploadCloudMediaItem(item, branchQuery, {
          waitForStatus: false,
        });
      }

      let entries: Media[] = [];
      await this.finalizeMediaWorkflow(branchContext, async () => {
        entries = await this.fetchUploadedEntries(media);
      });
      return entries;
    } catch (err) {
      this.resetWorkflowState();
      this.cms.events.dispatch({ type: 'media:workflow:finish' });
      throw err;
    }
  }

  private async uploadCloudMediaItem(
    item: MediaUploadOptions,
    branchQuery: string,
    { waitForStatus = true }: { waitForStatus?: boolean } = {}
  ): Promise<void> {
    // Sanitize the new file's name so the upload URL, the stored asset, and the
    // value later matched in fetchUploadedEntries all agree (macOS exposes
    // filenames in NFD form). Only uploads sanitize — see prepareProtectedMediaBranch.
    const path = this.joinMediaPath(
      item.directory,
      sanitizeFilename(item.file.name)
    );
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

    if (waitForStatus) {
      await this.waitForRequestStatus(
        requestId,
        'Time out waiting for upload to complete'
      );
    }
  }

  private groupMediaByDirectory(
    media: MediaUploadOptions[]
  ): Map<string, MediaUploadOptions[]> {
    const byDirectory = new Map<string, MediaUploadOptions[]>();
    for (const item of media) {
      let dir = item.directory || '';
      while (dir.endsWith('/')) dir = dir.slice(0, -1);
      const bucket = byDirectory.get(dir) ?? [];
      bucket.push(item);
      byDirectory.set(dir, bucket);
    }
    return byDirectory;
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
    const byDirectory = this.groupMediaByDirectory(media);

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
        // The server stores the file under the sanitized name we sent at
        // upload time, so match the canonical listing on the same value.
        const entry = found.get(sanitizeFilename(item.file.name));
        if (entry) results.push(entry);
      }
    }
    return results;
  }

  /** Media root as a `/uploads/`-style prefix for local `src` values. */
  private localMediaFolder(): string {
    const tinaMedia = this.cms.api.tina.schema.schema?.config?.media?.tina;
    const hasTinaMedia =
      Object.keys(tinaMedia || {}).includes('mediaRoot') &&
      Object.keys(tinaMedia || {}).includes('publicFolder');

    // Folder always has leading and trailing slashes
    let folder: string = hasTinaMedia ? tinaMedia.mediaRoot : '/';

    if (!folder.startsWith('/')) {
      // ensure folder always has a /
      folder = '/' + folder;
    }
    if (!folder.endsWith('/')) {
      folder = folder + '/';
    }
    return folder;
  }

  /** Stripped directory does not have leading or trailing slashes */
  private stripDirectorySlashes(directory: string): string {
    let stripped = directory || '';
    if (stripped.startsWith('/')) {
      stripped = stripped.substr(1) || '';
    }
    if (stripped.endsWith('/')) {
      stripped = stripped.substr(0, stripped.length - 1) || '';
    }
    return stripped;
  }

  /** Shared by local upload and local rename so both describe a file identically. */
  private buildLocalMedia(directory: string, filename: string): Media {
    const folder = this.localMediaFolder();
    const strippedDirectory = this.stripDirectorySlashes(directory);
    const src = strippedDirectory
      ? `${folder}${strippedDirectory}/${filename}`
      : `${folder}${filename}`;

    return {
      type: 'file',
      id: filename,
      filename,
      directory,
      src,
      thumbnails: {
        '75x75': src,
        '400x400': src,
        '1000x1000': src,
      },
    };
  }

  private async persist_local(media: MediaUploadOptions[]): Promise<Media[]> {
    const newFiles: Media[] = [];

    for (const item of media) {
      const { file, directory } = item;
      // Normalize/sanitize once and reuse for the FormData filename, the
      // upload URL, the on-disk path, and the value persisted into content,
      // so every layer agrees on the same bytes.
      const safeName = sanitizeFilename(file.name);
      const strippedDirectory = this.stripDirectorySlashes(directory);

      const formData = new FormData();
      // The third arg of FormData#append overrides the part filename — pass
      // the sanitized name so the server reads what the client expects.
      formData.append('file', file, safeName);
      formData.append('directory', directory);
      formData.append('filename', safeName);

      let uploadPath = `${
        strippedDirectory ? `${strippedDirectory}/${safeName}` : safeName
      }`;
      if (uploadPath.startsWith('/')) {
        uploadPath = uploadPath.substr(1);
      }
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
        newFiles.push(this.buildLocalMedia(directory, safeName));
      } else {
        throw new Error('Unexpected error uploading media');
      }
    }
    return newFiles;
  }

  /**
   * `from`/`to` are media-root-relative `directory/filename` paths, matching
   * what the delete route receives.
   */
  private async rename_local(from: string, to: string): Promise<Media> {
    this.setup();

    const res = await this.fetchFunction(`${this.url}/rename`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to }),
    });

    const body = await res.json().catch(() => null);

    if (res.status !== 200 || !body?.success) {
      throw this.toRenameError(res.status, body);
    }

    const { directory, filename } = this.splitMediaPath(to);
    return this.buildLocalMedia(directory, filename);
  }

  /**
   * `from`/`to` are media-root-relative `directory/filename` paths. `to` has
   * already been sanitised by the rename UI (`previewRename`), and is passed
   * through untouched so the workflow record and the renamed file agree — the
   * editorial-workflow route does not sanitise its target.
   */
  private async rename_cloud(from: string, to: string): Promise<Media> {
    this.setup();

    if (!(await this.isAuthenticated())) {
      throw new MediaRenameError({
        code: 'UNAUTHORIZED',
        message: "You don't have permission to rename this file.",
      });
    }

    const decision = await this.prepareRenameBranch(from, to);
    if (decision.kind === 'cancelled') {
      throw new MediaRenameCancelled();
    }
    if (decision.kind === 'workflow') {
      return this.renameCloudViaWorkflow(from, to, decision.context);
    }
    return this.renameCloudDirect(from, to);
  }

  /**
   * Issues the rename itself. `branch` comes from the workflow override when
   * one is active, so this targets the workflow branch without the caller
   * having to say so.
   */
  private async postCloudRename(
    from: string,
    to: string
  ): Promise<{ path?: string; src?: string; requestId?: string }> {
    const res = await this.api.authProvider.fetchWithToken(
      `${this.url}/rename`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, branch: this.rawBranchForBody() }),
      }
    );

    const body = await res.json().catch(() => null);

    if (res.status !== 200 || body?.success !== true) {
      throw this.toCloudRenameError(res.status, body);
    }
    return body;
  }

  private async renameCloudDirect(from: string, to: string): Promise<Media> {
    const result = await this.postCloudRename(from, to);

    if (result.requestId) {
      try {
        await this.waitForRequestStatus(
          result.requestId,
          'Time out waiting for rename to complete'
        );
      } catch (error) {
        // The asset is already renamed in the media index at this point, so
        // report the unconfirmed commit without claiming the rename failed.
        const detail =
          error instanceof Error && error.message
            ? `${error.message}. `
            : 'Failed to confirm the rename. ';
        throw new MediaRenameError({
          code: 'BACKEND_FAILURE',
          message: `${detail}The file may still have been renamed — refresh the media library to check.`,
        });
      }
    }

    // `path` is the server-sanitised target and may differ from what we sent.
    return this.resolveRenamedMedia(result.path || to, result.src);
  }

  /**
   * A protected media branch cannot be renamed directly, so the rename is
   * staged on a workflow branch. Completion is the *workflow* status, not the
   * rename request status: only the former waits for the branch, the index and
   * the pull request.
   */
  private async renameCloudViaWorkflow(
    from: string,
    to: string,
    branchContext: MediaBranchContext
  ): Promise<Media> {
    let renamed: Media | undefined;

    try {
      // The rename's own requestId is deliberately not awaited: the workflow
      // status is what waits for the branch, the index and the pull request.
      const result = await this.postCloudRename(from, to);

      await this.finalizeMediaWorkflow(branchContext, async () => {
        renamed = await this.resolveRenamedMedia(result.path || to, result.src);
      });
    } catch (err) {
      // Reached when the rename itself fails, which leaves the progress modal
      // up with no error of its own to show — so dismiss it here.
      this.resetWorkflowState();
      this.cms.events.dispatch({ type: 'media:workflow:finish' });
      throw err;
    }

    // finalizeMediaWorkflow reports failures through `media:workflow:error`
    // rather than throwing, and skips the post-catalogue step when it fails.
    // An unresolved entry is therefore the only signal we have that the
    // workflow did not complete, and we must not report success without it.
    //
    // This check sits outside the block above on purpose: dispatching
    // `media:workflow:finish` here would return the overlay to idle and hide
    // the workflow error it is already showing.
    if (!renamed) {
      throw new MediaRenameError({
        code: 'BACKEND_FAILURE',
        message:
          'The rename was staged but the branch workflow did not complete. ' +
          'Check the branch in TinaCloud before trying again.',
      });
    }
    return renamed;
  }

  private async prepareRenameBranch(
    from: string,
    to: string
  ): Promise<MediaBranchDecision> {
    if (!this.api.usingProtectedBranch()) return { kind: 'direct' };

    const baseBranch = decodeURIComponent(this.api.branch || '');
    const { directory, filename } = this.splitMediaPath(from);
    const branchName = `media-rename-${this.branchSlugForMediaPath(
      directory,
      filename
    )}`;

    return this.requestMediaBranchChoice(branchName, baseBranch, {
      opType: 'rename',
      // The source verbatim: it exists under its stored name, which
      // re-sanitising could move off for legacy or externally added files.
      repoPath: from,
      targetRepoPath: to,
      // Renames on a protected branch always go through the workflow, so the
      // direct action is not offered — unlike upload and delete, which keep it.
      allowSaveToProtectedBranch: false,
    });
  }

  /**
   * The branch name for a JSON body. `encodedBranchParam` is for query strings;
   * bodies take the raw name, and never the literal string `"undefined"`.
   */
  private rawBranchForBody(): string {
    if (this.workflowBranchOverride) return this.workflowBranchOverride;
    if (!this.api.branch) return '';
    const decoded = decodeURIComponent(this.api.branch);
    return !decoded || decoded === 'undefined' ? '' : decoded;
  }

  private splitMediaPath(path: string): {
    directory: string;
    filename: string;
  } {
    const lastSlash = path.lastIndexOf('/');
    return lastSlash === -1
      ? { directory: '', filename: path }
      : {
          directory: path.slice(0, lastSlash),
          filename: path.slice(lastSlash + 1),
        };
  }

  /**
   * Resolves the renamed asset to a listing entry, which is the source of
   * truth for the `src` URL (staging path and per-stage CDN host) and carries
   * the thumbnails the media manager renders. Falls back to the fields the
   * rename response returned when the entry isn't on the first page, since the
   * caller hands this straight to the media manager's preview.
   */
  private async resolveRenamedMedia(
    targetPath: string,
    srcFromResponse?: string
  ): Promise<Media> {
    const { directory, filename } = this.splitMediaPath(targetPath);

    try {
      const listed = await this.list({
        directory,
        limit: 100,
        thumbnailSizes: CANONICAL_THUMBNAIL_SIZES,
      });
      const entry = listed.items.find(
        (item) => item.type === 'file' && item.filename === filename
      );
      if (entry) return entry;
    } catch (error) {
      console.error('Failed to fetch the canonical media entry:', error);
    }

    const src = srcFromResponse || '';
    return {
      type: 'file',
      id: filename,
      filename,
      directory,
      src,
      thumbnails: CANONICAL_THUMBNAIL_SIZES.reduce(
        (acc, size) => {
          acc[`${size.w}x${size.h}`] = this.genThumbnail(src, size);
          return acc;
        },
        {} as Record<string, string>
      ),
    };
  }

  private toCloudRenameError(status: number, body: any): MediaRenameError {
    const message =
      typeof body?.message === 'string' && body.message
        ? body.message
        : 'Failed to rename the file.';

    if (
      typeof body?.code === 'string' &&
      (RENAME_ERROR_CODES as string[]).includes(body.code)
    ) {
      return new MediaRenameError({
        code: body.code as MediaRenameErrorCode,
        message,
      });
    }

    // No usable code: fall back on the status. Unlike the local dev server, a
    // 404 here means the asset is missing, not that the route is unavailable.
    let code: MediaRenameErrorCode;
    if (status === 401 || status === 403) {
      code = 'UNAUTHORIZED';
    } else if (status === 404) {
      code = 'NOT_FOUND';
    } else if (status === 409) {
      code = 'NAME_COLLISION';
    } else {
      code = 'BACKEND_FAILURE';
    }
    return new MediaRenameError({ code, message });
  }

  private toRenameError(status: number, body: any): MediaRenameError {
    if (body?.code) {
      return new MediaRenameError({
        code: body.code,
        message: body.message || 'Failed to rename the file.',
      });
    }
    // No structured body: a CLI predating the /media/rename route lets the
    // request fall through to the dev server's own handling.
    return new MediaRenameError({
      code:
        status === 404 || status === 200 ? 'UNSUPPORTED' : 'BACKEND_FAILURE',
      message:
        status === 404 || status === 200
          ? 'This version of the TinaCMS CLI does not support renaming media. Update @tinacms/cli to rename files.'
          : 'Failed to rename the file.',
    });
  }

  async persist(media: MediaUploadOptions[]): Promise<Media[]> {
    this.setup();

    // Also covers static repo media, which browses read-only self-hosted but
    // still can't accept uploads without an external store.
    if (this.isUnsupportedSelfHostedRepoMedia()) {
      throw E_SELF_HOSTED_MEDIA;
    }

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
        `${this.listUrl}/list/${options.directory || ''}?limit=${
          options.limit || 20
        }${options.offset ? `&cursor=${options.offset}` : ''}${
          encodedBranch ? `&branch=${encodedBranch}` : ''
        }${options.search ? `&search=${encodeURIComponent(options.search)}` : ''}`
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
        }${options.offset ? `&cursor=${options.offset}` : ''}${
          options.search ? `&search=${encodeURIComponent(options.search)}` : ''
        }`
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
    if (this.isUnsupportedSelfHostedRepoMedia()) {
      throw E_SELF_HOSTED_MEDIA;
    }

    const path = this.joinMediaPath(media.directory, media.filename);
    if (!this.isLocal) {
      if (await this.isAuthenticated()) {
        const decision = await this.prepareProtectedMediaBranch(
          'delete',
          media.directory,
          media.filename
        );
        if (decision.kind === 'cancelled') return;
        await this.runMediaOpWithWorkflow(decision, async () => {
          const branchQuery = this.branchQueryParam();
          const res = await this.api.authProvider.fetchWithToken(
            `${this.url}/${path}${branchQuery}`,
            { method: 'DELETE' }
          );
          if (res.status !== 200) {
            throw new Error('Unexpected error deleting media asset');
          }
          const { requestId } = await res.json();

          if (decision.kind !== 'workflow') {
            await this.waitForRequestStatus(
              requestId,
              'Time out waiting for delete to complete'
            );
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
