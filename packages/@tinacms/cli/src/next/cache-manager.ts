import fs from 'fs-extra';
import path from 'path';

/**
 * Per-build cache layout under `tina/__generated__/.cache/`.
 *
 * Each `tinacms dev` / `tinacms build` invocation creates one
 * `<timestamp>/` subdir for esbuild output. The subdir is removed after
 * the dynamic-import resolves; the parent is swept on next startup to
 * mop up anything a crashed run (Ctrl+C mid-build, OOM kill, etc.) left
 * behind.
 */
export type CacheLocation = {
  /** `<project>/tina/__generated__/.cache/` — the long-lived parent. */
  parentPath: string;
  /** `<project>/tina/__generated__/.cache/<timestamp>/` — fresh per build. */
  buildPath: string;
};

/**
 * Build the user-facing error message thrown when the cache parent can't
 * be written to (Docker `:ro` mount, AWS Lambda `/var/task`, sandboxed CI
 * runner, restricted file permissions, …).
 *
 * Exported for testing — kept separate from {@link prepareCacheLocation}
 * so the message contract can be locked down without spinning up a real
 * read-only directory.
 */
export const buildReadOnlyMountErrorMessage = (
  cacheParentPath: string,
  underlyingError: NodeJS.ErrnoException
): string =>
  `TinaCMS cannot write to ${cacheParentPath}.\n\n` +
  `Tina v3 needs write access to your project's tina/__generated__/.cache/ ` +
  `directory at build time. This usually means your project directory is ` +
  `read-only — common in some Docker setups (\`:ro\` volumes), AWS Lambda's ` +
  `\`/var/task\`, sandboxed CI runners, or restricted file permissions.\n\n` +
  `To resolve, either:\n` +
  `  - Make the project directory writable (e.g. remount with read-write ` +
  `access, or copy the project to a writable location), or\n` +
  `  - Run \`tinacms build\` against a writable copy of your project and ` +
  `deploy the resulting artifacts.\n\n` +
  `Underlying error: ${underlyingError.code} ${underlyingError.message}`;

const READONLY_ERROR_CODES = new Set(['EACCES', 'EROFS', 'EPERM']);

/**
 * Sweep stale cache residue, ensure the parent dir exists and is
 * writable, and return the fresh per-build cache location.
 *
 * Throws an actionable error (built via
 * {@link buildReadOnlyMountErrorMessage}) when the project tree can't
 * be written to.
 *
 * @param generatedFolderPath The project's `tina/__generated__/` dir.
 * @param now Override for the timestamp (tests pass a fixed value;
 *            production passes nothing so `Date.now()` is used).
 */
export const prepareCacheLocation = async (
  generatedFolderPath: string,
  now: number = Date.now()
): Promise<CacheLocation> => {
  const parentPath = path.join(generatedFolderPath, '.cache');
  try {
    if (await fs.pathExists(parentPath)) {
      // NOTE: Sweep is unconditional — a concurrent `tinacms` invocation
      // against the same project will rm the other's live <timestamp>/
      // subdir mid-import. Tina v3 assumes one CLI process per project;
      // serialise `dev` + `build` invocations externally if you need both.
      await fs.remove(parentPath);
    }
    await fs.ensureDir(parentPath);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code && READONLY_ERROR_CODES.has(code)) {
      throw new Error(
        buildReadOnlyMountErrorMessage(parentPath, err as NodeJS.ErrnoException)
      );
    }
    throw err;
  }
  return {
    parentPath,
    buildPath: path.join(parentPath, String(now)),
  };
};

/**
 * Cleanup a per-load build subdir after its dynamic-import resolves.
 *
 * Removes the subdir entirely (not just the .mjs file), then attempts
 * to reap the timestamp parent if it's now empty — the sibling load
 * function may have already finished and removed its own subdir.
 *
 * `ENOTEMPTY` is the expected case for the parent reap (other content
 * still in flight) and is safely deferred to the next startup sweep.
 * Any other error re-throws so genuine permission / filesystem issues
 * surface instead of being silently swallowed.
 */
export const reapBuildSubdir = (
  buildSubdirPath: string,
  buildParentPath: string
): void => {
  fs.removeSync(buildSubdirPath);
  try {
    fs.rmdirSync(buildParentPath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code !== 'ENOTEMPTY') throw err;
  }
};
