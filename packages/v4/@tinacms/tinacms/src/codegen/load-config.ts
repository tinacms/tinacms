// Node-only. Reads a project's `tina/config.ts` and hands back what defineConfig
// returned — the entry point for everything that needs the config outside the
// browser: the schema compile, the Local Data Layer, and (once it lands) the CLI.
//
// It runs the file through a throwaway Vite server rather than importing it. The
// config is TypeScript, and node can strip that on its own now, but it also imports
// `@tinacms/tinacms`, whose `exports` still point at raw `.ts` using extensionless
// relative specifiers (`./core/plugin`) that node's resolver will not follow. Vite's
// resolver will, and `tinacms dev` hosts a Vite server regardless, so this is the
// mechanism that survives rather than a stopgap.

import { createServer } from 'vite';
import type { ResolvedConfig } from '../config';
import { invariant } from '../core/invariant';

export interface LoadTinaConfigOptions {
  // Resolution overrides for the loading server. A real project needs none — it
  // resolves `@tinacms/tinacms` from node_modules — but a workspace that aliases
  // the package at its source has to pass the same aliases its app uses.
  alias?: { find: string; replacement: string }[];
}

export const loadTinaConfig = async (
  configPath: string,
  options: LoadTinaConfigOptions = {}
): Promise<ResolvedConfig> => {
  const server = await createServer({
    // Ignore any vite.config in scope: this server exists to resolve one module,
    // and inheriting a project's plugins would run its whole dev pipeline (and, in
    // a workspace, recurse straight back into the config that called us).
    configFile: false,
    logLevel: 'warn',
    server: { middlewareMode: true, hmr: false, watch: null },
    resolve: { alias: options.alias ?? [] },
  });
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
    await server.close();
  }
};
