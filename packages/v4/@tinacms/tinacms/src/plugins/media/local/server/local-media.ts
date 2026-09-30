import type { Dirent } from 'node:fs';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { invariant } from '../../../../core/invariant';
import {
  DEFAULT_MEDIA_ROOT,
  type MediaItem,
  type MediaPage,
  type MediaPageRequest,
} from '../../../../core/media/contract';
import { isMissingFileError, realPathOf } from '../../../../server/real-path';

export interface LocalMediaOptions {
  rootDir: string;
  publicFolder: string;
  mediaRoot?: string;
}

export interface LocalMedia {
  mediaDir: string;
  list(folder: string, page?: MediaPageRequest): Promise<MediaPage>;
  save(file: File, folder?: string): Promise<string>;
  delete(mediaPath: string): Promise<void>;
}

export const DEFAULT_MEDIA_PAGE_SIZE = 50;

const toMediaPath = (mediaDir: string, absolute: string): string =>
  path.relative(mediaDir, absolute).split(path.sep).join('/');

const byKindThenName = (left: MediaItem, right: MediaItem): number => {
  if (left.kind !== right.kind) return left.kind === 'directory' ? -1 : 1;
  return left.path.localeCompare(right.path);
};

export const createLocalMedia = (options: LocalMediaOptions): LocalMedia => {
  const mediaDir = path.resolve(
    options.rootDir,
    options.publicFolder,
    options.mediaRoot ?? DEFAULT_MEDIA_ROOT
  );

  const resolveInside = async (
    mediaPath: string,
    { allowRoot }: { allowRoot: boolean }
  ): Promise<string> => {
    invariant(
      !mediaPath.includes('\0'),
      'media-path-null-byte',
      'A media path cannot hold a null byte.'
    );
    const absolute = path.resolve(mediaDir, mediaPath);
    const [realRoot, realAbsolute] = await Promise.all([
      realPathOf(mediaDir),
      realPathOf(absolute),
    ]);
    const isInside = (root: string, candidate: string) =>
      candidate.startsWith(root + path.sep) ||
      (allowRoot && candidate === root);
    invariant(
      isInside(mediaDir, absolute) && isInside(realRoot, realAbsolute),
      'media-path-outside-root',
      `Path "${mediaPath}" is outside the media folder.`
    );
    return absolute;
  };

  return {
    mediaDir,

    async list(folder, page = {}) {
      const absolute = await resolveInside(folder, { allowRoot: true });
      let dirents: Dirent[];
      try {
        dirents = await fs.readdir(absolute, { withFileTypes: true });
      } catch (cause) {
        if (isMissingFileError(cause)) return { items: [] };
        throw cause;
      }
      const items = dirents
        .filter(
          (dirent) =>
            !dirent.name.startsWith('.') &&
            (dirent.isFile() || dirent.isDirectory())
        )
        .map(
          (dirent): MediaItem => ({
            path: toMediaPath(mediaDir, path.join(absolute, dirent.name)),
            kind: dirent.isDirectory() ? 'directory' : 'file',
          })
        )
        .sort(byKindThenName);
      const start = Number(page.cursor ?? 0);
      const end = start + (page.limit ?? DEFAULT_MEDIA_PAGE_SIZE);
      return {
        items: items.slice(start, end),
        ...(end < items.length ? { cursor: String(end) } : {}),
      };
    },

    async save(file, folder = '') {
      const name = file.name;
      invariant(
        name.length > 0 &&
          name !== '.' &&
          name !== '..' &&
          path.basename(name) === name &&
          !name.includes('\\'),
        'media-file-name-invalid',
        `"${name}" is not a valid file name.`
      );
      const absolute = await resolveInside(path.posix.join(folder, name), {
        allowRoot: false,
      });
      await fs.mkdir(path.dirname(absolute), { recursive: true });
      await fs.writeFile(absolute, Buffer.from(await file.arrayBuffer()));
      return toMediaPath(mediaDir, absolute);
    },

    async delete(mediaPath) {
      const absolute = await resolveInside(mediaPath, { allowRoot: false });
      const stats = await fs.lstat(absolute);
      invariant(
        stats.isFile(),
        'media-delete-not-file',
        `"${mediaPath}" is not a file. Only files can be deleted.`
      );
      await fs.unlink(absolute);
    },
  };
};
