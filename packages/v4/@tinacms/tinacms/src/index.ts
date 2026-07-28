// Universal entry — imported by client, server, and per-framework adapter code.
// Must NOT import from ./react, ./client, ./server, or ./adapters.
//
// Config + schema authoring surface (ADR-024): definePlugin, the `t` schema
// helpers, and the public contract types. Each field type contributes its own
// `t.<type>` builder from its plugin; this entry is the composition root.

// The schema compile is pure and node-safe (it reads manifests, never segments), so
// it sits in the universal entry beside the config it compiles. loadTinaConfig does
// not: it needs vite to resolve the user's TypeScript, so it stays build-side only.
export {
  type LockCheck,
  LOCK_VERSION,
  checkLock,
  compileSchema,
  type TinaLock,
} from './codegen/compile-schema';
export {
  defineConfig,
  type ResolvedConfig,
  type TinaConfig,
  type TinaSchema,
} from './config';
export type {
  ContentProvider,
  ContentSlice,
  DocumentEntry,
} from './core/content/contract';
export {
  type Capability,
  definePlugin,
  type PluginManifest,
} from './core/plugin';
export type {
  CollectionFormat,
  CollectionSchema,
  FieldSchema,
  TinaDocument,
} from './core/schema/types';
export { localContentPlugin } from './plugins/content/local/local-content.plugin';
export { corePlugins, t } from './plugins/fields';
export type {
  BooleanFieldSchema,
  NumberFieldSchema,
  RichTextFieldSchema,
  StringFieldSchema,
} from './plugins/fields';
