// `tinacms codegen`: compiles the schema and writes tina-lock.json (ADR-016).

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

// `.tsx` included: a collection with a custom field component holds JSX.
const CONFIG_FILENAMES = ['config.ts', 'config.tsx', 'config.js', 'config.mjs'];

export interface CodegenOptions {
  rootDir: string;
  configPath?: string;
  load?: LoadTinaConfigOptions;
  // Defaults to true. `--check` passes false: in CI a differing lock is the
  // failure to report, not a file to repair.
  write?: boolean;
}

export type CodegenOutcome =
  | 'created'
  | 'updated'
  // Same bytes as the committed file; nothing written.
  | 'unchanged';

export interface CodegenResult {
  configPath: string;
  lockPath: string;
  outcome: CodegenOutcome;
  lock: TinaLock;
  warning?: string;
}

const firstExisting = async (candidates: string[]): Promise<string | null> => {
  for (const candidate of candidates) {
    try {
      // access, not readFile: an unreadable config must surface as a fault, not
      // read as missing.
      await access(candidate, constants.R_OK);
      return candidate;
    } catch (cause) {
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
    // A lock that parses to `[]` or `3` after a bad merge must not reach
    // checkLock and TypeError on `lock.primitives[type]`.
    const lock = parsed as TinaLock | null;
    if (!lock || typeof lock !== 'object' || Array.isArray(lock)) return null;
    if (typeof lock.primitives !== 'object' || lock.primitives === null) {
      return null;
    }
    return lock;
  } catch {
    // Absent and unparsable are one situation: nothing to compare, compile again.
    return null;
  }
};

// Formatted with a trailing newline: a committed file people read in a diff.
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
  // The one failure: a field type changed shape under a committed lock. A write
  // here would be the silent break ADR-016 prevents.
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
