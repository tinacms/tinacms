import path from 'path';

/** Removes trailing slash from path. Separator to remove is chosen based on
 *  operating system. */
export function stripNativeTrailingSlash(p: string) {
  const { root } = path.parse(p);
  let str = p;

  // Remove only the OS-native separator
  while (str.length > root.length && str.endsWith(path.sep)) {
    str = str.slice(0, -1);
  }

  return str;
}
