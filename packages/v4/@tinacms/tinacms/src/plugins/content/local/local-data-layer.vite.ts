// The Vite host for the local data layer (ADR-018). It mounts the content endpoint that
// the localContentPlugin slice calls. It also keeps the content folders out of the dev
// watcher. A save must reach the editor through the content slice, and not as a full page
// reload from HMR. Without that, the content scan of Tailwind turns the file write into a
// reload.

import path from 'node:path';
import type { Connect, Plugin } from 'vite';
import { DEFAULT_CONTENT_URL } from '../../../core/content/contract';
import { dispatchContentRequest } from './content-request';
import {
  type LocalDataLayerOptions,
  createLocalDataLayer,
} from './local-data-layer';

// The same origin as the dev server, or no Origin header, which is what curl sends.
const isSameOrigin = (origin: string | undefined, host?: string): boolean =>
  !origin || origin === `http://${host}` || origin === `https://${host}`;

// Collect the request body as a UTF-8 string. A client that aborts the stream makes this
// reject. It does not hang, and it does not stop the dev server.
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
    // The CSRF guard. It rejects a cross-site POST, and it requires a JSON content
    // type. A cross-origin fetch with that type always sends a preflight, which
    // closes the gap.
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
      // A damaged body, and an abort during the stream, both arrive here. The reply
      // is a 400, and the dev server keeps running. Do not write when the socket has
      // gone. An abort destroys the socket, so `destroyed` is the correct check, and
      // `writableEnded` is not.
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
          // A glob must use posix separators, and Windows is no exception. This is
          // a picomatch rule. Every collection has a folder: createLocalDataLayer
          // above throws for one that declares no `path`.
          ignored: options.collections.map(({ path: folder }) =>
            path
              .resolve(options.rootDir, folder, '**')
              .split(path.sep)
              .join('/')
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
