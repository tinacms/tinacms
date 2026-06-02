// Server-only entry — `tinacms/server`.
// Imported by plugin server segments and by per-framework adapters.
// Never reaches the browser bundle.
//
// Intended exports (see https://github.com/tinacms/tinacmsv4-docs/blob/main/api/internal-apis.md#server-segment):
//   defineServerPlugin   — declare a plugin's server-side operations
//   protectedOp          — wrap an op to require a Permission
//   publicOp             — greppable opt-out for unauthenticated endpoints (ADR-008)
//   use<C extends Capability>(capability) — server→server in-process accessor
//   mountHandler         — internal; consumed by adapters under ./adapters/*

export {};
