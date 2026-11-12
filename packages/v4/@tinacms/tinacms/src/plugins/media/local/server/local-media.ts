import { randomUUID } from 'node:crypto';
import type { Dirent } from 'node:fs';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_MEDIA_ROOT,
  MediaError,
  type MediaItem,
  type MediaPage,
  type MediaPageRequest,
} from '../../../../core/media/contract';
import { isMissingFileError, realPathOf } from '../../../../server/real-path';
import { isMediaExtension } from '../../../media-manager/media-types';

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
  rename(from: string, to: string): Promise<string>;
}

export const DEFAULT_MEDIA_PAGE_SIZE = 50;

const toMediaPath = (mediaDir: string, absolute: string): string =>
  path.relative(mediaDir, absolute).split(path.sep).join('/');

const byKindThenName = (left: MediaItem, right: MediaItem): number => {
  if (left.kind !== right.kind) return left.kind === 'directory' ? -1 : 1;
  return left.path.localeCompare(right.path);
};

const isValidFileName = (name: string): boolean =>
  name.length > 0 &&
  name !== '.' &&
  name !== '..' &&
  path.basename(name) === name &&
  !name.includes('\\');

// The whole name is read, as Node reads it: `.png` and `hero.png.` have none.
const extensionOfName = (name: string): string =>
  path.extname(name).slice(1).toLowerCase();

const hasErrorCode = (cause: unknown, code: string): boolean => {
  if (cause instanceof Error) return 'code' in cause && cause.code === code;
  return false;
};

const NO_HARD_LINK_CODES = [
  'EPERM',
  'ENOTSUP',
  'EOPNOTSUPP',
  'ENOSYS',
  'EXDEV',
];

// Never replaces a file: it rejects with `EEXIST` when the name exists.
const placeUnderNewName = async (
  temporary: string,
  absolute: string
): Promise<void> => {
  try {
    await fs.link(temporary, absolute);
    return;
  } catch (cause) {
    if (!NO_HARD_LINK_CODES.some((code) => hasErrorCode(cause, code))) {
      throw cause;
    }
  }
  // Only a file this call made is removed, so a failed create removes nothing.
  const target = await fs.open(absolute, 'wx');
  try {
    await target.writeFile(await fs.readFile(temporary));
  } catch (cause) {
    await target.close();
    await fs.rm(absolute, { force: true });
    throw cause;
  }
  await target.close();
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
    if (mediaPath.includes('\0')) {
      throw new MediaError(
        'invalid-path',
        'A media path cannot hold a null byte.'
      );
    }
    const absolute = path.resolve(mediaDir, mediaPath);
    const [realRoot, realAbsolute] = await Promise.all([
      realPathOf(mediaDir),
      realPathOf(absolute),
    ]);
    const isInside = (root: string, candidate: string) =>
      candidate.startsWith(root + path.sep) ||
      (allowRoot && candidate === root);
    if (!(isInside(mediaDir, absolute) && isInside(realRoot, realAbsolute))) {
      throw new MediaError(
        'invalid-path',
        `Path "${mediaPath}" is outside the media folder.`
      );
    }
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
      if (!isValidFileName(name)) {
        throw new MediaError(
          'invalid-name',
          `"${name}" is not a valid file name.`
        );
      }
      const absolute = await resolveInside(path.posix.join(folder, name), {
        allowRoot: false,
      });
      if (!isMediaExtension(extensionOfName(name))) {
        throw new MediaError(
          'unsupported',
          `"${name}" is not a file type that local media stores.`
        );
      }
      const targetFolder = path.dirname(absolute);
      await fs.mkdir(targetFolder, { recursive: true });
      // `list` hides a name that starts with a dot, so a half-written file
      // never shows.
      const temporary = path.join(targetFolder, `.${randomUUID()}.upload`);
      try {
        await fs.writeFile(temporary, Buffer.from(await file.arrayBuffer()), {
          flag: 'wx',
        });
        try {
          await placeUnderNewName(temporary, absolute);
        } catch (cause) {
          if (hasErrorCode(cause, 'EEXIST')) {
            throw new MediaError('name-taken', `"${name}" already exists.`);
          }
          throw cause;
        }
      } finally {
        await fs.rm(temporary, { force: true });
      }
      return toMediaPath(mediaDir, absolute);
    },

    async delete(mediaPath) {
      const absolute = await resolveInside(mediaPath, { allowRoot: false });
      const stats = await fs.lstat(absolute).catch((cause: unknown) => {
        if (isMissingFileError(cause)) {
          throw new MediaError('not-found', `"${mediaPath}" does not exist.`);
        }
        throw cause;
      });
      if (!stats.isFile()) {
        throw new MediaError('unsupported', `"${mediaPath}" is not a file.`);
      }
      await fs.unlink(absolute);
    },

    async rename(from, to) {
      const [fromAbsolute, toAbsolute] = await Promise.all([
        resolveInside(from, { allowRoot: false }),
        resolveInside(to, { allowRoot: false }),
      ]);
      const name = path.posix.basename(to);
      if (!isValidFileName(name)) {
        throw new MediaError(
          'invalid-name',
          `"${name}" is not a valid file name.`
        );
      }
      if (
        extensionOfName(name) !== extensionOfName(path.posix.basename(from))
      ) {
        throw new MediaError(
          'unsupported',
          `"${to}" does not keep the file type of "${from}".`
        );
      }
      const stats = await fs.lstat(fromAbsolute).catch((cause: unknown) => {
        if (isMissingFileError(cause)) {
          throw new MediaError('not-found', `"${from}" does not exist.`);
        }
        throw cause;
      });
      if (!stats.isFile()) {
        throw new MediaError('unsupported', `"${from}" is not a file.`);
      }
      const targetFolder = await fs
        .stat(path.dirname(toAbsolute))
        .catch((cause: unknown) => {
          if (isMissingFileError(cause)) return undefined;
          throw cause;
        });
      if (!targetFolder?.isDirectory()) {
        throw new MediaError(
          'not-found',
          `The folder for "${to}" does not exist.`
        );
      }
      try {
        await fs.link(fromAbsolute, toAbsolute);
      } catch (cause) {
        if (hasErrorCode(cause, 'EEXIST')) {
          throw new MediaError('name-taken', `"${to}" already exists.`);
        }
        throw cause;
      }
      await fs.unlink(fromAbsolute);
      return toMediaPath(mediaDir, toAbsolute);
    },
  };
};
