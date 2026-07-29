// This runs in Node only. It reads the `tina/config.ts` of a project, and returns the
// output of defineConfig. Every consumer outside the browser enters here: the schema
// compile, the local data layer, and the CLI.
//
// It runs the file through a temporary Vite server, and does not import it. The config
// is TypeScript, and node can now strip the types by itself. But the config also imports
// `@tinacms/tinacms`, whose `exports` still point at raw `.ts` files. Those exports use
// relative specifiers with no extension, such as `./core/plugin`, and the node resolver
// does not follow them. The Vite resolver does follow them. `tinacms dev` also hosts a
// Vite server, so this mechanism stays.

import path from 'node:path';
import type { ResolvedConfig } from '../config';
import { invariant } from '../core/invariant';

// The one function that this module needs from a Vite server. A caller can therefore
// pass the server that it already has, and this module does not depend on the full
// ViteDevServer type.
export interface ModuleLoader {
  ssrLoadModule(url: string): Promise<Record<string, unknown>>;
}

export interface LoadTinaConfigOptions {
  // The resolution overrides for the loading server. Few callers need them. A project
  // resolves `@tinacms/tinacms` from node_modules, and a copy in a workspace resolves
  // through its own `exports`.
  alias?: { find: string; replacement: string }[];
  // Use the server of the caller, instead of a new one. The CLI passes the server that
  // loaded it. A second server costs about one second at each run, and gives nothing.
  loader?: ModuleLoader;
}

// The fallback loader, reached only when the caller supplies no `loader` of its own. A
// host that already has a module graph — a framework plugin, the `tinacms` bin, the
// playground config — passes that graph in and never arrives here. Vite is therefore an
// optional peer of the package and not a dependency, so a project that consumes only the
// browser runtime does not install a build tool to get it. The import is dynamic to keep
// that true: a static one puts Vite in the module graph of every importer of this file,
// whatever they then do with it.
const startLoadingServer = async (
  configPath: string,
  alias: LoadTinaConfigOptions['alias']
) => {
  const vite = await import('vite').catch(() => null);
  // A missing optional peer otherwise surfaces as ERR_MODULE_NOT_FOUND against the
  // string 'vite', which names neither the caller nor the two ways out of it.
  invariant(
    vite,
    'config-loader-missing',
    'Reading tina/config.ts needs Vite. Install vite as a dev dependency, or pass `loader` to use the module graph you already have.'
  );
  return vite.createServer({
    // Ignore any vite.config in scope. This server resolves one module. The plugins
    // of a project would run its whole dev pipeline. In a workspace, they would
    // also return to the config that called this function.
    configFile: false,
    // Without this the server roots at process.cwd(), so a config loaded from
    // anywhere else resolves its relative imports and tsconfig paths against the
    // caller's directory rather than the project's.
    root: path.dirname(configPath),
    logLevel: 'warn',
    // The `ws: false` option is necessary. In middleware mode, Vite has no HTTP
    // server for the HMR socket. The `hmr: false` option alone does not stop that
    // socket. Vite then binds its default port, 24678, on every interface. A load
    // of one config file would claim a fixed global port, and two loads at the same
    // time would race. Only `ws: false` stops createWebSocketServer.
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
    // Close only the server that this function opened. A server from the caller stays
    // open.
    if (!options.loader) await (server as { close(): Promise<void> }).close();
  }
};
