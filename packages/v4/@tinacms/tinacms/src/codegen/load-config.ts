
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

export const loadTinaConfig = async (
  configPath: string,
  options: LoadTinaConfigOptions = {}
): Promise<ResolvedConfig> => {
  const ownServer = options.loader
    ? undefined
    : await startLoadingServer(configPath, options.alias);
  const server = options.loader ?? ownServer;
  try {
    const loaded = await server!.ssrLoadModule(configPath);
    const config = loaded.default as ResolvedConfig | undefined;
    invariant(
      config?.plugins && config.schema,
      'config-not-default-exported',
      `${configPath} must \`export default defineConfig({ ... })\`.`
    );
    return config;
  } finally {
    await ownServer?.close().catch(() => {});
  }
};
