import { promises as fs } from 'node:fs';
import path from 'node:path';
import { invariant } from '../core/invariant';

export const isMissingFileError = (cause: unknown): boolean => {
  if (!(cause instanceof Error)) return false;
  return 'code' in cause && cause.code === 'ENOENT';
};

const MAX_LINK_DEPTH = 40;

const linkTargetOf = async (candidate: string): Promise<string | undefined> => {
  try {
    const stats = await fs.lstat(candidate);
    if (!stats.isSymbolicLink()) return undefined;
    return await fs.readlink(candidate);
  } catch {
    return undefined;
  }
};

// `realpath` fails for a link that has no target, and the fallback below then
// resolves a path to itself. A link must resolve to its target, or the caller
// cannot see where a write lands.
export const realPathOf = async (
  candidate: string,
  depth = 0
): Promise<string> => {
  try {
    return await fs.realpath(candidate);
  } catch {
    const target = await linkTargetOf(candidate);
    if (target !== undefined) {
      invariant(
        depth < MAX_LINK_DEPTH,
        'path-link-depth',
        'A path follows too many links.'
      );
      return realPathOf(
        path.resolve(path.dirname(candidate), target),
        depth + 1
      );
    }
    const parent = path.dirname(candidate);
    if (parent === candidate) return candidate;
    return path.join(await realPathOf(parent, depth), path.basename(candidate));
  }
};
