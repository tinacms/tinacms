import { type RpcHandlerConfig, createRpcHandler } from '../../rpc/handler';

export type { RpcHandlerConfig };

export interface HonoRequestContext {
  req: { raw: Request };
}

export type HonoRouteHandler = (
  context: HonoRequestContext
) => Promise<Response>;

export const mountHandler = (config: RpcHandlerConfig): HonoRouteHandler => {
  const handler = createRpcHandler(config);
  return ({ req }) => handler(req.raw);
};
