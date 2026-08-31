import { randomUUID } from 'crypto';
import type { ServerResponse } from 'http';
import path, { join } from 'path';
import busboy from 'busboy';
import fs from 'fs-extra';
import type { Connect } from 'vite';
import { PathTraversalError } from '../../../../utils/path';

export const createMediaRouter = (config: PathConfig) => {
  const mediaFolder = path.join(
    config.rootPath,
    config.publicFolder,
    config.mediaRoot
  );

  const mediaModel = new MediaModel(config);

  const handleList = async (req, res) => {
    try {
      const requestURL = new URL(req.url, config.apiURL);
      // @security User-controlled path — decoded here, validated inside
      // mediaModel.listMedia via resolveWithinBase.
      const folder = decodeURIComponent(
        requestURL.pathname.replace('/media/list/', '')
      );
      const limit = requestURL.searchParams.get('limit');
      const cursor = requestURL.searchParams.get('cursor');
      const search = requestURL.searchParams.get('search');
      const ext = requestURL.searchParams.get('ext');
      const media = await mediaModel.listMedia({
        searchPath: folder,
        cursor,
        limit,
        search,
        ext,
      });
      res.end(JSON.stringify(media));
    } catch (error) {
      if (error instanceof PathTraversalError) {
        res.statusCode = 403;
        res.end(JSON.stringify({ error: error.message }));
        return;
      }
      throw error;
    }
  };

  const handleDelete = async (req: Connect.IncomingMessage, res) => {
    try {
      // @security User-controlled path — decoded here, validated inside
      // mediaModel.deleteMedia via resolveStrictlyWithinBase.
      const file = decodeURIComponent(req.url.slice('/media/'.length));
      const didDelete = await mediaModel.deleteMedia({ searchPath: file });
      res.end(JSON.stringify(didDelete));
    } catch (error) {
      if (error instanceof PathTraversalError) {
        res.statusCode = 403;
        res.end(JSON.stringify({ error: error.message }));
        return;
      }
      throw error;
    }
  };

  const handleRename = async (req: Connect.IncomingMessage, res) => {
    // Body is populated by the bodyParser.json middleware registered ahead of
    // this router, the same way the /graphql route consumes it.
    const body = (req as unknown as { body?: unknown }).body;
    const { from, to } = (body as { from?: unknown; to?: unknown }) || {};

    if (typeof from !== 'string' || typeof to !== 'string' || !from || !to) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          code: 'INVALID_FILENAME',
          message: 'Both "from" and "to" are required.',
        })
      );
      return;
    }

    try {
      const result = await mediaModel.renameMedia({ from, to });
      // `in` rather than `result.ok`: this repo compiles with `strict: false`,
      // where boolean-literal discriminants do not narrow.
      if ('code' in result) {
        res.statusCode = RENAME_ERROR_STATUS[result.code];
        res.end(JSON.stringify({ code: result.code, message: result.message }));
        return;
      }
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, from, to }));
    } catch (error) {
      if (error instanceof PathTraversalError) {
        res.statusCode = 403;
        res.end(
          JSON.stringify({ code: 'INVALID_PATH', message: error.message })
        );
        return;
      }
      throw error;
    }
  };

  const handlePost = async function (
    req: Connect.IncomingMessage,
    res: ServerResponse
  ) {
    const bb = busboy({ headers: req.headers });
    let responded = false;

    bb.on('file', async (_name, file, _info) => {
      // @security User-controlled path — decoded here, validated immediately
      // below via resolveStrictlyWithinBase.
      const fullPath = decodeURIComponent(
        req.url?.slice('/media/upload/'.length)
      );
      let saveTo: string;
      try {
        saveTo = resolveStrictlyWithinBase(fullPath, mediaFolder);
      } catch {
        responded = true;
        file.resume(); // drain the stream to avoid hanging
        res.statusCode = 403;
        res.end(
          JSON.stringify({
            error: `Path traversal detected: ${fullPath}`,
          })
        );
        return;
      }
      // make sure the directory exists before writing the file. This is needed for creating new folders
      await fs.ensureDir(path.dirname(saveTo));
      file.pipe(fs.createWriteStream(saveTo));
    });
    bb.on('error', (error) => {
      responded = true;
      res.statusCode = 500;
      if (error instanceof Error) {
        res.end(JSON.stringify({ message: error }));
      } else {
        res.end(JSON.stringify({ message: 'Unknown error while uploading' }));
      }
    });
    bb.on('close', () => {
      if (responded) return;
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true }));
    });
    req.pipe(bb);
  };

  return { handleList, handleDelete, handlePost, handleRename };
};

export const parseMediaFolder = (str: string) => {
  let returnString = str;
  if (returnString.startsWith('/')) returnString = returnString.substr(1);

  if (returnString.endsWith('/'))
    returnString = returnString.substr(0, returnString.length - 1);

  return returnString;
};

/**
 * Lowercased extension without the dot. Query strings and dotfiles yield ''.
 * Mirrors `extensionOf` in @tinacms/schema-tools — duplicated rather than
 * imported so the dev server keeps no runtime dependency on the toolkit.
 */
const extensionOf = (value: string): string => {
  const withoutQuery = value.split(/[?#]/)[0];
  const dot = withoutQuery.lastIndexOf('.');
  const slash = withoutQuery.lastIndexOf('/');
  return dot > slash + 1 ? withoutQuery.slice(dot + 1).toLowerCase() : '';
};

/** Parses the `ext` param. An empty or all-blank value means "no filter". */
const parseExt = (ext?: string): string[] =>
  (ext ?? '')
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);

interface MediaArgs {
  searchPath: string;
  cursor?: string;
  limit?: string;
  search?: string;
  /** Comma-separated extensions, without the dot. Empty means no filter. */
  ext?: string;
}

interface File {
  src: string;
  filename: string;
  size: number;
}

interface FileRes {
  src: string;
  filename: string;
  size: number;
  isFile: boolean;
}
interface ListMediaRes {
  directories: string[];
  files: File[];
  cursor?: string;
  error?: string;
}
export interface PathConfig {
  rootPath: string;
  apiURL: string;
  publicFolder: string;
  mediaRoot: string;
}

type SuccessRecord = { ok: true } | { ok: false; message: string };

export type RenameFailureCode =
  | 'NOT_FOUND'
  | 'NAME_COLLISION'
  | 'UNSUPPORTED'
  | 'BACKEND_FAILURE';

type RenameRecord =
  | { ok: true }
  | { ok: false; code: RenameFailureCode; message: string };

const RENAME_ERROR_STATUS: Record<RenameFailureCode, number> = {
  NOT_FOUND: 404,
  NAME_COLLISION: 409,
  UNSUPPORTED: 400,
  BACKEND_FAILURE: 500,
};

/**
 * Raised when a staged rename cannot put the file back where it started, so
 * the file is left under the staging name. Carries that name so the response
 * can tell the editor where to find it.
 */
class StagedRenameError extends Error {
  constructor(public readonly stagingName: string) {
    super(`Left the file as "${stagingName}" in the same folder.`);
  }
}

/** fs-extra's move rejects an existing destination with a bare message. */
const isDestinationExistsError = (error: unknown) =>
  (error as { code?: string })?.code === 'EEXIST' ||
  /dest already exists/i.test((error as Error)?.message || '');

/**
 * Detects URL-encoded path-traversal sequences that should have been
 * decoded by the caller.  Acts as a safety net: if a caller forgets to
 * call `decodeURIComponent`, the still-encoded `%2e%2e%2f` would bypass
 * the `path.resolve + startsWith` check (Node treats the `%` literally).
 *
 * Matches (case-insensitive):
 *   %2e%2e → ..  (double-dot – directory traversal)
 *   %2f    → /   (forward slash)
 *   %5c    → \   (backslash – Windows separator)
 *
 * A single %2e (encoded dot) is NOT matched — it is harmless and may
 * appear in legitimate filenames or dotfile paths.
 *
 * @security DUPLICATED from `@tinacms/cli/src/utils/path.ts`.
 * Keep in sync with the canonical copy.
 */
const ENCODED_TRAVERSAL_RE = /%2e%2e|%2f|%5c/i;

/**
 * Follows symlinks to determine where a path actually points on disk.
 *
 * If the full path exists, returns its `fs.realpathSync` result. If it
 * doesn't (e.g. a file that will be created by a write/upload), walks up
 * the directory tree until it finds an ancestor that does exist, resolves
 * that ancestor's real path, and re-appends the remaining segments.
 *
 * @security INLINED for CodeQL taint-tracking (see module-level comment).
 * @param candidate - An absolute path that may or may not exist on disk.
 * @returns The real (symlink-resolved) absolute path.
 */
function resolveRealPath(candidate: string): string {
  try {
    return fs.realpathSync(candidate);
  } catch {
    const parent = path.dirname(candidate);
    if (parent === candidate) return candidate;
    return path.join(resolveRealPath(parent), path.basename(candidate));
  }
}

/**
 * Verifies that a path doesn't escape the base directory via symlinks or
 * junctions (CWE-59). Resolves both the base and the candidate to their
 * real filesystem locations, then checks containment.
 *
 * Silently skips the check if the base directory doesn't exist on disk
 * (the caller's lexical check is sufficient in that case since no real
 * I/O can occur).
 *
 * @security INLINED for CodeQL taint-tracking (see module-level comment).
 * @param resolved     - The lexically-validated absolute path.
 * @param resolvedBase - The absolute base directory (without trailing sep).
 * @param userPath     - The original untrusted input (for error messages).
 */
function assertSymlinkWithinBase(
  resolved: string,
  resolvedBase: string,
  userPath: string
): void {
  try {
    const realBase = fs.realpathSync(resolvedBase);
    const realResolved = resolveRealPath(resolved);
    if (
      realResolved !== realBase &&
      !realResolved.startsWith(realBase + path.sep)
    ) {
      throw new PathTraversalError(userPath);
    }
  } catch (err) {
    if (err instanceof PathTraversalError) throw err;
  }
}

/**
 * Resolve `userPath` against `baseDir` and verify it falls within the base.
 * Allows an exact match (returns the base itself) or a subdirectory.
 *
 * As a safety net, also rejects paths that still contain URL-encoded
 * traversal sequences (`%2e%2e`, `%2f`, `%5c`), catching cases where the
 * caller forgot to decode.
 *
 * @security INLINED (not imported) so that CodeQL's js/path-injection
 * taint-tracking can follow the `path.resolve + startsWith` sanitisation
 * within a single call boundary. The canonical implementation lives in
 * `@tinacms/cli/src/utils/path.ts` — keep the two in sync.
 *
 * @param userPath - Untrusted path from the request (must already be decoded).
 * @param baseDir  - Trusted base directory the path must stay within.
 */
function resolveWithinBase(userPath: string, baseDir: string): string {
  if (ENCODED_TRAVERSAL_RE.test(userPath)) {
    throw new PathTraversalError(userPath);
  }
  const resolvedBase = path.resolve(baseDir);
  const resolved = path.resolve(path.join(baseDir, userPath));
  if (resolved === resolvedBase) {
    assertSymlinkWithinBase(resolved, resolvedBase, userPath);
    return resolvedBase;
  }
  if (resolved.startsWith(resolvedBase + path.sep)) {
    assertSymlinkWithinBase(resolved, resolvedBase, userPath);
    return resolved;
  }
  throw new PathTraversalError(userPath);
}

/**
 * Like `resolveWithinBase` but rejects an exact base match — only
 * paths strictly inside the base directory are allowed.
 *
 * Use this for destructive operations (delete, overwrite) where targeting
 * the media root directory itself would be dangerous.
 *
 * @security INLINED (not imported) so that CodeQL's js/path-injection
 * taint-tracking can follow the sanitisation within a single call boundary.
 * The canonical implementation lives in `@tinacms/cli/src/utils/path.ts`.
 */
function resolveStrictlyWithinBase(userPath: string, baseDir: string): string {
  if (ENCODED_TRAVERSAL_RE.test(userPath)) {
    throw new PathTraversalError(userPath);
  }
  const resolvedBase = path.resolve(baseDir) + path.sep;
  const resolved = path.resolve(path.join(baseDir, userPath));
  if (!resolved.startsWith(resolvedBase)) {
    throw new PathTraversalError(userPath);
  }
  assertSymlinkWithinBase(resolved, path.resolve(baseDir), userPath);
  return resolved;
}

/**
 * Handles media file operations (list, delete) for the Vite-based dev server.
 *
 * @security Every method that accepts a user-supplied `searchPath` validates
 * it against the media root using `resolveWithinBase` (list) or
 * `resolveStrictlyWithinBase` (delete) before any filesystem access.
 *
 * - **list** uses `resolveWithinBase` because listing the media root itself
 *   (empty path / exact base match) is a valid operation.
 * - **delete** uses `resolveStrictlyWithinBase` because deleting the media
 *   root directory itself must never be allowed.
 *
 * Both methods catch `PathTraversalError` and re-throw it so that the
 * route handler can return a 403 response. Other errors are caught and
 * returned as structured error responses (this avoids leaking stack traces
 * to the client).
 */
export class MediaModel {
  public readonly rootPath: string;
  public readonly publicFolder: string;
  public readonly mediaRoot: string;
  constructor({ rootPath, publicFolder, mediaRoot }: PathConfig) {
    this.rootPath = rootPath;
    this.mediaRoot = mediaRoot;
    this.publicFolder = publicFolder;
  }
  async listMedia(args: MediaArgs): Promise<ListMediaRes> {
    try {
      const mediaBase = join(this.rootPath, this.publicFolder, this.mediaRoot);
      const validatedPath = resolveWithinBase(args.searchPath, mediaBase);

      const searchPath = parseMediaFolder(args.searchPath);
      // if the path does not exist, return an empty array
      if (!(await fs.pathExists(validatedPath))) {
        return {
          files: [],
          directories: [],
        };
      }

      const ext = parseExt(args.ext);

      const search = args.search?.trim().toLowerCase();
      if (search) {
        return await this.searchMedia({
          mediaBase,
          validatedPath,
          searchPath,
          search,
          ext,
          cursor: args.cursor,
          limit: args.limit,
        });
      }

      const filesStr = await fs.readdir(validatedPath);
      const filesProm: Promise<FileRes>[] = filesStr.map(async (file) => {
        const filePath = join(validatedPath, file);
        const stat = await fs.stat(filePath);

        let src = `/${file}`;

        const isFile = stat.isFile();

        // It seems like our media manager wants relative paths for dirs.
        if (!isFile) {
          return {
            isFile,
            size: stat.size,
            src,
            filename: file,
          };
        }

        if (searchPath) {
          src = `/${searchPath}${src}`;
        }
        if (this.mediaRoot) {
          src = `/${this.mediaRoot}${src}`;
        }

        return {
          isFile,
          size: stat.size,
          src: src,
          filename: file,
        };
      });

      const offset = Number(args.cursor) || 0;
      const limit = Number(args.limit) || 20;

      const rawItems = await Promise.all(filesProm);
      const sortedItems = rawItems.sort((a, b) => {
        if (a.isFile && !b.isFile) {
          return 1;
        }
        if (!a.isFile && b.isFile) {
          return -1;
        }
        return 0;
      });
      const allDirectories = sortedItems
        .filter((x) => !x.isFile)
        .map((x) => x.src);
      const allFiles = sortedItems
        .filter((x) => x.isFile)
        .filter((x) => !ext.length || ext.includes(extensionOf(x.filename)));

      const directories = offset === 0 ? allDirectories : [];
      const files = allFiles.slice(offset, offset + limit);
      const cursor =
        allFiles.length > offset + limit ? String(offset + limit) : null;

      return {
        files,
        directories,
        cursor,
      };
    } catch (error) {
      // @security PathTraversalError must propagate to the route handler so
      // it can return 403. All other errors are caught here to avoid leaking
      // internal details to the client.
      if (error instanceof PathTraversalError) throw error;
      console.error(error);
      return {
        files: [],
        directories: [],
        error: error?.toString(),
      };
    }
  }
  private async searchMedia({
    mediaBase,
    validatedPath,
    searchPath,
    search,
    ext,
    cursor,
    limit,
  }: {
    mediaBase: string;
    validatedPath: string;
    searchPath: string;
    search: string;
    ext: string[];
    cursor?: string;
    limit?: string;
  }): Promise<ListMediaRes> {
    const resolvedBase = path.resolve(mediaBase);
    const files: File[] = [];
    const directories: string[] = [];
    const visitedDirs = new Set<string>([resolveRealPath(validatedPath)]);

    const walk = async (dir: string, relPrefix: string) => {
      let entries: string[];
      try {
        entries = await fs.readdir(dir);
      } catch {
        return;
      }
      const stats = await Promise.all(
        entries.map(async (entry) => {
          const absPath = join(dir, entry);
          // @security Skip entries whose real path escapes the media root
          // (symlink/junction), matching resolveWithinBase for the recursive walk.
          try {
            assertSymlinkWithinBase(absPath, resolvedBase, absPath);
          } catch {
            return null;
          }
          try {
            return { entry, absPath, stat: await fs.stat(absPath) };
          } catch {
            return null;
          }
        })
      );

      for (const entryStat of stats) {
        if (!entryStat) continue;
        const { entry, absPath, stat } = entryStat;
        const relPath = relPrefix ? `${relPrefix}/${entry}` : entry;
        if (stat.isDirectory()) {
          // @security Symlinked directories inside the media root pass the
          // containment check, so track real paths to break traversal cycles.
          const realDir = resolveRealPath(absPath);
          if (visitedDirs.has(realDir)) continue;
          visitedDirs.add(realDir);
          if (entry.toLowerCase().includes(search)) {
            directories.push(`/${relPath}`);
          }
          await walk(absPath, relPath);
          continue;
        }
        if (!relPath.toLowerCase().includes(search)) continue;
        if (ext.length && !ext.includes(extensionOf(entry))) continue;

        let src = `/${relPath}`;
        if (searchPath) src = `/${searchPath}${src}`;
        if (this.mediaRoot) src = `/${this.mediaRoot}${src}`;
        files.push({ src, filename: relPath, size: stat.size });
      }
    };

    await walk(validatedPath, '');
    files.sort((a, b) => a.filename.localeCompare(b.filename));
    directories.sort();

    const offset = Number(cursor) || 0;
    const pageSize = Number(limit) || 20;

    return {
      files: files.slice(offset, offset + pageSize),
      directories: offset === 0 ? directories : [],
      cursor:
        files.length > offset + pageSize ? String(offset + pageSize) : null,
    };
  }

  /**
   * @security Both paths go through `resolveStrictlyWithinBase`, which rejects
   * traversal, symlink escapes and the media root itself.
   */
  async renameMedia(args: { from: string; to: string }): Promise<RenameRecord> {
    const mediaBase = join(this.rootPath, this.publicFolder, this.mediaRoot);
    const source = resolveStrictlyWithinBase(args.from, mediaBase);
    const destination = resolveStrictlyWithinBase(args.to, mediaBase);

    try {
      const stats = await fs.stat(source);
      if (stats.isDirectory()) {
        return {
          ok: false,
          code: 'UNSUPPORTED',
          message: 'Renaming folders is not supported.',
        };
      }
    } catch {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: `"${args.from}" does not exist.`,
      };
    }

    // On case-insensitive filesystems the destination of a case-only rename
    // reports as existing because it *is* the source.
    const isCaseOnlyRename =
      source !== destination &&
      source.toLowerCase() === destination.toLowerCase();

    if (!isCaseOnlyRename && (await fs.pathExists(destination))) {
      return {
        ok: false,
        code: 'NAME_COLLISION',
        message: `"${args.to}" already exists.`,
      };
    }

    try {
      await fs.ensureDir(path.dirname(destination));
      if (isCaseOnlyRename) {
        await this.renameViaStaging(source, destination);
      } else {
        await fs.move(source, destination, { overwrite: false });
      }
      return { ok: true };
    } catch (error) {
      // pathExists above is advisory only; the move stays overwrite-free so a
      // racing writer still surfaces as a collision rather than data loss.
      if (isDestinationExistsError(error)) {
        return {
          ok: false,
          code: 'NAME_COLLISION',
          message: `"${args.to}" already exists.`,
        };
      }
      console.error(error);
      return {
        ok: false,
        code: 'BACKEND_FAILURE',
        message:
          error instanceof StagedRenameError
            ? `Failed to rename the file. ${error.message}`
            : 'Failed to rename the file.',
      };
    }
  }

  /**
   * A case-insensitive filesystem can treat `a.jpg` -> `A.jpg` as a no-op, so
   * hop through a unique sibling name. On failure the source is put back; if
   * even that fails the file survives under the staging name, which
   * StagedRenameError reports rather than leaving it to be found by accident.
   */
  private async renameViaStaging(source: string, destination: string) {
    const stagingName = `.tina-rename-${randomUUID()}`;
    const staging = join(path.dirname(source), stagingName);
    await fs.move(source, staging, { overwrite: false });
    try {
      await fs.move(staging, destination, { overwrite: false });
    } catch (error) {
      try {
        await fs.move(staging, source, { overwrite: false });
      } catch (restoreError) {
        console.error(restoreError);
        throw new StagedRenameError(stagingName);
      }
      throw error;
    }
  }

  async deleteMedia(args: MediaArgs): Promise<SuccessRecord> {
    try {
      const mediaBase = join(this.rootPath, this.publicFolder, this.mediaRoot);
      const file = resolveStrictlyWithinBase(args.searchPath, mediaBase);
      // ensure the file exists because fs.remove does not throw an error if the file does not exist
      await fs.stat(file);
      await fs.remove(file);
      return { ok: true };
    } catch (error) {
      // @security PathTraversalError must propagate to the route handler
      // so it can return 403; other errors are swallowed into a structured response.
      if (error instanceof PathTraversalError) throw error;
      console.error(error);
      return { ok: false, message: error?.toString() };
    }
  }
}
