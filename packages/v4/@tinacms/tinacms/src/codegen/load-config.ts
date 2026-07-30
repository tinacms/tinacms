// Node-only: loads `tina/config.ts` through a temporary Vite server rather than
// importing it. Node can strip the types itself, but the config imports
// `@tinacms/tinacms`, whose `exports` point at raw `.ts` files with
// extensionless relative specifiers — the node resolver does not follow them,
// the Vite resolver does.

import path from 'node:path';
import type { ResolvedConfig } from '../config';
import { invariant } from '../core/invariant';

export interface ModuleLoader {
  ssrLoadModule(url: string): Promise<Record<string, unknown>>;
}

export interface LoadTinaConfigOptions {
  alias?: { find: string; replacement: string }[];
  // Use the caller's server instead of starting one (~1s per run).
  loader?: ModuleLoader;
}

// Vite is an optional peer, imported dynamically so a browser-only consumer
// never pulls it into the module graph.
const startLoadingServer = async (
  configPath: string,
  alias: LoadTinaConfigOptions['alias']
) => {
  const vite = await import('vite').catch(() => null);
  invariant(
    vite,
    'config-loader-missing',
    'Reading tina/config.ts needs Vite. Install vite as a dev dependency, or pass `loader` to use the module graph you already have.'
  );
  return vite.createServer({
    // Ignore any vite.config in scope: a project's plugins would run its whole
    // dev pipeline, and in a workspace would re-enter this config load.
    configFile: false,
    // Root at the config, not process.cwd(), so relative imports and tsconfig
    // paths resolve against the project.
    root: path.dirname(configPath),
    logLevel: 'warn',
    // `ws: false` is required: `hmr: false` alone still binds the HMR socket on
    // port 24678, so two concurrent loads would race on a global port.
    server: { middlewareMode: true, hmr: false, ws: false, watch: null },
    resolve: { alias: alias ?? [] },
  });
};

export const loadTinaConfig = async (
  configPath: string,
  options: LoadTinaConfigOptions = {}
): Promise<ResolvedConfig> => {
  const server =
    options.loader ?? (await startLoadingServer(configPath, options.alias));
  try {
    const loaded = await server.ssrLoadModule(configPath);
    const config = loaded.default as ResolvedConfig | undefined;
    invariant(
      config?.plugins && config.schema,
      'config-not-default-exported',
      `${configPath} must \`export default defineConfig({ ... })\`.`
    );
    return config;
  } finally {
    // Close only the server this function opened.
    if (!options.loader) await (server as { close(): Promise<void> }).close();
  }
};
