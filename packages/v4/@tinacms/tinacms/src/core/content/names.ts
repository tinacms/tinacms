const MAX_NAME_BYTES = 255;
const FORBIDDEN_CHARACTERS = new Set([
  '/',
  '\\',
  '<',
  '>',
  ':',
  '"',
  '|',
  '?',
  '*',
]);
const RESERVED_STEMS = new Set([
  'con',
  'prn',
  'aux',
  'nul',
  ...Array.from({ length: 9 }, (_, index) => `com${index + 1}`),
  ...Array.from({ length: 9 }, (_, index) => `lpt${index + 1}`),
  'com¹',
  'com²',
  'com³',
  'lpt¹',
  'lpt²',
  'lpt³',
]);

const hasForbiddenCharacter = (name: string): boolean => {
  for (const character of name) {
    const code = character.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) return true;
    if (FORBIDDEN_CHARACTERS.has(character)) return true;
  }
  return false;
};

/**
 * Whether `name`, one part of a path, may be written on every file system a
 * checkout can land on. A name that starts with `.` is refused, so no write can
 * land on a folder placeholder. The dialogs and the local Data Layer share this
 * rule.
 */
export const isValidName = (name: string): boolean => {
  if (name.length === 0 || name.trim() === '') return false;
  if (new TextEncoder().encode(name).length > MAX_NAME_BYTES) return false;
  if (hasForbiddenCharacter(name)) return false;
  if (name.startsWith('.') || name.endsWith(' ') || name.endsWith('.')) {
    return false;
  }
  const stem = (name.split('.')[0] ?? name).trimEnd();
  return !RESERVED_STEMS.has(stem.toLowerCase());
};

/** A file name is valid when the name and the name without its extension are. */
export const isValidFileName = (name: string, extension: string): boolean =>
  isValidName(name) &&
  isValidName(name.slice(0, name.length - extension.length));

/**
 * Splits a folder path (relative to the collection, `/` between parts) into
 * parts. Returns null for a path that is not in folder path form.
 */
export const folderPartsOf = (folder: string): string[] | null => {
  if (folder === '') return [];
  if (folder.includes('\0') || folder.includes('\\')) return null;
  const parts = folder.split('/');
  if (parts.some((part) => part === '' || part === '.' || part === '..')) {
    return null;
  }
  return parts;
};

/** The last part of a path. */
export const nameOf = (path: string): string => path.split('/').at(-1) ?? path;

/** The path without its last part. */
export const parentOf = (path: string): string =>
  path.split('/').slice(0, -1).join('/');

/** The extension of a name with its dot, or `''` when it has none. */
export const extensionOf = (name: string): string => {
  const dot = name.lastIndexOf('.');
  return dot <= 0 ? '' : name.slice(dot);
};

/** Removes every leading and trailing `/`. */
export const trimSlashes = (path: string): string => {
  let start = 0;
  let end = path.length;
  while (start < end && path[start] === '/') start += 1;
  while (end > start && path[end - 1] === '/') end -= 1;
  return path.slice(start, end);
};

/** Whether `path` lies inside `directory`. The empty directory holds every path. */
export const isUnder = (path: string, directory: string): boolean =>
  directory === '' || path.startsWith(`${directory}/`);

/**
 * The folder parts between a collection's directory and the document, in
 * folder path form parts. A document directly in the directory has none.
 */
export const folderPartsInside = (
  path: string,
  directory: string
): string[] => {
  const relative = directory === '' ? path : path.slice(directory.length + 1);
  return relative.split('/').slice(0, -1);
};
