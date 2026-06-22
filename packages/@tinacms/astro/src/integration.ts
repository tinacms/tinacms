import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration, AstroIntegrationLogger } from 'astro';
import type { Plugin as VitePlugin } from 'vite';

export interface TinaIntegrationOptions {
  middlewareOrder?: 'pre' | 'post';
  /**
   * Force the Cloudflare Workers (workerd) `import.meta.url` workaround on or
   * off. When omitted, it is applied automatically whenever the
   * `@astrojs/cloudflare` adapter is detected. Set `false` to opt out, or
   * `true` to force it for a custom Cloudflare setup.
   */
  cloudflareWorkers?: boolean;
}

/** Where the injected bridge bootstrap imports the bridge bundle from. */
const BRIDGE_ROUTE = '/admin/bridge.js';

const CLOUDFLARE_ADAPTER_NAME = '@astrojs/cloudflare';
/** A valid absolute URL that stands in for `import.meta.url` in server bundles. */
const WORKERD_IMPORT_META_URL = JSON.stringify('file:///worker.mjs');
/**
 * The Vite environments that run on workerd under `@astrojs/cloudflare` and
 * therefore need the placeholder: `ssr` (the on-demand server build) and `astro`
 * (the dev SSR runtime). The `client` bundle is excluded so the browser keeps
 * the real `import.meta.url`, and `prerender` is excluded because it runs in
 * real Node when `prerenderEnvironment: 'node'` (faking the URL there would
 * break genuine file resolution) — and the island route is `prerender: false`,
 * so it never renders during prerendering anyway.
 */
const SERVER_ENVIRONMENTS = new Set(['ssr', 'astro']);

export default function tina(
  options: TinaIntegrationOptions = {}
): AstroIntegration {
  const { middlewareOrder = 'pre' } = options;
  // Resolved client output dir, captured at config:done and consumed at
  // build:done (only then is the final output location known).
  let clientDir: URL | undefined;
  // Whether the Cloudflare adapter is in use, resolved at config:done. The
  // injected Vite plugin reads it lazily (via a thunk) because the plugin is
  // constructed at config:setup, before the adapter is known.
  let isCloudflareAdapter = false;

  return {
    name: '@tinacms/astro',
    hooks: {
      'astro:config:setup': ({ addMiddleware, updateConfig }) => {
        addMiddleware({
          entrypoint: '@tinacms/astro/middleware',
          order: middlewareOrder,
        });
        // Dev: serve the bridge straight from the package rather than writing
        // it into the user's source tree — config-time writes churn
        // public/admin on every `astro dev`/`astro build`, break on read-only
        // or sandboxed filesystems, and can race `tinacms build`.
        updateConfig({
          vite: {
            plugins: [
              bridgeDevPlugin(),
              devContentInvalidationPlugin(astroMajorVersion()),
              cloudflareImportMetaUrlPlugin(() => isCloudflareAdapter),
            ],
          },
        });
      },
      'astro:config:done': ({ config }) => {
        clientDir = config.build.client;
        // config:done runs before Vite is created and after every integration
        // (including a late-registered adapter) has resolved, so config.adapter
        // is reliable here.
        isCloudflareAdapter =
          options.cloudflareWorkers ??
          config.adapter?.name === CLOUDFLARE_ADAPTER_NAME;
      },
      'astro:build:done': ({ logger }) => {
        // Build: emit the bridge next to the admin SPA in the *output* tree.
        // `build.client` is where `public/` is copied to and what every
        // adapter serves statically, so the bridge ships as a static asset
        // (some adapters won't emit injected on-demand routes — e.g.
        // @astrojs/vercel in static mode) without touching the source tree.
        if (!clientDir) return;
        emitBridgeAsset(fileURLToPath(new URL('admin/', clientDir)), logger);
      },
    },
  };
}

function resolveBridge(): string {
  return createRequire(import.meta.url).resolve('@tinacms/bridge');
}

/**
 * Major version of the consumer's installed `astro`, or `undefined` if it can't
 * be resolved. Used to scope the dev content-invalidation plugin to Astro 6+,
 * the only majors where the `astro:content-changed` signal it emits is handled.
 */
function astroMajorVersion(): number | undefined {
  try {
    const pkg = createRequire(import.meta.url).resolve('astro/package.json');
    const major = Number.parseInt(
      JSON.parse(readFileSync(pkg, 'utf8')).version,
      10
    );
    return Number.isNaN(major) ? undefined : major;
  } catch {
    return undefined;
  }
}

/** Normalise separators so path prefix matching works on Windows too. */
const toPosix = (p: string): string => p.replace(/\\/g, '/');

/**
 * Absolute, posix-normalised paths of the configured Tina collection content
 * roots, read from the generated schema. `tinacms dev` writes this before it
 * spawns the framework dev server, so it is on disk by the time this plugin's
 * `configureServer` runs. Returns an empty list when the schema can't be read
 * (e.g. running `astro dev` on its own), signalling the caller to fall back to
 * a path heuristic.
 */
function readTinaCollectionRoots(root: string | undefined): string[] {
  if (!root) return [];
  for (const rel of [
    'tina/__generated__/_schema.json',
    '.tina/__generated__/_schema.json',
  ]) {
    try {
      const schema = JSON.parse(readFileSync(join(root, rel), 'utf8'));
      const roots: string[] = (schema?.collections ?? [])
        .map((c: { path?: unknown }) => c?.path)
        .filter((p: unknown): p is string => typeof p === 'string' && p !== '')
        .map((p: string) => toPosix(join(root, p)));
      if (roots.length) return roots;
    } catch {
      // Not generated yet or unreadable: try the next location, then fall back.
    }
  }
  return [];
}

// Dev-only Vite plugin that answers `/admin/bridge.js` from the installed
// bridge package. The bridge never varies per request, so a single readFile
// per request is fine and nothing is persisted to disk.
function bridgeDevPlugin(): VitePlugin {
  return {
    name: '@tinacms/astro:bridge-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url || '').split('?')[0];
        if (path !== BRIDGE_ROUTE) {
          next();
          return;
        }
        try {
          const body = readFileSync(resolveBridge());
          res.setHeader('Content-Type', 'text/javascript');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(body);
        } catch (error) {
          res.statusCode = 500;
          res.end(`/* @tinacms/astro: bridge unavailable: ${error} */`);
        }
      });
    },
  };
}

/**
 * Astro caches `getStaticPaths()` results in dev and only re-runs them for a
 * change it recognises: a module in the graph, or a file in a watched
 * content-layer collection. Content sourced through Tina's GraphQL client
 * (a `getStaticPaths` that queries `client.queries.*`) is neither, so when the
 * admin writes a new entry the route's path list stays stale and the
 * freshly-created page 404s until the dev server is restarted by hand.
 *
 * This dev-only plugin watches the configured Tina collection paths (read from
 * the generated schema, so it tracks content wherever a collection's `path`
 * points) for files being added or removed, and emits the same
 * `astro:content-changed` signal Astro fires for its own content layer, which
 * clears the route cache so `getStaticPaths()` re-runs and the new path
 * resolves, then reloads the open tab so it picks up the change.
 *
 * Scoped to Astro 6+: the listener that turns `astro:content-changed` into a
 * route-cache clear only exists from Astro 6 on. On Astro 5 nothing handles the
 * signal, so it does nothing useful while the paired full-reload would still
 * churn the open tab. Hence a version gate rather than sniffing Vite's
 * environment API, which is present in both Astro 5 and 6 and so can't tell them
 * apart.
 *
 * See https://github.com/tinacms/tinacms/issues/5611.
 */
function devContentInvalidationPlugin(
  astroMajor: number | undefined
): VitePlugin {
  // Content extensions Tina writes. The precise watch list comes from the
  // collection roots in the generated schema; these patterns drive the fallback
  // used when the schema isn't readable yet.
  const CONTENT_EXT = /\.(?:md|mdx|markdown|mdoc|json|ya?ml|toml)$/i;
  const MARKDOWN = /\.(?:md|mdx|markdown|mdoc)$/i;
  const STRUCTURED = /\.(?:json|ya?ml|toml)$/i;
  const IGNORED =
    /[\\/](?:node_modules|\.git|\.astro|dist|\.vercel|\.netlify|\.cache)[\\/]/;

  const isWithin = (file: string, dir: string): boolean => {
    const f = toPosix(file);
    const d = toPosix(dir).replace(/\/$/, '');
    return f === d || f.startsWith(`${d}/`);
  };

  const isContentFile = (file: string, roots: string[]): boolean => {
    if (IGNORED.test(file)) return false;
    // Schema known: a content-formatted file under any configured collection
    // root, regardless of whether that root is named `content`.
    if (roots.length) {
      return CONTENT_EXT.test(file) && roots.some((r) => isWithin(file, r));
    }
    // Fallback (schema not generated yet): markdown counts anywhere; structured
    // data only inside a `content` dir, so a stray `package.json` / `tsconfig`
    // write doesn't trigger a reload.
    if (MARKDOWN.test(file)) return true;
    return STRUCTURED.test(file) && /[\\/]content[\\/]/.test(file);
  };

  return {
    name: '@tinacms/astro:dev-content-invalidation',
    apply: 'serve',
    configureServer(server) {
      // The `astro:content-changed` signal below is only handled by Astro 6+.
      // Bail on older (or unresolvable) majors so a no-op stays a no-op.
      if (astroMajor === undefined || astroMajor < 6) return;
      // Astro 6 routes HMR through Vite's per-environment hot channels.
      // Defensive: if they're somehow absent, skip rather than guess.
      const ssr = server.environments?.ssr;
      const client = server.environments?.client;
      if (!ssr?.hot || !client?.hot) return;

      // Exact content roots from the Tina schema; empty when it isn't on disk
      // yet, in which case isContentFile() falls back to a path heuristic.
      const roots = readTinaCollectionRoots(server.config?.root);

      let timer: ReturnType<typeof setTimeout> | undefined;
      const flush = () => {
        ssr.hot.send('astro:content-changed', {});
        client.hot.send({ type: 'full-reload', path: '*' });
      };
      const onChange = (file: string) => {
        if (!isContentFile(file, roots)) return;
        // Coalesce bursts (saving several documents fires many events) into a
        // single reload.
        if (timer) clearTimeout(timer);
        timer = setTimeout(flush, 50);
      };
      server.watcher.on('add', onChange);
      server.watcher.on('unlink', onChange);
    },
  };
}

/**
 * Cloudflare Workers (workerd) runs the server bundle in a runtime where the
 * bundled `import.meta.url` is not a valid absolute URL. Astro's experimental
 * Container API — used by the on-demand island route — calls
 * `new URL(import.meta.url)` while building its manifest, which throws
 * "Invalid URL string" and 500s the island render in production. The paths it
 * seeds from that URL are never dereferenced for an in-memory render, so a
 * valid placeholder is harmless. We inject it as a Vite `define`, but only in
 * the server environments (never the client bundle, which needs the real value)
 * and only under the Cloudflare adapter (faking it on a Node server would break
 * real file resolution).
 *
 * TODO: remove once Astro guards the unconditional `new URL(import.meta.url)` in
 * createManifest (tracked upstream in withastro/astro).
 */
function cloudflareImportMetaUrlPlugin(
  isCloudflare: () => boolean
): VitePlugin {
  const define = { 'import.meta.url': WORKERD_IMPORT_META_URL };
  return {
    name: '@tinacms/astro:cloudflare-import-meta-url',
    // No `apply`: the define is needed in both the build (ssr) and dev envs.
    configEnvironment(name) {
      if (!isCloudflare()) return;
      if (!SERVER_ENVIRONMENTS.has(name)) return;
      return { define };
    },
  };
}

function emitBridgeAsset(adminDir: string, logger: AstroIntegrationLogger) {
  try {
    mkdirSync(adminDir, { recursive: true });
    copyFileSync(resolveBridge(), join(adminDir, 'bridge.js'));
  } catch (error) {
    logger.warn(
      `could not emit admin/bridge.js — visual editing will not load: ${error}`
    );
  }
}
