// The composition root (ADR-024). It sits above core/ and plugins/, because it is the
// one place that knows both. It takes the two concerns of the user, and returns the
// resolved plugin set that every consumer boots from. The editor, the compile step, and
// the framework adapters all read that one object. None of them derives it again.

import type { Brand } from './core/brand';
import { invariant } from './core/invariant';
import type { Capability, PluginManifest } from './core/plugin';
import { validateCapabilityGraph } from './core/resolve';
import type { CollectionSchema } from './core/schema/types';
import { corePlugins } from './plugins/fields';

export interface TinaSchema {
  collections: CollectionSchema[];
}

/**
 * Type a collection where it is written. It returns its input, and exists so a
 * collection in its own file gets its type errors at its own site, and not inside
 * the config object that gathers it.
 */
export const defineCollection = (
  collection: CollectionSchema
): CollectionSchema => collection;

export interface TinaConfig {
  /**
   * Additions and overrides only. Tina installs the built-in field plugins whether
   * or not they appear here (ADR-024 §3). A plugin with the name of a built-in
   * replaces that built-in. This is how you replace the standard `string` field.
   *
   * The config for a capability sits on the plugin that provides it, for example
   * `localContentPlugin({ url })`. It is never a key at the top level.
   */
  plugins?: PluginManifest[];
  /**
   * The content model. It sits beside `plugins`, and is not one of them, because it
   * is the content of the user and not an extension. Its field types resolve against
   * the installed field plugins.
   */
  schema: TinaSchema;
}

export interface ComposedConfig {
  plugins: PluginManifest[];
  schema: TinaSchema;
}

/**
 * The output of defineConfig. It holds the composed plugin list, with the built-ins
 * folded in and the order fixed. It also holds the schema. The graph is already valid.
 *
 * Branded, because the structure alone is not the guarantee. `{ plugins: [], schema }`
 * satisfies the shape and boots a runtime with no built-in field plugins at all, which
 * is a blank editor rather than an error. The brand makes defineConfig the only way in.
 * A test that wants a bare runtime says so with `asResolvedConfig`.
 */
export type ResolvedConfig = Brand<ComposedConfig, 'ResolvedConfig'>;

/**
 * Assert a hand-built config. For a test that renders a runtime rather than a
 * configured app — it deliberately skips the built-in fold-in and every check
 * defineConfig runs, so it has no place in application code.
 */
export const asResolvedConfig = (config: ComposedConfig): ResolvedConfig =>
  config as ResolvedConfig;

const CONTENT_CAPABILITY = 'content' as const satisfies Capability;

// A plugin of the user with the name of a built-in replaces that built-in. This is not
// an `overrides` declaration (ADR-006), which replaces by capability key. This replaces
// by name. It lets `plugins` add to the built-in set without a conflict.
const composePlugins = (plugins: PluginManifest[]): PluginManifest[] => {
  const replaced = new Set(plugins.map((plugin) => plugin.name));
  return [
    ...corePlugins.filter((plugin) => !replaced.has(plugin.name)),
    ...plugins,
  ];
};

/**
 * Wire a project together. It runs at module scope in the `tina/config.ts` of the
 * user. Every error that it can find therefore fails at the import, and not part-way
 * through a boot. Those errors are a capability conflict, a missing provider, and a
 * dependency cycle.
 */
export const defineConfig = (config: TinaConfig): ResolvedConfig => {
  // The schema is the other half of the config and was reaching the compile step
  // unchecked, so `schema: {}` imported cleanly and died later as a TypeError.
  invariant(
    Array.isArray(config.schema?.collections),
    'config-schema-not-collections',
    '`schema.collections` must be an array of collections.'
  );
  const plugins = composePlugins(config.plugins ?? []);
  // The data layer is the one thing that the config cannot default (ADR-024 §3). The
  // local, self-hosted, and TinaCloud layers are different at build time.
  invariant(
    plugins.some((plugin) => plugin.provides.includes(CONTENT_CAPABILITY)),
    'config-no-content-provider',
    'No installed plugin provides the "content" capability. Add a Data Layer ' +
      'provider to `plugins` — `localContentPlugin()` for local development.'
  );
  validateCapabilityGraph(plugins);
  return asResolvedConfig({ plugins, schema: config.schema });
};
