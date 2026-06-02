// Browser-only entry — `tinacms/client`.
// Imported by plugin client segments.
// Must NOT import from ./server or ./adapters/*.
//
// Intended exports (see https://github.com/tinacms/tinacmsv4-docs/blob/main/api/internal-apis.md#client-segment):
//   defineClientPlugin   — declare slice/components/field for a plugin's client segment
//   server               — typed Capability RPC Proxy (client → server)
//
// The `server` proxy's types are inferred via `import type` from each plugin's
// server segment exports; no codegen step. See ADR-007.

export {};
