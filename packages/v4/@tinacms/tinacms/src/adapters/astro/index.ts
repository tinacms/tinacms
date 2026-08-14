import { type RpcHandlerConfig, createRpcHandler } from '../../rpc/handler';

export type { RpcHandlerConfig };

export interface AstroRouteHandlers {
  GET: (context: { request: Request }) => Promise<Response>;
  POST: (context: { request: Request }) => Promise<Response>;
}

export const mountHandler = (config: RpcHandlerConfig): AstroRouteHandlers => {
  const handler = createRpcHandler(config);
  const route = ({ request }: { request: Request }) => handler(request);
  return { GET: route, POST: route };
};
