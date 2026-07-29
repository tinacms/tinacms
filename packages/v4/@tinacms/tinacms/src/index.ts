// The universal entry. The client code, the server code, and the framework adapters all
// import it. It must not import from ./react, ./client, ./server, or ./adapters.
//
// It holds the surface for the config and the schema (ADR-024): definePlugin, the `t`
// schema helpers, and the public contract types. Each field type supplies its own
// `t.<type>` builder from its plugin. This entry is the composition root.

// The schema compile is pure, and it runs in Node, because it reads the manifests and
// never the segments. It therefore sits in the universal entry, next to the config that
// it compiles. loadTinaConfig does not sit here. It needs Vite to resolve the TypeScript
// of the user, so it stays on the build side.
export {
  type LockCheck,
  LOCK_VERSION,
  checkLock,
  compileSchema,
  type TinaLock,
} from './codegen/compile-schema';
export {
  defineCollection,
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
export type { AdminScreen, AdminScreenProps } from './core/screen/contract';
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
  DatetimeFieldSchema,
  NumberFieldSchema,
  RichTextFieldSchema,
  StringFieldSchema,
} from './plugins/fields';
