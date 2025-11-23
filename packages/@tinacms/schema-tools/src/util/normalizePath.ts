export const normalizePath = (filepath: string) => filepath.replace(/\\/g, '/');

/**
 * Returns the given path such that:
 * - The path separator is converted from '\' to '/' if necessary.
 * - Duplicate '/' are removed
 * - Leading and trailing '/' are cleared
 * @param filepath Filepath to convert to its canonical form
 */
export const canonicalPath = (filepath: string) => {
  return normalizePath(filepath)
    .split('/')
    .filter((name: string) => name !== '')
    .join('/');
};
