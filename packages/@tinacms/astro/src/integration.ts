import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration, AstroIntegrationLogger } from 'astro';
import type { Plugin as VitePlugin } from 'vite';

export interface TinaIntegrationOptions {
  middlewareOrder?: 'pre' | 'post';
}

/** Where the injected bridge bootstrap imports the bridge bundle from. */
const BRIDGE_ROUTE = '/admin/bridge.js';

export default function tina(
  options: TinaIntegrationOptions = {}
): AstroIntegration {
  const { middlewareOrder = 'pre' } = options;
  // Resolved client output dir, captured at config:done and consumed at
  // build:done (only then is the final output location known).
  let clientDir: URL | undefined;

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
        updateConfig({ vite: { plugins: [bridgeDevPlugin()] } });
      },
      'astro:config:done': ({ config }) => {
        clientDir = config.build.client;
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
