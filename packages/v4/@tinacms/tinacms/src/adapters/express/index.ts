import type { IncomingMessage, ServerResponse } from 'node:http';
import { type RpcHandlerConfig, createRpcHandler } from '../../rpc/handler';

export type { RpcHandlerConfig };

type ExpressLikeRequest = IncomingMessage & {
  originalUrl?: string;
  body?: unknown;
};

export type TinaMiddleware = (
  req: ExpressLikeRequest,
  res: ServerResponse,
  next: (error?: unknown) => void
) => void;

const readBody = async (req: ExpressLikeRequest): Promise<string> => {
  if (req.body !== undefined && req.body !== null) {
    return typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString('utf8');
};

const toWebRequest = async (req: ExpressLikeRequest): Promise<Request> => {
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
  const body =
    method === 'GET' || method === 'HEAD' ? undefined : await readBody(req);
  return new Request(url, { method, headers, body });
};

const sendWebResponse = async (
  response: Response,
  res: ServerResponse
): Promise<void> => {
  const setCookie = response.headers.getSetCookie?.() ?? [];
  for (const [name, value] of response.headers) {
    if (name.toLowerCase() === 'set-cookie') continue;
    res.setHeader(name, value);
  }
  if (setCookie.length > 0) res.setHeader('set-cookie', setCookie);
  res.statusCode = response.status;
  res.end(Buffer.from(await response.arrayBuffer()));
};

export const tinaMiddleware = (config: RpcHandlerConfig): TinaMiddleware => {
  const handler = createRpcHandler(config);
  return (req, res, next) => {
    void (async () => {
      try {
        await sendWebResponse(await handler(await toWebRequest(req)), res);
      } catch (cause) {
        next(cause);
      }
    })();
  };
};
