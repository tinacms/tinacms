// The browser entry, `tinacms/client`. The client segments of the plugins import it. It
// must not import from ./server or from ./adapters/*.
//
// `defineClientPlugin` declares the client segment of a plugin, which holds the field
// descriptor that the plugin owns (ADR-009). `createRpcClient` is the primitive for the
// capability RPC (ADR-007). The ambient `server` proxy arrives with defineConfig
// (ADR-024), which knows the URL of the mounted handler.

import type { ClientSegment } from '../core/plugin';

export type { FieldDescriptor } from '../core/field/contract';
export type { ClientSegment };
export {
  createRpcClient,
  RpcError,
  type RpcClientConfig,
  type RpcProxy,
} from '../rpc/proxy';

export const defineClientPlugin = (segment: ClientSegment): ClientSegment =>
  segment;
