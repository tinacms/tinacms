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

// Same origin as the dev server, or no Origin at all (curl and friends).
const isSameOrigin = (origin: string | undefined, host?: string): boolean =>
  !origin || origin === `http://${host}` || origin === `https://${host}`;

// Collect the request body as a UTF-8 string; a client abort mid-stream rejects
// rather than hanging or crashing the dev server.
const readRequestBody = (req: Connect.IncomingMessage): Promise<string> =>
  new Promise((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });

export const tinaLocalDataLayerVitePlugin = (
  options: LocalDataLayerOptions & { url?: string }
): Plugin => {
  const dataLayer = createLocalDataLayer(options);
  const serveContentRequest: Connect.NextHandleFunction = async (req, res) => {
    const { origin, host } = req.headers;
    // CSRF guard: reject a cross-site POST, and require a JSON content-type — a
    // cross-origin fetch with it always preflights, closing the remaining gap.
    if (!isSameOrigin(origin, host)) {
      res.statusCode = 403;
      res.end('Cross-origin request rejected');
      return;
    }
    if (req.headers['content-type']?.includes('application/json') !== true) {
      res.statusCode = 415;
      res.end('Expected application/json');
      return;
    }
    try {
      const body = await readRequestBody(req);
      const result = await dispatchContentRequest(dataLayer, JSON.parse(body));
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify(result));
    } catch (cause) {
      // A malformed body or a mid-stream abort lands here — 400 rather than a
      // crashed dev server. Skip the write if the socket is already gone (an
      // abort destroys it, so `destroyed` is the live check, not `writableEnded`).
      if (res.destroyed) return;
      res.statusCode = 400;
      res.end(cause instanceof Error ? cause.message : String(cause));
    }
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
