
import { type RpcHandlerConfig, createRpcHandler } from '../../rpc/handler';

export type { RpcHandlerConfig };

export interface NextRouteHandlers {
  GET: (request: Request) => Promise<Response>;
  POST: (request: Request) => Promise<Response>;
}

export const mountHandler = (config: RpcHandlerConfig): NextRouteHandlers => {
  const handler = createRpcHandler(config);
  return { GET: handler, POST: handler };
};
