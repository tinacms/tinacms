// Browser-only entry — `tinacms/client`.
// Imported by plugin client segments.
// Must NOT import from ./server or ./adapters/*.
//
// `defineClientPlugin` declares a plugin's client segment — the field descriptor
// it owns (ADR-009). The `server` RPC proxy (ADR-007) lands with server segments.

import type { ClientSegment } from '../core/plugin';

export type { FieldDescriptor } from '../core/field/contract';
export type { ClientSegment };

export const defineClientPlugin = (segment: ClientSegment): ClientSegment =>
  segment;
