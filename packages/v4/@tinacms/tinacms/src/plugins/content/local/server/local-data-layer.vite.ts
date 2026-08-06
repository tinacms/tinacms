import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Connect, Plugin } from 'vite';
import { runCodegen } from '../../../../cli/commands/codegen';
import { type ResolvedConfig, resolveBuild } from '../../../../config';
import { DEFAULT_CONTENT_URL } from '../../../../core/content/contract';
import { invariant } from '../../../../core/invariant';
import { dispatchContentRequest } from './content-request';
import {
  type LocalDataLayerOptions,
  createLocalDataLayer,
} from './local-data-layer';

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

const hostnameOf = (host: string): string => {
  const name = host.trim().toLowerCase();
  if (name.startsWith('[')) return name.slice(0, name.indexOf(']') + 1);
  return name.split(':')[0];
};

const isLoopbackHost = (host: string | undefined): host is string =>
  host !== undefined && LOOPBACK_HOSTS.has(hostnameOf(host));

const isSameOrigin = (origin: string | undefined, host: string): boolean =>
  !origin || origin === `http://${host}` || origin === `https://${host}`;

const MAX_REQUEST_BODY_BYTES = 5 * 1024 * 1024;

class RequestBodyTooLargeError extends Error {
  constructor() {
    super(`The request body is larger than ${MAX_REQUEST_BODY_BYTES} bytes.`);
    this.name = 'RequestBodyTooLargeError';
  }
}

const readRequestBody = (req: Connect.IncomingMessage): Promise<string> =>
  new Promise((resolve, reject) => {
    let body = '';
    let bytes = 0;
    req.setEncoding('utf8');
    req.on('data', (chunk: string) => {
      bytes += Buffer.byteLength(chunk);
      if (bytes > MAX_REQUEST_BODY_BYTES) {
        req.pause();
        reject(new RequestBodyTooLargeError());
        return;
      }
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });

export interface TinaVitePluginOptions
  extends Omit<LocalDataLayerOptions, 'collections'> {
  /**
   * The resolved tina/config.ts. The plugin reads the collections from it, and on
   * `vite dev` it runs codegen: the lock, and the admin at
   * `{publicFolder}/{outputFolder}/index.html` (`public/admin/` by default), so
   * /admin/ works with nothing but this plugin and a tina/config.ts.
   */
  config?: ResolvedConfig;
  /** The collections, when the caller does not hand over the whole config. */
  collections?: LocalDataLayerOptions['collections'];
  url?: string;
}

export const tinaLocalDataLayerVitePlugin = (
  options: TinaVitePluginOptions
): Plugin => {
  const collections = options.collections ?? options.config?.schema.collections;
  invariant(
    collections,
    'content-vite-plugin-no-config',
    'tinaLocalDataLayerVitePlugin needs `config` (the loaded tina/config.ts) or `collections`.'
  );
  const dataLayer = createLocalDataLayer({ ...options, collections });

  // Dev codegen. The config is already loaded, so the loader hands it straight to
  // runCodegen instead of reading tina/config.ts a second time.
  const runDevCodegen = async (log: (message: string) => void) => {
    const config = options.config;
    if (!config) return;
    try {
      const result = await runCodegen({
        rootDir: options.rootDir,
        load: { loader: { ssrLoadModule: async () => ({ default: config }) } },
      });
      for (const file of [
        { path: result.lockPath, outcome: result.outcome },
        ...result.admin,
      ]) {
        if (file.outcome === 'created') log(`tina: wrote ${file.path}`);
        if (file.outcome === 'updated') log(`tina: updated ${file.path}`);
      }
    } catch (cause) {
      if (cause instanceof Error) {
        log(`tina: codegen failed — ${cause.message}`);
      } else {
        log(`tina: codegen failed — ${String(cause)}`);
      }
    }
  };
  const serveContentRequest: Connect.NextHandleFunction = async (req, res) => {
    const { origin, host } = req.headers;
    if (
      !isLoopbackHost(host) ||
      !isSameOrigin(origin, host) ||
      req.headers['sec-fetch-site'] === 'cross-site'
    ) {
      res.statusCode = 403;
      res.end('Cross-origin request rejected');
      return;
    }
    const mimeEssence = req.headers['content-type']
      ?.replace(/;.*/, '')
      .trim()
      .toLowerCase();
    if (mimeEssence !== 'application/json') {
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
      if (res.destroyed) return;
      if (cause instanceof RequestBodyTooLargeError) {
        res.statusCode = 413;
        res.end(cause.message, () => req.destroy());
        return;
      }
      res.statusCode = 400;
      if (cause instanceof Error) {
        res.end(cause.message);
      } else {
        res.end(String(cause));
      }
    }
  };
  return {
    name: 'tina-local-data-layer',
    config: () => ({
      server: {
        watch: {
          ignored: collections.map(({ path: folder }) =>
            path
              .resolve(options.rootDir, folder, '**')
              .split(path.sep)
              .join('/')
          ),
        },
      },
    }),
    configureServer(server) {
      void runDevCodegen((message) => server.config.logger.info(message));
      if (options.config) {
        // Vite serves public/ files raw and by exact path: /admin/ would fall through
        // to the root index.html, and the raw shell would miss the transforms that
        // plugins inject (the react preamble among them). Serve the generated shell
        // on its route through transformIndexHtml, like a root-level html file.
        const { publicFolder, outputFolder } = resolveBuild(
          options.config.build
        );
        const route = `/${outputFolder}`;
        const htmlPath = path.resolve(
          options.rootDir,
          publicFolder,
          outputFolder,
          'index.html'
        );
        server.middlewares.use(async (req, res, next) => {
          const pathname = (req.url ?? '').split('?')[0];
          const hit =
            pathname === route ||
            pathname === `${route}/` ||
            pathname === `${route}/index.html`;
          if (!hit) return next();
          try {
            const raw = await readFile(htmlPath, 'utf8');
            const html = await server.transformIndexHtml(
              `${route}/index.html`,
              raw
            );
            res.setHeader('content-type', 'text/html');
            res.end(html);
          } catch (cause) {
            next(cause);
          }
        });
      }
      server.middlewares.use(
        options.url ?? DEFAULT_CONTENT_URL,
        serveContentRequest
      );
    },
    async closeBundle() {
      await dataLayer.close();
    },
  };
};
