// Vite host for the Local Data Layer (ADR-018): mounts the content endpoint
// the localContentPlugin slice talks to, and keeps the content folders out of
// the dev watcher — a save must reach the editor through the content slice,
// not as an HMR full page reload (tailwind's content scan otherwise promotes
// the file write to one).

import path from 'node:path';
import type { Connect, Plugin } from 'vite';
import { DEFAULT_CONTENT_URL } from '../../../core/content/contract';
import { dispatchContentRequest } from './content-request';
import {
  type LocalDataLayerOptions,
  createLocalDataLayer,
} from './local-data-layer';

export const tinaLocalDataLayerVitePlugin = (
  options: LocalDataLayerOptions & { url?: string }
): Plugin => {
  const dataLayer = createLocalDataLayer(options);
  const serveContentRequest: Connect.NextHandleFunction = (req, res) => {
    // CSRF guard: browsers send Origin on cross-site POSTs — reject anything
    // that isn't the dev server itself (no Origin = curl and friends, allowed).
    const { origin, host } = req.headers;
    if (origin && origin !== `http://${host}` && origin !== `https://${host}`) {
      res.statusCode = 403;
      res.end('Cross-origin request rejected');
      return;
    }
    // Only JSON bodies: a cross-origin fetch with this content-type always
    // preflights, closing the remaining CSRF gap.
    if (req.headers['content-type']?.includes('application/json') !== true) {
      res.statusCode = 415;
      res.end('Expected application/json');
      return;
    }
    let body = '';
    req.setEncoding('utf8');
    // A client abort mid-body must not crash the dev server.
    req.on('error', () => res.destroy());
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', async () => {
      try {
        const result = await dispatchContentRequest(
          dataLayer,
          JSON.parse(body)
        );
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify(result));
      } catch (cause) {
        res.statusCode = 400;
        res.end(cause instanceof Error ? cause.message : String(cause));
      }
    });
  };
  return {
    name: 'tina-local-data-layer',
    config: () => ({
      server: {
        watch: {
          // Globs must be posix even on Windows (picomatch).
          ignored: options.collections.flatMap(({ path: folder }) =>
            folder
              ? [
                  path
                    .resolve(options.rootDir, folder, '**')
                    .split(path.sep)
                    .join('/'),
                ]
              : []
          ),
        },
      },
    }),
    configureServer(server) {
      server.middlewares.use(
        options.url ?? DEFAULT_CONTENT_URL,
        serveContentRequest
      );
    },
  };
};
