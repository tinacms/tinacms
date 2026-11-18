import { toFieldAddress } from '../core/field/address';

const fileName = (path: string) => path.split('/').at(-1) ?? path;

/** The `title` field when it is a non-empty string, else the file name. */
export const documentTitle = (
  path: string,
  values: Record<string, unknown> | undefined
): string => {
  const named = values?.[toFieldAddress('title')];
  return typeof named === 'string' && named.trim() !== ''
    ? named
    : fileName(path);
};
