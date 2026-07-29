// The server entry, `tinacms/adapters/express`. It mounts the composed RPC handler as an
// Express middleware.
//
// The project owns the server, and Tina supplies a middleware for one route. Nothing here
// listens, so the project keeps its own pipeline (refer to packages/v4/README.md).
//
// This is the one adapter with real work in it. Next, Astro, and Hono all hand over a Web
// Request and take back a Web Response, which is already the signature of RpcHandler.
// Express predates that and speaks node streams, so this file converts in both
// directions. It types the two ends structurally with the `node:http` classes that
// Express extends, and does not import `express`.

import type { IncomingMessage, ServerResponse } from 'node:http';
import { type RpcHandlerConfig, createRpcHandler } from '../../rpc/handler';

export type { RpcHandlerConfig };

type ExpressLikeRequest = IncomingMessage & {
  // Express strips the mount path from `url` and keeps the whole path here. The
  // dispatch reads the last two segments either way, so this is for fidelity.
  originalUrl?: string;
  // A body parser upstream of this middleware leaves its result here.
  body?: unknown;
};

export type TinaMiddleware = (
  req: ExpressLikeRequest,
  res: ServerResponse,
  next: (error?: unknown) => void
) => void;

const readBody = async (req: ExpressLikeRequest): Promise<string> => {
  // An `express.json()` in front of this middleware has already drained the socket and
  // left the parsed value on `req.body`. Reading the stream again yields nothing, and
  // the operation would see an empty body, so serialize what the parser produced.
  if (req.body !== undefined && req.body !== null) {
    return typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString('utf8');
};

const toWebRequest = async (req: ExpressLikeRequest): Promise<Request> => {
  // The Request constructor needs an absolute URL, and the dispatch reads only the
  // path. Take the scheme from the socket rather than from `x-forwarded-proto`: a
  // client sends that header too, and nothing here should trust it.
  const scheme = (req.socket as { encrypted?: boolean }).encrypted
    ? 'https'
    : 'http';
  const url = new URL(
    req.originalUrl ?? req.url ?? '/',
    `${scheme}://${req.headers.host ?? 'localhost'}`
  );

  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const entry of value) headers.append(name, entry);
    } else {
      headers.set(name, value);
    }
  }

  const method = req.method ?? 'GET';
  // A GET or HEAD Request may not carry a body, and the constructor throws if it does.
  const body =
    method === 'GET' || method === 'HEAD' ? undefined : await readBody(req);
  return new Request(url, { method, headers, body });
};

const sendWebResponse = async (
  response: Response,
  res: ServerResponse
): Promise<void> => {
  // Iterating a Headers object joins repeated names with ", ". For Set-Cookie that
  // makes one broken cookie out of two, so an auth plugin that writes a session cookie
  // and a refresh cookie loses both. getSetCookie keeps them apart. It is optional
  // here because it arrived after the rest of the fetch types.
  const setCookie = response.headers.getSetCookie?.() ?? [];
  for (const [name, value] of response.headers) {
    if (name.toLowerCase() === 'set-cookie') continue;
    res.setHeader(name, value);
  }
  if (setCookie.length > 0) res.setHeader('set-cookie', setCookie);
  res.statusCode = response.status;
  // The RPC transport carries JSON only, so buffering costs nothing and avoids the
  // half-duplex stream plumbing that a streamed body would need.
  res.end(Buffer.from(await response.arrayBuffer()));
};

// Mount it on the base URL of the client:
//
//   app.use('/api/tina', tinaMiddleware({ plugins }))
//
// It answers every request that reaches it and calls `next` only with an error, so the
// error handler of the project reports a fault in the conversion.
export const tinaMiddleware = (config: RpcHandlerConfig): TinaMiddleware => {
  const handler = createRpcHandler(config);
  return (req, res, next) => {
    // Express ignores a returned promise, so the rejection is caught here. An
    // unhandled one would take the process down.
    void (async () => {
      try {
        await sendWebResponse(await handler(await toWebRequest(req)), res);
      } catch (cause) {
        next(cause);
      }
    })();
  };
};
