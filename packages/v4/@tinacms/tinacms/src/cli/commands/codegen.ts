// `tinacms codegen` — read the project's config, compile its schema, and write
// tina-lock.json (ADR-016). The lock is committed, so the write is deliberately
// conservative: an unchanged lock is left alone rather than rewritten, and a
// contract-version mismatch stops rather than resolving itself.

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  type LoadTinaConfigOptions,
  loadTinaConfig,
} from '../../codegen/load-config';
import {
  type TinaLock,
  checkLock,
  compileSchema,
} from '../../codegen/compile-schema';
import { invariant } from '../../core/invariant';

export const TINA_DIRECTORY = 'tina';
export const LOCK_FILENAME = 'tina-lock.json';

// In config-file order. `.tsx` earns its place: a collection holding a custom field
// component is JSX, which is why the v3 examples name their config config.tsx.
const CONFIG_FILENAMES = ['config.ts', 'config.tsx', 'config.js', 'config.mjs'];

export interface CodegenOptions {
  rootDir: string;
  // Explicit path to the config, for a project that keeps it somewhere else.
  configPath?: string;
  load?: LoadTinaConfigOptions;
}

export type CodegenOutcome =
  | 'created'
  | 'updated'
  // Byte-identical to what is already committed, so nothing was written — the lock
  // must not show up in `git status` on every build.
  | 'unchanged';

export interface CodegenResult {
  configPath: string;
  lockPath: string;
  outcome: CodegenOutcome;
  lock: TinaLock;
  // Set when an existing lock lagged the schema; the lock has been regenerated.
  warning?: string;
}

const firstExisting = async (candidates: string[]): Promise<string | null> => {
  for (const candidate of candidates) {
    try {
      await readFile(candidate);
      return candidate;
    } catch {
      // Next candidate — a missing file here is the question being asked, not a fault.
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
    return JSON.parse(await readFile(lockPath, 'utf8')) as TinaLock;
  } catch {
    // Absent (first run) or unparseable (hand-edited, bad merge) are the same
    // situation: there is nothing trustworthy to compare against, so recompile.
    return null;
  }
};

// Pretty-printed with a trailing newline because it is a committed file that people
// read in diffs, not a build output.
const serializeLock = (lock: TinaLock): string =>
  `${JSON.stringify(lock, null, 2)}\n`;

export const runCodegen = async (
  options: CodegenOptions
): Promise<CodegenResult> => {
  const configPath =
    options.configPath ?? (await findConfigPath(options.rootDir));
  const lockPath = path.join(options.rootDir, TINA_DIRECTORY, LOCK_FILENAME);

  const config = await loadTinaConfig(configPath, options.load);
  const lock = compileSchema(config);
  const existing = await readExistingLock(lockPath);

  if (!existing) {
    await writeFile(lockPath, serializeLock(lock));
    return { configPath, lockPath, outcome: 'created', lock };
  }

  const check = checkLock(existing, config);
  if (check.status === 'current') {
    return { configPath, lockPath, outcome: 'unchanged', lock };
  }
  // The one failure this command has: a field type changed shape under a committed
  // lock. Rewriting it here is exactly the silent break ADR-016 exists to prevent.
  invariant(check.status === 'stale', 'lock-incompatible', check.message);
  await writeFile(lockPath, serializeLock(lock));
  return {
    configPath,
    lockPath,
    outcome: 'updated',
    lock,
    warning: check.message,
  };
};
