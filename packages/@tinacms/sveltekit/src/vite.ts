import { readBridgeBundle, serveBridge } from '@tinacms/bridge/dev-server';
import type { Plugin } from 'vite';

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
      server.middlewares.use(serveBridge);
    },
    buildStart() {
      if (!isBuild) return;

      this.emitFile({
        type: 'asset',
        fileName: 'admin/bridge.js',
        source: readBridgeBundle(),
      });
    },
  };
}

export default tinaVitePlugin;
