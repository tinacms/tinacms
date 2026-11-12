import path from 'node:path';
import type { ResolvedConfig } from '../config';
import { invariant } from '../core/invariant';

export interface ModuleLoader {
  ssrLoadModule(url: string): Promise<Record<string, unknown>>;
}

export interface LoadTinaConfigOptions {
  alias?: { find: string; replacement: string }[];
  loader?: ModuleLoader;
}

const importOptionalVite = async (): Promise<typeof import('vite') | null> => {
  try {
    return await import('vite');
  } catch (cause) {
    if ((cause as NodeJS.ErrnoException)?.code === 'ERR_MODULE_NOT_FOUND') {
      return null;
    }
    throw cause;
  }
};

const startLoadingServer = async (
  configPath: string,
  alias: LoadTinaConfigOptions['alias']
) => {
  const vite = await importOptionalVite();
  invariant(
    vite,
    'config-loader-missing',
    'Reading tina/config.ts needs Vite. Install vite as a dev dependency, or pass `loader` to use the module graph you already have.'
  );
  return vite.createServer({
    configFile: false,
    root: path.dirname(configPath),
    logLevel: 'warn',
    server: { middlewareMode: true, hmr: false, ws: false, watch: null },
    resolve: { alias: alias ?? [] },
  });
};

export interface OpenTinaConfig {
  config: ResolvedConfig;
  /** Loads another module through the loader that read the config. */
  loader: ModuleLoader;
  /** Ends the loader. Call it in a `finally`, after the last import. */
  close: () => Promise<void>;
}

const readConfig = async (
  loader: ModuleLoader,
  configPath: string
): Promise<ResolvedConfig> => {
  const loaded = await loader.ssrLoadModule(configPath);
  const config = loaded.default as ResolvedConfig | undefined;
  invariant(
    config?.plugins && config.schema,
    'config-not-default-exported',
    `${configPath} must \`export default defineConfig({ ... })\`.`
  );
  return config;
};

/**
 * Reads the config and keeps the loader open, for a command that imports
 * plugin server code after the config. A loader passed in stays the caller's.
 */
export const openTinaConfig = async (
  configPath: string,
  options: LoadTinaConfigOptions = {}
): Promise<OpenTinaConfig> => {
  const ownServer = options.loader
    ? undefined
    : await startLoadingServer(configPath, options.alias);
  const loader = options.loader ?? ownServer;
  const close = async () => {
    await ownServer?.close().catch(() => {});
  };
  try {
    return {
      config: await readConfig(loader!, configPath),
      loader: loader!,
      close,
    };
  } catch (cause) {
    await close();
    throw cause;
  }
};

export const loadTinaConfig = async (
  configPath: string,
  options: LoadTinaConfigOptions = {}
): Promise<ResolvedConfig> => {
  const opened = await openTinaConfig(configPath, options);
  await opened.close();
  return opened.config;
};
