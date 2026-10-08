import { readFile } from 'node:fs/promises';
import type { ServerResponse } from 'node:http';
import path from 'node:path';
import type { Connect, Plugin } from 'vite';
import { runCodegen } from '../../../../cli/commands/codegen';
import { type ResolvedConfig, resolveBuild } from '../../../../config';
import type { AuthTransportHooks } from '../../../../core/auth/contract';
import { DEFAULT_CONTENT_URL } from '../../../../core/content/contract';
import { invariant } from '../../../../core/invariant';
import { DEFAULT_MEDIA_URL, MediaError } from '../../../../core/media/contract';
import {
  MAX_MEDIA_UPLOAD_BYTES,
  MAX_REQUEST_BODY_BYTES,
  RequestBodyTooLargeError,
} from '../../../../core/request-body';
import { AUTH_CAPABILITY, type PluginManifest } from '../../../../core/plugin';
import { resolveAuthTransportHooks } from '../../../../rpc/handler';
import {
  LOCAL_MEDIA_PLUGIN_NAME,
  MEDIA_ERROR_HEADER,
} from '../../../media/local/local-media.plugin';
import {
  type LocalMedia,
  createLocalMedia,
} from '../../../media/local/server/local-media';
import {
  dispatchMediaRequest,
  listMedia,
} from '../../../media/local/server/media-request';
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

// A multipart upload is a "simple" request that skips the CORS preflight, so the
// check must reject a cross-origin write itself, not only set CORS headers.
const isCrossOriginRequest = (req: Connect.IncomingMessage): boolean => {
  const { origin, host } = req.headers;
  return (
    !isLoopbackHost(host) ||
    !isSameOrigin(origin, host) ||
    req.headers['sec-fetch-site'] === 'cross-site'
  );
};

const coreContentTypeOfRequest = (
  req: Connect.IncomingMessage
): string | undefined =>
  req.headers['content-type']?.replace(/;.*/, '').trim().toLowerCase();

const readRequestBytes = (
  req: Connect.IncomingMessage,
  limit: number
): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let bytes = 0;
    req.on('data', (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes > limit) {
        req.pause();
        reject(new RequestBodyTooLargeError(limit));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

const sendError = (
  req: Connect.IncomingMessage,
  res: ServerResponse,
  cause: unknown
): void => {
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
};

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

const sessionRequestOf = (req: Connect.IncomingMessage): Request => {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value === undefined || name.startsWith(':')) continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      headers.append(name, item);
    }
  }
  const url = new URL(
    req.originalUrl ?? req.url ?? '/',
    `http://${req.headers.host ?? 'localhost'}`
  );
  return new Request(url, { method: req.method, headers });
};

type SessionGate = (
  req: Connect.IncomingMessage,
  res: ServerResponse
) => Promise<boolean>;

// ADR-023 §4: with an auth plugin, the Data Layer refuses a request with no session,
// as rpc/handler.ts does. With no auth plugin, it composes nothing and checks nothing.
const createSessionGate = (plugins: PluginManifest[]): SessionGate | null => {
  if (!plugins.some(({ provides }) => provides.includes(AUTH_CAPABILITY))) {
    return null;
  }
  let authHooks: Promise<AuthTransportHooks | null> | null = null;
  return async (req, res) => {
    try {
      authHooks ??= resolveAuthTransportHooks(plugins).catch((cause) => {
        authHooks = null;
        throw cause;
      });
      const hooks = await authHooks;
      if (!hooks || (await hooks.getSession(sessionRequestOf(req)))) {
        return true;
      }
      res.statusCode = 401;
      res.end('No CMS session.');
    } catch (cause) {
      console.error('[tinacms] Data Layer session check failed:', cause);
      res.statusCode = 500;
      res.end('Session check failed.');
    }
    return false;
  };
};

const createMediaHandler = (
  media: LocalMedia,
  sessionGate: SessionGate | null
): Connect.NextHandleFunction => {
  const serveMediaUpload = async (
    req: Connect.IncomingMessage,
    res: ServerResponse
  ) => {
    if (coreContentTypeOfRequest(req) !== 'multipart/form-data') {
      res.statusCode = 415;
      res.end('Expected multipart/form-data');
      return;
    }
    const body = await readRequestBytes(req, MAX_MEDIA_UPLOAD_BYTES);
    const form = await new Response(new Uint8Array(body), {
      headers: { 'content-type': req.headers['content-type'] ?? '' },
    }).formData();
    const file = form.get('file');
    const folder = form.get('folder') ?? '';
    invariant(
      file instanceof File && typeof folder === 'string',
      'media-upload-no-file',
      'A media upload needs a `file` field and an optional `folder` field.'
    );
    const mediaPath = await media.save(file, folder);
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ path: mediaPath }));
  };

  return async (req, res) => {
    if (isCrossOriginRequest(req)) {
      res.statusCode = 403;
      res.end('Cross-origin request rejected');
      return;
    }
    if (sessionGate && !(await sessionGate(req, res))) return;
    try {
      const [route, query = ''] = (req.url ?? '').split('?');
      if (route === '/upload') {
        await serveMediaUpload(req, res);
        return;
      }
      if (req.method === 'GET') {
        const page = await listMedia(media, new URLSearchParams(query));
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify(page));
        return;
      }
      if (coreContentTypeOfRequest(req) !== 'application/json') {
        res.statusCode = 415;
        res.end('Expected application/json');
        return;
      }
      const body = await readRequestBody(req);
      const result = await dispatchMediaRequest(media, JSON.parse(body));
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify(result));
    } catch (cause) {
      if (cause instanceof MediaError) {
        res.statusCode = 400;
        res.setHeader(MEDIA_ERROR_HEADER, cause.code);
        res.end(cause.detail ?? '');
        return;
      }
      sendError(req, res, cause);
    }
  };
};

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
  /** Where the local media endpoint listens. */
  mediaUrl?: string;
  /** The folder inside the public folder that holds uploads (`uploads` by default). */
  mediaRoot?: string;
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
  const sessionGate = createSessionGate(options.config?.plugins ?? []);
  const usesLocalMedia =
    options.config?.plugins.some(
      ({ name }) => name === LOCAL_MEDIA_PLUGIN_NAME
    ) ?? false;
  const media = usesLocalMedia
    ? createLocalMedia({
        rootDir: options.rootDir,
        publicFolder: resolveBuild(options.config?.build).publicFolder,
        mediaRoot: options.mediaRoot,
      })
    : undefined;

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
    if (isCrossOriginRequest(req)) {
      res.statusCode = 403;
      res.end('Cross-origin request rejected');
      return;
    }
    if (sessionGate && !(await sessionGate(req, res))) return;
    if (coreContentTypeOfRequest(req) !== 'application/json') {
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
      sendError(req, res, cause);
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
      if (media) {
        server.middlewares.use(
          options.mediaUrl ?? DEFAULT_MEDIA_URL,
          createMediaHandler(media, sessionGate)
        );
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
