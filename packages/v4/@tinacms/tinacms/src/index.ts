// Universal entry — imported by client, server, and per-framework adapter code.
// Must NOT import from ./react, ./client, ./server, or ./adapters.
//
// Config + schema authoring surface (ADR-024): definePlugin, the `t` schema
// helpers, and the public contract types. Each field type contributes its own
// `t.<type>` builder from its plugin; this entry is the composition root.

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
export { corePlugins, t } from './plugins/fields';
export type { StringFieldSchema } from './plugins/fields';
