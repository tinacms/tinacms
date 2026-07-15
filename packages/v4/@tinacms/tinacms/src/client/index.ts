// Browser-only entry — `tinacms/client`.
// Imported by plugin client segments.
// Must NOT import from ./server or ./adapters/*.
//
// `defineClientPlugin` declares a plugin's client segment — the field descriptor
// it owns (ADR-009). `createRpcClient` is the Capability RPC primitive (ADR-007);
// the ambient `server` proxy singleton arrives with defineConfig (ADR-024), which
// knows the mounted handler URL.

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
