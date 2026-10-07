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
    <link rel="icon" href="data:image/svg+xml,%3Csvg viewBox='0 0 32 32' fill='%23EC4815' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18.6466 14.5553C19.9018 13.5141 20.458 7.36086 21.0014 5.14903C21.5447 2.9372 23.7919 3.04938 23.7919 3.04938C23.7919 3.04938 23.2085 4.06764 23.4464 4.82751C23.6844 5.58738 25.3145 6.26662 25.3145 6.26662L24.9629 7.19622C24.9629 7.19622 24.2288 7.10204 23.7919 7.9785C23.355 8.85496 24.3392 17.4442 24.3392 17.4442C24.3392 17.4442 21.4469 22.7275 21.4469 24.9206C21.4469 27.1136 22.4819 28.9515 22.4819 28.9515H21.0296C21.0296 28.9515 18.899 26.4086 18.462 25.1378C18.0251 23.8669 18.1998 22.596 18.1998 22.596C18.1998 22.596 15.8839 22.4646 13.8303 22.596C11.7767 22.7275 10.4072 24.498 10.16 25.4884C9.91287 26.4787 9.81048 28.9515 9.81048 28.9515H8.66211C7.96315 26.7882 7.40803 26.0129 7.70918 24.9206C8.54334 21.8949 8.37949 20.1788 8.18635 19.4145C7.99321 18.6501 6.68552 17.983 6.68552 17.983C7.32609 16.6741 7.97996 16.0452 10.7926 15.9796C13.6052 15.914 17.3915 15.5965 18.6466 14.5553Z'/%3E%3Cpath d='M11.1268 24.7939C11.1268 24.7939 11.4236 27.5481 13.0001 28.9516H14.3511C13.0001 27.4166 12.8527 23.4155 12.8527 23.4155C12.1656 23.6399 11.3045 24.3846 11.1268 24.7939Z'/%3E%3C/svg%3E" />
    <style>
      body { margin: 0; }
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
@source "../node_modules/@tinacms/rich-text/src";
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
