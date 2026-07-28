// The composition root (ADR-024). Sits above core/ and plugins/ because it is the
// one place that knows both: it takes the user's two sibling concerns and returns
// the resolved plugin set every consumer boots from — the editor, the compile step,
// and the framework adapters all read the same object rather than each re-deriving it.

import { invariant } from './core/invariant';
import type { Capability, PluginManifest } from './core/plugin';
import { validateCapabilityGraph } from './core/resolve';
import type { CollectionSchema } from './core/schema/types';
import { corePlugins } from './plugins/fields';

export interface TinaSchema {
  collections: CollectionSchema[];
}

export interface TinaConfig {
  /**
   * Additions and `overrides` only — the built-in field plugins are installed
   * whether or not they appear here (ADR-024 §3). A plugin listed under a
   * built-in's name replaces it, which is how you swap the stock `string` field.
   *
   * Per-capability config lives on the plugin that provides it
   * (`localContent({ url })`), never as a top-level key.
   */
  plugins?: PluginManifest[];
  /**
   * The content model — a sibling of `plugins`, not one of them, because it is
   * the user's content rather than an extension. Its field `type`s resolve
   * against the installed field plugins.
   */
  schema: TinaSchema;
}

// What defineConfig hands on: the composed plugin list (built-ins folded in, order
// fixed) plus the schema, already validated as a graph.
export interface ResolvedConfig {
  plugins: PluginManifest[];
  schema: TinaSchema;
}

const CONTENT_CAPABILITY = 'content' as const satisfies Capability;

// A user plugin named after a built-in replaces it. Kept distinct from a capability
// `overrides` (ADR-006), which replaces by capability key: this one is by identity,
// and exists so `plugins` can be additive without the built-in set fighting it.
const composePlugins = (plugins: PluginManifest[]): PluginManifest[] => {
  const replaced = new Set(plugins.map((plugin) => plugin.name));
  return [
    ...corePlugins.filter((plugin) => !replaced.has(plugin.name)),
    ...plugins,
  ];
};

/**
 * Wire a project together. Runs at module scope in the user's `tina/config.ts`, so
 * everything it can catch — a capability conflict, a missing provider, a dependency
 * cycle — fails at import rather than part-way through a boot.
 */
export const defineConfig = (config: TinaConfig): ResolvedConfig => {
  const plugins = composePlugins(config.plugins ?? []);
  // Which Data Layer you are on is the one thing config cannot default (ADR-024 §3):
  // local, self-hosted and TinaCloud are not interchangeable at build time.
  invariant(
    plugins.some((plugin) => plugin.provides.includes(CONTENT_CAPABILITY)),
    'config-no-content-provider',
    'No installed plugin provides the "content" capability. Add a Data Layer ' +
      'provider to `plugins` — `localContentPlugin()` for local development.'
  );
  validateCapabilityGraph(plugins);
  return { plugins, schema: config.schema };
};
