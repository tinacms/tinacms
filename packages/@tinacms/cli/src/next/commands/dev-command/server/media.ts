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

  const handlePost = async function (
    req: Connect.IncomingMessage,
    res: ServerResponse
  ) {
    const bb = busboy({ headers: req.headers });

    bb.on('file', async (_name, file, _info) => {
      const fullPath = decodeURI(req.url?.slice('/media/upload/'.length));
      // Inline path.resolve + startsWith guard so CodeQL's js/path-injection
      // taint-tracking recognises the sanitisation (it cannot follow the
      // equivalent logic inside assertPathWithinBase across a call boundary).
      const resolvedMediaBase = path.resolve(mediaFolder) + path.sep;
      const saveTo = path.resolve(path.join(mediaFolder, fullPath));
      if (!saveTo.startsWith(resolvedMediaBase)) {
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
      res.statusCode = 500;
      if (error instanceof Error) {
        res.end(JSON.stringify({ message: error }));
      } else {
        res.end(JSON.stringify({ message: 'Unknown error while uploading' }));
      }
    });
    bb.on('close', () => {
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
      // Inline path.resolve + startsWith guard so CodeQL's js/path-injection
      // taint-tracking recognises the sanitisation (it cannot follow the
      // equivalent logic inside assertPathWithinBase across a call boundary).
      //
      // We use an if/else-if/else structure so that:
      //   1. Exact base match (root listing): uses resolvedBase (untainted)
      //   2. Subdirectory: uses folderPath only after startsWith confirms it
      //      is within the base (CodeQL recognises this as a barrier guard)
      //   3. Everything else: throws
      const resolvedBase = path.resolve(mediaBase);
      const folderPath = path.resolve(
        path.join(mediaBase, decodeURIComponent(args.searchPath))
      );

      let validatedPath: string;
      if (folderPath === resolvedBase) {
        // Listing the media root itself — use the untainted base path
        validatedPath = resolvedBase;
      } else if (folderPath.startsWith(resolvedBase + path.sep)) {
        // Subdirectory within the media root — startsWith acts as CodeQL
        // barrier guard, so folderPath is sanitised in this branch
        validatedPath = folderPath;
      } else {
        throw new PathTraversalError(args.searchPath);
      }

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
      // Inline path.resolve + startsWith guard so CodeQL's js/path-injection
      // taint-tracking recognises the sanitisation (it cannot follow the
      // equivalent logic inside assertPathWithinBase across a call boundary).
      const resolvedBase = path.resolve(mediaBase) + path.sep;
      const file = path.resolve(
        path.join(mediaBase, decodeURIComponent(args.searchPath))
      );
      if (!file.startsWith(resolvedBase)) {
        throw new PathTraversalError(args.searchPath);
      }
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
