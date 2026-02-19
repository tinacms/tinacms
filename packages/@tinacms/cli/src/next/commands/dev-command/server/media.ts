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
      const folder = requestURL.pathname.replace('/media/list/', '');
      const limit = requestURL.searchParams.get('limit');
      const cursor = requestURL.searchParams.get('cursor');
      const media = await mediaModel.listMedia({
        searchPath: folder,
        cursor,
        limit,
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
      const file = req.url.slice('/media/'.length);
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

  const handlePost = async function (
    req: Connect.IncomingMessage,
    res: ServerResponse
  ) {
    const bb = busboy({ headers: req.headers });
    let responded = false;

    bb.on('file', async (_name, file, _info) => {
      const fullPath = decodeURI(req.url?.slice('/media/upload/'.length));
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

  return { handleList, handleDelete, handlePost };
};

export const parseMediaFolder = (str: string) => {
  let returnString = str;
  if (returnString.startsWith('/')) returnString = returnString.substr(1);

  if (returnString.endsWith('/'))
    returnString = returnString.substr(0, returnString.length - 1);

  return returnString;
};

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
  apiURL: string;
  publicFolder: string;
  mediaRoot: string;
}

type SuccessRecord = { ok: true } | { ok: false; message: string };

/**
 * Resolve `userPath` against `baseDir` and verify it falls within the base.
 * Allows an exact match (returns the base itself) or a subdirectory.
 *
 * Inlined in this file (rather than imported from utils/path) so that
 * CodeQL's js/path-injection taint-tracking can follow the path.resolve +
 * startsWith sanitisation within a single call boundary.
 */
function resolveWithinBase(userPath: string, baseDir: string): string {
  const resolvedBase = path.resolve(baseDir);
  const resolved = path.resolve(
    path.join(baseDir, decodeURIComponent(userPath))
  );
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
  const resolvedBase = path.resolve(baseDir) + path.sep;
  const resolved = path.resolve(
    path.join(baseDir, decodeURIComponent(userPath))
  );
  if (!resolved.startsWith(resolvedBase)) {
    throw new PathTraversalError(userPath);
  }
  return resolved;
}

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
