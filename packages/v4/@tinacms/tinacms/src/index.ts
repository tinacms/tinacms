// Universal entry — imported by client, server, and per-framework adapter code.
// Must NOT import from ./react, ./client, ./server, or ./adapters.
//
// Intended exports (see ../../tinacmsv4/api/public-api.md):
//   defineConfig, defineCollection, definePlugin
//   t (schema helpers: string, number, boolean, datetime, object, list, reference)
//   types: TinaConfig, PluginManifest, Capability, Permission, FieldAddress
//
// Implementation lives in ./core.

export {}
