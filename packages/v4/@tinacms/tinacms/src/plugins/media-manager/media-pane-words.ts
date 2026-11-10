import { extensionOf, mediaNameOf } from './media-types';

export const MEDIA_COPIED_MS = 2000;
export const MEDIA_DONE_MS = 6000;

export const READ_ONLY_NOTE =
  "This storage is read-only. Files can't be uploaded or deleted here.";
export const NO_PERMISSION_NOTE = "You don't have permission to delete.";
export const NO_ACCESS = "Your account doesn't have access to this project.";
export const SESSION_EXPIRED = 'Your session has expired. Sign in again.';

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

export const filesOf = (count: number) => plural(count, 'file', 'files');

/** "hero.jpg" for one file, "3 files" for several. */
export const subjectOf = (paths: readonly string[]) =>
  paths.length === 1 ? mediaNameOf(paths[0] ?? '') : filesOf(paths.length);

export const countLine = (
  folders: number,
  files: number,
  moreFiles: boolean
): string => {
  const parts = [
    folders > 0 ? plural(folders, 'folder', 'folders') : null,
    files > 0 || moreFiles
      ? `${files}${moreFiles ? '+' : ''} ${files === 1 && !moreFiles ? 'file' : 'files'}`
      : null,
  ];
  return parts.filter((part) => part !== null).join(', ');
};

const KIND_LABELS: Record<string, string> = {
  jpg: 'JPG image',
  jpeg: 'JPG image',
  png: 'PNG image',
  gif: 'GIF image',
  webp: 'WEBP image',
  svg: 'SVG image',
  avif: 'AVIF image',
  pdf: 'PDF document',
  mp4: 'MP4 video',
  webm: 'WEBM video',
  mov: 'MOV video',
  mp3: 'MP3 audio',
  wav: 'WAV audio',
};

export const typeLabelOf = (path: string): string => {
  const ext = extensionOf(path);
  return KIND_LABELS[ext] ?? (ext ? `${ext.toUpperCase()} file` : 'File');
};

export const folderTrailOf = (folder: string) =>
  ['Media', ...(folder ? folder.split('/') : [])].join(' / ');

/** The folder-name rules of the design; returns the message under the field, or null. */
export const folderNameError = (
  raw: string,
  existing: readonly string[]
): string | null => {
  const name = raw.trim();
  if (name === '') return 'Enter a folder name.';
  if (/\s/.test(name)) {
    return "Folder names can't have spaces. Use dashes instead, such as team-photos.";
  }
  if (!/^[A-Za-z0-9._-]+$/.test(name)) {
    return 'Use letters, numbers, dashes and dots only.';
  }
  if (existing.includes(name)) {
    return `A folder called ${name} is already here. Pick another name.`;
  }
  return null;
};

export const downloadFailureMessage = (failed: number, total: number) =>
  `Couldn't download ${failed} of ${filesOf(total)}.`;
