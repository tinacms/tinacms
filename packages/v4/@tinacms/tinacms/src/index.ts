// Universal entry — imported by client, server, and per-framework adapter code.
// Must NOT import from ./react, ./client, ./server, or ./adapters.
//
// Config + schema authoring surface (ADR-024): definePlugin, the `t` schema
// helpers, and the public contract types. Each field type contributes its own
// `t.<type>` builder from its plugin; this entry is the composition root.

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
  CollectionSchema,
  FieldSchema,
  TinaDocument,
} from './core/schema/types';
export { localContentPlugin } from './plugins/content/local/local-content.plugin';
export { corePlugins, t } from './plugins/fields';
export type {
  BooleanFieldSchema,
  NumberFieldSchema,
  StringFieldSchema,
} from './plugins/fields';
