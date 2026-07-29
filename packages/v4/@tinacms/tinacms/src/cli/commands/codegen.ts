// The `tinacms codegen` command. It reads the config of the project, compiles its
// schema, and writes tina-lock.json (ADR-016). The lock is committed, so the write is
// careful. An unchanged lock stays as it is, and a contract version that does not match
// stops the command.

import { constants } from 'node:fs';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  type TinaLock,
  checkLock,
  compileSchema,
} from '../../codegen/compile-schema';
import {
  type LoadTinaConfigOptions,
  loadTinaConfig,
} from '../../codegen/load-config';
import { invariant } from '../../core/invariant';

export const TINA_DIRECTORY = 'tina';
export const LOCK_FILENAME = 'tina-lock.json';

// In the order of the config files. The list holds `.tsx`, because a collection with a
// custom field component holds JSX. The v3 examples name their config config.tsx for
// that reason.
const CONFIG_FILENAMES = ['config.ts', 'config.tsx', 'config.js', 'config.mjs'];

export interface CodegenOptions {
  rootDir: string;
  // An explicit path to the config, for a project that keeps it in another place.
  configPath?: string;
  load?: LoadTinaConfigOptions;
  // Write the lock when it differs. It defaults to true. `tinacms codegen --check`
  // passes false: in CI a lock that differs from the committed one is the failure to
  // report, and not a file to repair. The outcome is the same either way, so the
  // caller reads `outcome` to learn what a write would have done.
  write?: boolean;
}

export type CodegenOutcome =
  | 'created'
  | 'updated'
  // The output holds the same bytes as the committed file, so this command wrote
  // nothing. The lock must not appear in `git status` after each build.
  | 'unchanged';

export interface CodegenResult {
  configPath: string;
  lockPath: string;
  outcome: CodegenOutcome;
  lock: TinaLock;
  // Set when the committed lock was older than the schema. The command wrote it again.
  warning?: string;
}

const firstExisting = async (candidates: string[]): Promise<string | null> => {
  for (const candidate of candidates) {
    try {
      // access, not readFile: slurping the file reported an unreadable or
      // directory-shaped config as a missing one, and anything that is not ENOENT is
      // a real fault the developer needs to see.
      await access(candidate, constants.R_OK);
      return candidate;
    } catch (cause) {
      // Try the next candidate. A missing file here is the question, and not a fault.
      // An unreadable one is, so it surfaces rather than reading as "no config".
      if ((cause as NodeJS.ErrnoException).code !== 'ENOENT') throw cause;
    }
  }
  return null;
};

export const findConfigPath = async (rootDir: string): Promise<string> => {
  const found = await firstExisting(
    CONFIG_FILENAMES.map((name) => path.join(rootDir, TINA_DIRECTORY, name))
  );
  invariant(
    found,
    'config-not-found',
    `No Tina config found. Expected one of ${CONFIG_FILENAMES.map(
      (name) => `${TINA_DIRECTORY}/${name}`
    ).join(', ')} under ${rootDir}.`
  );
  return found;
};

const readExistingLock = async (lockPath: string): Promise<TinaLock | null> => {
  try {
    const parsed: unknown = JSON.parse(await readFile(lockPath, 'utf8'));
    // A lock that parses to `[]`, `3`, or `{}` after a bad merge is as untrustworthy
    // as one that does not parse at all; the cast alone let it reach checkLock and
    // throw a TypeError on `lock.primitives[type]`.
    const lock = parsed as TinaLock | null;
    if (!lock || typeof lock !== 'object' || Array.isArray(lock)) return null;
    if (typeof lock.primitives !== 'object' || lock.primitives === null) {
      return null;
    }
    return lock;
  } catch {
    // A lock that is absent, on the first run, and a lock that does not parse, after
    // a hand edit or a bad merge, are one situation. There is nothing to compare
    // against, so compile again.
    return null;
  }
};

// The file is formatted, and it ends with a newline, because it is a committed file that
// people read in a diff. It is not a build output.
const serializeLock = (lock: TinaLock): string =>
  `${JSON.stringify(lock, null, 2)}\n`;

export const runCodegen = async (
  options: CodegenOptions
): Promise<CodegenResult> => {
  const configPath =
    options.configPath ?? (await findConfigPath(options.rootDir));
  const lockPath = path.join(options.rootDir, TINA_DIRECTORY, LOCK_FILENAME);

  const write = options.write ?? true;
  const config = await loadTinaConfig(configPath, options.load);
  const lock = compileSchema(config);
  const existing = await readExistingLock(lockPath);

  if (!existing) {
    if (write) {
      await mkdir(path.dirname(lockPath), { recursive: true });
      await writeFile(lockPath, serializeLock(lock));
    }
    return { configPath, lockPath, outcome: 'created', lock };
  }

  const check = checkLock(existing, config);
  if (check.status === 'current') {
    return { configPath, lockPath, outcome: 'unchanged', lock };
  }
  // This is the one failure of the command. A field type changed its shape under a
  // committed lock. A write here would be the silent break that ADR-016 prevents.
  invariant(
    check.status === 'stale',
    check.status === 'unreadable' ? 'lock-unreadable' : 'lock-incompatible',
    check.message
  );
  if (write) await writeFile(lockPath, serializeLock(lock));
  return {
    configPath,
    lockPath,
    outcome: 'updated',
    lock,
    warning: check.message,
  };
};
