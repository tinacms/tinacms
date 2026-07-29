// The server entry, `tinacms/adapters/next`. It mounts the composed RPC handler as
// Next.js route handlers.
//
// The project owns the route, and Tina supplies the function that answers it. Nothing
// here spawns a process or claims a port, so `next dev` and `next build` stay the
// pipeline of the project (refer to packages/v4/README.md).
//
// An app-router route handler takes a Web Request and returns a Web Response, which is
// the signature of RpcHandler. The adapter is therefore a rename, and this file does not
// import `next`.

import { type RpcHandlerConfig, createRpcHandler } from '../../rpc/handler';

export type { RpcHandlerConfig };

export interface NextRouteHandlers {
  GET: (request: Request) => Promise<Response>;
  POST: (request: Request) => Promise<Response>;
}

// Use it from app/api/tina/[...slug]/route.ts:
//
//   export const { GET, POST } = mountHandler({ plugins })
//
// Operations are POST (ADR-008). GET is exported so that a browser hitting the route
// gets the 405 the dispatch returns, which names the problem, instead of the 404 that
// Next returns for a method with no export.
export const mountHandler = (config: RpcHandlerConfig): NextRouteHandlers => {
  const handler = createRpcHandler(config);
  return { GET: handler, POST: handler };
};
