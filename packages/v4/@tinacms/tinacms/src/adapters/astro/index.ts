// The server entry, `tinacms/adapters/astro`. It mounts the composed RPC handler as
// Astro endpoint handlers.
//
// The project owns the route, and Tina supplies the function that answers it. Nothing
// here spawns a process or claims a port, so `astro dev` and `astro build` stay the
// pipeline of the project (refer to packages/v4/README.md).
//
// An Astro endpoint takes an APIContext and returns a Web Response. The one member of
// that context this adapter reads is `request`, so the parameter is typed structurally
// and this file does not import `astro`.

import { type RpcHandlerConfig, createRpcHandler } from '../../rpc/handler';

export type { RpcHandlerConfig };

export interface AstroRouteHandlers {
  GET: (context: { request: Request }) => Promise<Response>;
  POST: (context: { request: Request }) => Promise<Response>;
}

// Use it from src/pages/api/tina/[...slug].ts:
//
//   export const { GET, POST } = mountHandler({ plugins })
//
// The route needs `export const prerender = false`, or a project with `output: 'server'`.
// A prerendered endpoint runs at build time and answers nothing at run time.
//
// Operations are POST (ADR-008). GET is exported so that a browser hitting the route gets
// the 405 the dispatch returns, and not the 404 that Astro returns for a missing export.
export const mountHandler = (config: RpcHandlerConfig): AstroRouteHandlers => {
  const handler = createRpcHandler(config);
  const route = ({ request }: { request: Request }) => handler(request);
  return { GET: route, POST: route };
};
