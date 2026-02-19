/**

*/

import path, { join } from 'path';
import fs from 'fs-extra';
import { parseMediaFolder } from '../../utils/';
import { PathTraversalError } from '../../utils/path';

interface MediaArgs {
  searchPath: string;
  cursor?: string;
  limit?: string;
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
  publicFolder: string;
  mediaRoot: string;
}

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
 */
const ENCODED_TRAVERSAL_RE = /%2e%2e|%2f|%5c/i;

/**
 * Resolve `userPath` against `baseDir` and verify it falls within the base.
 * Allows an exact match (returns the base itself) or a subdirectory.
 *
 * As a safety net, also rejects paths that still contain URL-encoded
 * traversal sequences (`%2e%2e`, `%2f`, `%5c`), catching cases where the
 * caller forgot to decode.
 *
 * Inlined in this file (rather than imported from utils/path) so that
 * CodeQL's js/path-injection taint-tracking can follow the path.resolve +
 * startsWith sanitisation within a single call boundary.
 */
function resolveWithinBase(userPath: string, baseDir: string): string {
  if (ENCODED_TRAVERSAL_RE.test(userPath)) {
    throw new PathTraversalError(userPath);
  }
  const resolvedBase = path.resolve(baseDir);
  const resolved = path.resolve(path.join(baseDir, userPath));
  if (resolved === resolvedBase) {
    return resolvedBase;
  }
  if (resolved.startsWith(resolvedBase + path.sep)) {
    return resolved;
  }
  throw new PathTraversalError(userPath);
}

/**
 * Like `resolveWithinBase` but rejects an exact base match — only
 * paths strictly inside the base directory are allowed.
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
  return resolved;
}

type SuccessRecord = { ok: true } | { ok: false; message: string };
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
      let filesStr: string[] = [];
      try {
        filesStr = await fs.readdir(validatedPath);
      } catch (error) {
        return {
          files: [],
          directories: [],
        };
      }
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
      const limitItems = sortedItems.slice(offset, offset + limit);
      const files = limitItems.filter((x) => x.isFile);
      const directories = limitItems.filter((x) => !x.isFile).map((x) => x.src);

      const cursor =
        rawItems.length > offset + limit ? String(offset + limit) : null;

      return {
        files,
        directories,
        cursor,
      };
    } catch (error) {
      if (error instanceof PathTraversalError) throw error;
      console.error(error);
      return {
        files: [],
        directories: [],
        error: error?.toString(),
      };
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
      if (error instanceof PathTraversalError) throw error;
      console.error(error);
      return { ok: false, message: error?.toString() };
    }
  }
}
