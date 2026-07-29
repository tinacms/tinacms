// The server entry, `tinacms/adapters/hono`. It mounts the composed RPC handler as a
// Hono route.
//
// The project owns the route, and Tina supplies the function that answers it. Nothing
// here spawns a process or claims a port, so the project keeps its own pipeline (refer
// to packages/v4/README.md).
//
// The planned surface for this file was `tinaRoute(config) → Hono`, mounted with
// `app.route()`. Returning a Hono instance means importing `hono`, and that would make
// the framework a dependency of the runtime package for no gain: a Hono handler already
// takes a Web Request through `c.req.raw` and returns a Web Response. So this exports the
// handler, and the project mounts it with `app.all()`, which is the same one line.

import { type RpcHandlerConfig, createRpcHandler } from '../../rpc/handler';

export type { RpcHandlerConfig };

// The one member of the Hono context this adapter reads. Typed structurally, so the
// handler fits `app.all()` without `hono` in the import graph.
export interface HonoRequestContext {
  req: { raw: Request };
}

export type HonoRouteHandler = (
  context: HonoRequestContext
) => Promise<Response>;

// Mount it on the wildcard that matches the base URL of the client:
//
//   app.all('/api/tina/*', mountHandler({ plugins }))
//
// The trailing `*` is required. Hono matches `/api/tina` alone otherwise, and every
// operation below it returns 404.
export const mountHandler = (config: RpcHandlerConfig): HonoRouteHandler => {
  const handler = createRpcHandler(config);
  return ({ req }) => handler(req.raw);
};
