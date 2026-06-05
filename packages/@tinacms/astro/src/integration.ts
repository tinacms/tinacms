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
