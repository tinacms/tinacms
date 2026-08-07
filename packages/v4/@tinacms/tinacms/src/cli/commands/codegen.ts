import { constants } from 'node:fs';
import { access, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
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
import { type ResolvedConfig, resolveBuild } from '../../config';
import { invariant } from '../../core/invariant';

export const TINA_DIRECTORY = 'tina';
export const LOCK_FILENAME = 'tina-lock.json';

const CONFIG_FILENAMES = ['config.ts', 'config.tsx', 'config.js', 'config.mjs'];

export interface CodegenOptions {
  rootDir: string;
  configPath?: string;
  load?: LoadTinaConfigOptions;
  write?: boolean;
}

export type CodegenOutcome = 'created' | 'updated' | 'unchanged';

export type AdminFileOutcome =
  | 'created'
  // The file exists and belongs to the project, so codegen left it alone.
  | 'kept';

export interface AdminFile {
  path: string;
  outcome: AdminFileOutcome;
}

export interface CodegenResult {
  configPath: string;
  lockPath: string;
  outcome: CodegenOutcome;
  lock: TinaLock;
  admin: AdminFile[];
  warning?: string;
}

const firstExisting = async (candidates: string[]): Promise<string | null> => {
  for (const candidate of candidates) {
    try {
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
    const lock = parsed as TinaLock | null;
    if (!lock || typeof lock !== 'object' || Array.isArray(lock)) return null;
    if (typeof lock.primitives !== 'object' || lock.primitives === null) {
      return null;
    }
    return lock;
  } catch {
    return null;
  }
};

const serializeLock = (lock: TinaLock): string =>
  `${JSON.stringify(lock, null, 2)}\n`;

const writeLock = async (lockPath: string, lock: TinaLock): Promise<void> => {
  const tempPath = `${lockPath}.${process.pid}.tmp`;
  await writeFile(tempPath, serializeLock(lock));
  await rename(tempPath, lockPath);
};

// The admin route, in the v3 shape. Codegen writes an index.html into the public
// folder. The dev server of the project then serves the admin on /admin/ with no
// route of its own. The html is a shell: the module script points at tina/admin.tsx,
// which the dev server transforms like any source file. The entry and its css cannot
// live in public/ — the dev server serves public/ files raw, and both need the
// pipeline. Codegen scaffolds all three files once; they then belong to the project.
// A project can change the shell, the preview route, or the styles without fighting
// the generator.
const ADMIN_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TinaCMS</title>
    <style>
      body { margin: 0; font-family: system-ui, sans-serif; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/${TINA_DIRECTORY}/admin.tsx"></script>
  </body>
</html>
`;

const ADMIN_ENTRY = `import { TinaAdmin } from '@tinacms/tinacms/admin';
import { createRoot } from 'react-dom/client';
import config from './config';
import './admin.css';

// The admin route. TinaAdmin supplies the whole editor: the collections, the document
// form, the save button, and the preview pane. \`preview\` names the page of this site
// that renders the open document.
const root = document.getElementById('root');
if (!root) throw new Error('admin/index.html is missing #root');
createRoot(root).render(<TinaAdmin config={config} preview='/' />);
`;

const ADMIN_CSS = `@import "@tinacms/ui/globals.css";

/* Tailwind skips node_modules, and the alpha releases the editor as source (ADR-001),
   so name the package sources here. These lines go when the dist build lands. */
@source "../node_modules/@tinacms/tinacms/src";
@source "../node_modules/@tinacms/ui/src";
`;

const scaffoldOnce = async (
  target: string,
  content: string
): Promise<AdminFile> => {
  await mkdir(path.dirname(target), { recursive: true });
  try {
    // The 'wx' flag makes the existence check and the write one operation.
    await writeFile(target, content, { flag: 'wx' });
    return { path: target, outcome: 'created' };
  } catch (cause) {
    if ((cause as NodeJS.ErrnoException).code !== 'EEXIST') throw cause;
    return { path: target, outcome: 'kept' };
  }
};

const writeAdminFiles = async (
  rootDir: string,
  config: ResolvedConfig
): Promise<AdminFile[]> => {
  const build = resolveBuild(config.build);
  const htmlPath = path.join(
    rootDir,
    build.publicFolder,
    build.outputFolder,
    'index.html'
  );
  return [
    await scaffoldOnce(htmlPath, ADMIN_HTML),
    await scaffoldOnce(
      path.join(rootDir, TINA_DIRECTORY, 'admin.tsx'),
      ADMIN_ENTRY
    ),
    await scaffoldOnce(
      path.join(rootDir, TINA_DIRECTORY, 'admin.css'),
      ADMIN_CSS
    ),
  ];
};

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
  const scaffoldAdmin = async (): Promise<AdminFile[]> =>
    write ? writeAdminFiles(options.rootDir, config) : [];

  if (!existing) {
    if (write) {
      await mkdir(path.dirname(lockPath), { recursive: true });
      await writeLock(lockPath, lock);
    }
    return {
      configPath,
      lockPath,
      outcome: 'created',
      lock,
      admin: await scaffoldAdmin(),
    };
  }

  const check = checkLock(existing, config);
  if (check.status === 'current') {
    return {
      configPath,
      lockPath,
      outcome: 'unchanged',
      lock,
      admin: await scaffoldAdmin(),
    };
  }
  invariant(
    check.status === 'stale',
    check.status === 'unreadable' ? 'lock-unreadable' : 'lock-incompatible',
    check.message
  );
  if (write) await writeLock(lockPath, lock);
  return {
    configPath,
    lockPath,
    outcome: 'updated',
    lock,
    admin: await scaffoldAdmin(),
    warning: check.message,
  };
};
