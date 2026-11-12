const MAX_NAME_BYTES = 255;

const hasControlCharacter = (text: string): boolean => {
  for (const character of text) {
    const code = character.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
};

/**
 * Whether `name`, the last part of a path, may be written. A name that starts
 * with `.` is refused, so no write can land on a folder placeholder.
 */
export const isValidName = (name: string): boolean =>
  name.length > 0 &&
  Buffer.byteLength(name, 'utf8') <= MAX_NAME_BYTES &&
  !/[/\\]/.test(name) &&
  !hasControlCharacter(name) &&
  !name.startsWith('.') &&
  !name.endsWith(' ') &&
  !name.endsWith('.') &&
  name.trim() !== '';

/** A file name is valid when the name and the name without its extension are. */
export const isValidFileName = (name: string, extension: string): boolean => {
  if (!isValidName(name)) return false;
  const stem = name.slice(0, name.length - extension.length);
  return isValidName(stem);
};

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
