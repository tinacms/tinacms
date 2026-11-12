import { AsyncLocalStorage } from 'node:async_hooks';
import { readFile } from 'node:fs/promises';
import type { ServerResponse } from 'node:http';
import path from 'node:path';
import type { Connect, Plugin } from 'vite';
import { runCodegen } from '../../../../cli/commands/codegen';
import { type ResolvedConfig, resolveBuild } from '../../../../config';
import type { Session } from '../../../../core/auth/contract';
import {
  CONTENT_CREATE_PERMISSION,
  CONTENT_SAVE_PERMISSION,
  type ContentSaveResult,
  DEFAULT_CONTENT_URL,
  InvalidSaveInputError,
} from '../../../../core/content/contract';
import {
  type ServerSave,
  createServerHookRegistry,
  createServerSave,
} from '../../../../core/form/server-hooks';
import { invariant } from '../../../../core/invariant';
import { capabilityProvider } from '../../../../core/mount';
import {
  DEFAULT_MEDIA_ROOT,
  DEFAULT_MEDIA_URL,
  MediaError,
} from '../../../../core/media/contract';
import {
  MAX_MEDIA_UPLOAD_BYTES,
  MAX_REQUEST_BODY_BYTES,
  RequestBodyTooLargeError,
} from '../../../../core/request-body';
import { AUTH_CAPABILITY, type PluginManifest } from '../../../../core/plugin';
import { resolveServerSegments } from '../../../../core/resolve';
import { errorResponse, toErrorResponse } from '../../../../rpc/error-response';
import {
  createOpContextRunner,
  createRequestAuthorizer,
  createSessionPermissionsResponder,
} from '../../../../rpc/handler';
import { DEFAULT_RPC_URL } from '../../../../rpc/proxy';
import {
  SESSION_NAMESPACE,
  SESSION_PERMISSIONS_OP,
} from '../../../../rpc/session-permissions';
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
import { mimeTypeOfPath } from '../../../media-manager/media-types';
import { LOCAL_CONTENT_PLUGIN_NAME } from '../local-content.plugin';
import {
  type ContentRequest,
  dispatchContentRequest,
  parseContentRequest,
  permissionForOp,
} from './content-request';
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

// The verified session, or null once the gate has sent its refusal.
type SessionGate = {
  (
    req: Connect.IncomingMessage,
    res: ServerResponse,
    permission?: string
  ): Promise<Session | null>;
  // Whether the session of a request that passed the gate holds `permission`.
  allows(req: Connect.IncomingMessage, permission: string): Promise<boolean>;
};

// ADR-023 §4: with an auth plugin, the Data Layer authorizes a request as
// rpc/handler.ts does. When no auth plugin, or the winning one has no server
// segment, it composes nothing and checks nothing.
const createSessionGate = (
  plugins: PluginManifest[],
  capability: 'content' | 'media'
): SessionGate | null => {
  if (!capabilityProvider(plugins, AUTH_CAPABILITY)?.server) return null;
  const authorize = createRequestAuthorizer(plugins);
  const permission = capabilityProvider(plugins, capability)?.requires
    ?.permission;
  const gate = async (
    req: Connect.IncomingMessage,
    res: ServerResponse,
    opPermission?: string
  ): Promise<Session | null> => {
    try {
      const authorization = await authorize(sessionRequestOf(req), [
        permission,
        opPermission,
      ]);
      if (!('refusal' in authorization)) return authorization.session;
      await sendResponse(res, authorization.refusal);
    } catch (cause) {
      console.error('[tinacms] Data Layer session check failed:', cause);
      res.statusCode = 500;
      res.end('Session check failed.');
    }
    return null;
  };
  const allows = async (
    req: Connect.IncomingMessage,
    opPermission: string
  ): Promise<boolean> => {
    try {
      const authorization = await authorize(sessionRequestOf(req), [
        permission,
        opPermission,
      ]);
      return !('refusal' in authorization);
    } catch (cause) {
      console.error('[tinacms] Data Layer session check failed:', cause);
      return false;
    }
  };
  return Object.assign(gate, { allows });
};

const readJsonBody = async (req: Connect.IncomingMessage): Promise<unknown> => {
  const body = await readRequestBody(req);
  try {
    return JSON.parse(body);
  } catch {
    throw new InvalidSaveInputError('The body is not JSON.');
  }
};

const sendResponse = async (
  res: ServerResponse,
  response: Response
): Promise<void> => {
  res.statusCode = response.status;
  res.setHeader('content-type', 'application/json');
  res.end(await response.text());
};

// The local routes of the RPC `content/update` and `content/create` ops, so
// `vite dev` runs the server hooks. The RPC handler itself refuses every op
// without an auth plugin, and local development runs without one.
type SaveKind = 'update' | 'create';

type LocalSave = (
  kind: SaveKind,
  req: Connect.IncomingMessage,
  input: unknown,
  session: Session | null,
  mayCreate: boolean
) => Promise<ContentSaveResult>;

// An `update` to a path with no file is a create, so it also needs
// `content:create`. The route learns that from the session after the gate.
const createServerSaveHandler = (
  kind: SaveKind,
  save: LocalSave,
  gate: SessionGate | null
): Connect.NextHandleFunction => {
  const respond = async (
    req: Connect.IncomingMessage,
    session: Session | null
  ): Promise<Response> => {
    try {
      const input = await readJsonBody(req);
      const mayCreate =
        kind === 'create' || !gate
          ? true
          : await gate.allows(req, CONTENT_CREATE_PERMISSION);
      return Response.json(await save(kind, req, input, session, mayCreate));
    } catch (cause) {
      return toErrorResponse(cause, `Local content/${kind}`);
    }
  };
  return async (req, res) => {
    if (isCrossOriginRequest(req)) {
      res.statusCode = 403;
      res.end('Cross-origin request rejected');
      return;
    }
    if (coreContentTypeOfRequest(req) !== 'application/json') {
      await sendResponse(
        res,
        errorResponse(
          415,
          'unsupported-media-type',
          'RPC requests must be application/json.'
        )
      );
      return;
    }
    const session = gate
      ? await gate(
          req,
          res,
          kind === 'create'
            ? CONTENT_CREATE_PERMISSION
            : CONTENT_SAVE_PERMISSION
        )
      : null;
    if (gate && !session) return;
    const response = await respond(req, session);
    await sendResponse(res, response);
    if (response.status === 413) req.destroy();
  };
};

// The client build stubs every `*.server.*` module under tina/, so a server
// hook's `server` loader never bundles server code (ADR-007).
const SERVER_MODULE = /\.server(\.[cm]?[jt]sx?)?$/;
const SERVER_MODULE_STUB = '\0tina:server-module-stub';

const isServerModuleIn = (tinaDir: string, id: string): boolean => {
  const file = id.split('?')[0];
  if (!SERVER_MODULE.test(file)) return false;
  const relative = path.relative(tinaDir, file);
  return !relative.startsWith('..') && !path.isAbsolute(relative);
};

// The local route of the RPC `session/permissions` op. With no gate the server
// checks nothing, so the answer is the wildcard.
const createSessionPermissionsHandler =
  (
    answer: ((request: Request) => Promise<Response>) | null
  ): Connect.NextHandleFunction =>
  async (req, res) => {
    if (isCrossOriginRequest(req)) {
      res.statusCode = 403;
      res.end('Cross-origin request rejected');
      return;
    }
    if (req.method !== 'POST') {
      await sendResponse(
        res,
        errorResponse(405, 'method-not-allowed', 'RPC operations are POST.')
      );
      return;
    }
    if (coreContentTypeOfRequest(req) !== 'application/json') {
      await sendResponse(
        res,
        errorResponse(
          415,
          'unsupported-media-type',
          'RPC requests must be application/json.'
        )
      );
      return;
    }
    try {
      await sendResponse(
        res,
        answer ? await answer(sessionRequestOf(req)) : Response.json(['*'])
      );
    } catch (cause) {
      await sendResponse(
        res,
        toErrorResponse(cause, 'Local session/permissions')
      );
    }
  };

const createMediaHandler = (
  media: LocalMedia,
  sessionGate: SessionGate | null,
  onUpload: (mediaPath: string) => void
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
    onUpload(mediaPath);
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
  const plugins = options.config?.plugins ?? [];
  const contentGate = createSessionGate(plugins, 'content');
  const mediaGate = createSessionGate(plugins, 'media');
  const mayCreateStorage = new AsyncLocalStorage<boolean>();
  const serverSaves: Partial<Record<SaveKind, Promise<ServerSave>>> = {};
  const loadServerSave = (kind: SaveKind): Promise<ServerSave> => {
    serverSaves[kind] ??= resolveServerSegments(plugins).then(
      (resolved) =>
        createServerSave({
          hooks: createServerHookRegistry(plugins, resolved),
          collections,
          write: ({ collection, path: documentPath, value }) =>
            kind === 'create'
              ? dataLayer.create(collection, documentPath, value)
              : dataLayer.update(collection, documentPath, value, {
                  mayCreate: mayCreateStorage.getStore() === true,
                }),
          resolvePath: (collection, documentPath) =>
            dataLayer.canonicalPath(collection, documentPath),
        }),
      (cause) => {
        delete serverSaves[kind];
        throw cause;
      }
    );
    return serverSaves[kind];
  };
  const tinaDir = path.resolve(options.rootDir, 'tina');
  const servesContentSave =
    capabilityProvider(plugins, 'content')?.name === LOCAL_CONTENT_PLUGIN_NAME;
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
  const runInOpContext = createOpContextRunner(plugins);
  const saveLocally: LocalSave = (kind, req, input, session, mayCreate) =>
    runInOpContext(sessionRequestOf(req), session, () =>
      mayCreateStorage.run(mayCreate, async () =>
        (await loadServerSave(kind))(input, session)
      )
    );

  const saveThroughHooks = async (
    kind: SaveKind,
    req: Connect.IncomingMessage,
    request: unknown,
    session: Session | null
  ): Promise<Response> => {
    try {
      const mayCreate =
        kind === 'create' || !contentGate
          ? true
          : await contentGate.allows(req, CONTENT_CREATE_PERMISSION);
      const { entry } = await saveLocally(
        kind,
        req,
        request,
        session,
        mayCreate
      );
      return Response.json(entry);
    } catch (cause) {
      return toErrorResponse(cause, `Local content ${kind}`);
    }
  };

  // Connect mounts by prefix, so a sub-path such as the RPC `content/update`
  // passes on to the next handler instead of reading as a content request.
  const serveContentRequest: Connect.NextHandleFunction = async (
    req,
    res,
    next
  ) => {
    if ((req.url ?? '/').split('?')[0] !== '/') {
      next();
      return;
    }
    if (isCrossOriginRequest(req)) {
      res.statusCode = 403;
      res.end('Cross-origin request rejected');
      return;
    }
    if (coreContentTypeOfRequest(req) !== 'application/json') {
      res.statusCode = 415;
      res.end('Expected application/json');
      return;
    }
    let request: unknown;
    try {
      request = JSON.parse(await readRequestBody(req));
    } catch (cause) {
      sendError(req, res, cause);
      return;
    }
    let parsed: ContentRequest | undefined;
    let invalid: unknown;
    try {
      parsed = parseContentRequest(request);
    } catch (cause) {
      invalid = cause;
    }
    const session = contentGate
      ? await contentGate(req, res, parsed && permissionForOp(parsed.op))
      : null;
    if (contentGate && !session) return;
    if (!parsed) {
      await sendResponse(res, toErrorResponse(invalid, 'Local content'));
      return;
    }
    if (parsed.op === 'update' || parsed.op === 'create') {
      await sendResponse(
        res,
        await saveThroughHooks(parsed.op, req, request, session)
      );
      return;
    }
    try {
      const maySave =
        (parsed.op === 'rename' || parsed.op === 'renameFolder') && contentGate
          ? await contentGate.allows(req, CONTENT_SAVE_PERMISSION)
          : true;
      const result = await dispatchContentRequest(dataLayer, request, {
        maySave,
      });
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify(result));
    } catch (cause) {
      await sendResponse(
        res,
        toErrorResponse(cause, `Local content ${parsed.op}`)
      );
    }
  };

  return {
    name: 'tina-local-data-layer',
    // The stub must resolve a server module before the resolver of vite does.
    enforce: 'pre',
    async resolveId(source, importer, resolveOptions) {
      if (resolveOptions?.ssr || !importer) return null;
      const resolved = await this.resolve(source, importer, {
        ...resolveOptions,
        skipSelf: true,
      });
      if (resolved && isServerModuleIn(tinaDir, resolved.id)) {
        return SERVER_MODULE_STUB;
      }
      return resolved;
    },
    load: (id) =>
      id === SERVER_MODULE_STUB
        ? "throw new Error('A *.server.* module under tina/ runs on the server only. Load it only through the server loader of a hook.');"
        : null,
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
        // Vite serves a new public/ file only once its file watcher reports it,
        // so a site that loads an image straight after its upload gets a 404.
        // Serve the files this server uploaded until then.
        const uploaded = new Set<string>();
        const uploadsRoute = `/${options.mediaRoot ?? DEFAULT_MEDIA_ROOT}/`;
        server.middlewares.use(async (req, res, next) => {
          if (!isLoopbackHost(req.headers.host)) return next();
          const pathname = (req.url ?? '').split('?')[0];
          if (!pathname.startsWith(uploadsRoute)) return next();
          let mediaPath: string;
          try {
            mediaPath = decodeURIComponent(pathname.slice(uploadsRoute.length));
          } catch {
            return next();
          }
          const contentType = mimeTypeOfPath(mediaPath);
          if (!uploaded.has(mediaPath) || !contentType) return next();
          try {
            const bytes = await readFile(path.join(media.mediaDir, mediaPath));
            res.setHeader('content-type', contentType);
            res.end(bytes);
          } catch {
            next();
          }
        });
        server.middlewares.use(
          options.mediaUrl ?? DEFAULT_MEDIA_URL,
          createMediaHandler(media, mediaGate, (mediaPath) =>
            uploaded.add(mediaPath)
          )
        );
      }
      if (servesContentSave) {
        for (const kind of ['update', 'create'] as const) {
          server.middlewares.use(
            `${options.config?.rpcUrl ?? DEFAULT_RPC_URL}/content/${kind}`,
            createServerSaveHandler(kind, saveLocally, contentGate)
          );
        }
      }
      server.middlewares.use(
        `${options.config?.rpcUrl ?? DEFAULT_RPC_URL}/${SESSION_NAMESPACE}/${SESSION_PERMISSIONS_OP}`,
        createSessionPermissionsHandler(
          contentGate ? createSessionPermissionsResponder(plugins) : null
        )
      );
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
