import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import type { Plugin } from 'vite';

const BRIDGE_ROUTE = '/admin/bridge.js';
const require = createRequire(import.meta.url);

function resolveBridge(): string {
  return require.resolve('@tinacms/bridge');
}

export function tinaVitePlugin(): Plugin {
  let isBuild = false;

  return {
    name: '@tinacms/sveltekit:bridge',
    applyToEnvironment(environment) {
      return environment.name === 'client';
    },
    configResolved(config) {
      isBuild = config.command === 'build';
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '').split('?')[0];
        if (path !== BRIDGE_ROUTE) {
          next();
          return;
        }

        try {
          res.setHeader('Content-Type', 'text/javascript');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(readFileSync(resolveBridge()));
        } catch {
          res.statusCode = 500;
          res.end('/* Tina bridge is unavailable */');
        }
      });
    },
    buildStart() {
      if (!isBuild) return;

      this.emitFile({
        type: 'asset',
        fileName: 'admin/bridge.js',
        source: readFileSync(resolveBridge()),
      });
    },
  };
}

export default tinaVitePlugin;
