import type { Brand } from './core/brand';
import { invariant } from './core/invariant';
import type { Capability, PluginManifest } from './core/plugin';
import { validateCapabilityGraph } from './core/resolve';
import type { CollectionSchema } from './core/schema/types';
import { corePlugins } from './plugins/fields';

export interface TinaSchema {
  collections: CollectionSchema[];
}

export const defineCollection = (
  collection: CollectionSchema
): CollectionSchema => collection;

export interface TinaBuildConfig {
  publicFolder?: string;
  outputFolder?: string;
}

export const DEFAULT_BUILD: Required<TinaBuildConfig> = {
  publicFolder: 'public',
  outputFolder: 'admin',
};

export const resolveBuild = (
  build?: TinaBuildConfig
): Required<TinaBuildConfig> => ({ ...DEFAULT_BUILD, ...build });

export interface TinaConfig {
  plugins?: PluginManifest[];
  schema: TinaSchema;
  build?: TinaBuildConfig;
}

export interface ComposedConfig {
  plugins: PluginManifest[];
  schema: TinaSchema;
  build?: Required<TinaBuildConfig>;
}

export type ResolvedConfig = Brand<ComposedConfig, 'ResolvedConfig'>;

export const asResolvedConfig = (config: ComposedConfig): ResolvedConfig =>
  config as ResolvedConfig;

const CONTENT_CAPABILITY = 'content' as const satisfies Capability;

const CAPABILITY_EXAMPLES: Partial<Record<Capability, string>> = {
  media: 'localMediaPlugin()',
};

interface OmittedPlugin {
  plugin: PluginManifest;
  missing: Capability;
}

// A user plugin with an unmet dependency still fails in validateCapabilityGraph.
const composePlugins = (
  plugins: PluginManifest[],
  core: PluginManifest[]
): { plugins: PluginManifest[]; omitted: OmittedPlugin[] } => {
  const replaced = new Set(plugins.map((plugin) => plugin.name));
  let kept = core.filter((plugin) => !replaced.has(plugin.name));
  const omitted: OmittedPlugin[] = [];
  while (true) {
    const provided = new Set(
      [...kept, ...plugins].flatMap((plugin) => plugin.provides)
    );
    const unmet = kept.flatMap((plugin) => {
      const missing = plugin.dependsOn.find((dep) => !provided.has(dep));
      return missing ? [{ plugin, missing }] : [];
    });
    if (!unmet.length) break;
    omitted.push(...unmet);
    kept = kept.filter((plugin) => !unmet.some((it) => it.plugin === plugin));
  }
  return { plugins: [...kept, ...plugins], omitted };
};

interface FieldTree {
  type?: string;
  fields?: FieldTree[];
  templates?: { fields?: FieldTree[] }[];
}

const fieldTypesIn = (fields: FieldTree[]): string[] =>
  fields.flatMap((field) => [
    ...(field.type ? [field.type] : []),
    ...fieldTypesIn(field.fields ?? []),
    ...(field.templates ?? []).flatMap((template) =>
      fieldTypesIn(template.fields ?? [])
    ),
  ]);

const assertOmittedFieldTypesUnused = (
  schema: TinaSchema,
  plugins: PluginManifest[],
  omitted: OmittedPlugin[]
) => {
  const used = new Set(
    schema.collections.flatMap((collection) => fieldTypesIn(collection.fields))
  );
  const installed = new Set(plugins.map((plugin) => plugin.field?.type));
  const blocked = omitted.find(
    ({ plugin }) =>
      plugin.field &&
      used.has(plugin.field.type) &&
      !installed.has(plugin.field.type)
  );
  if (!blocked) return;
  const example = CAPABILITY_EXAMPLES[blocked.missing];
  invariant(
    false,
    'field-type-missing-capability',
    `\`${blocked.plugin.field?.type}\` fields need a ${blocked.missing} plugin` +
      (example ? `, e.g. ${example}` : '') +
      `. Add a plugin that provides the "${blocked.missing}" capability to \`plugins\`.`
  );
};

/** `defineConfig` over a given core plugin list. */
export const composeConfig = (
  config: TinaConfig,
  core: PluginManifest[]
): ResolvedConfig => {
  invariant(
    Array.isArray(config.schema?.collections),
    'config-schema-not-collections',
    '`schema.collections` must be an array of collections.'
  );
  const { plugins, omitted } = composePlugins(config.plugins ?? [], core);
  invariant(
    plugins.some((plugin) => plugin.provides.includes(CONTENT_CAPABILITY)),
    'config-no-content-provider',
    'No installed plugin provides the "content" capability. Add a Data Layer ' +
      'provider to `plugins` — `localContentPlugin()` for local development.'
  );
  assertOmittedFieldTypesUnused(config.schema, plugins, omitted);
  validateCapabilityGraph(plugins);
  return asResolvedConfig({
    plugins,
    schema: config.schema,
    build: resolveBuild(config.build),
  });
};

/**
 * Prepends `corePlugins`, leaving out any whose `dependsOn` no installed
 * plugin provides: the `image` field installs only alongside a media plugin.
 */
export const defineConfig = (config: TinaConfig): ResolvedConfig =>
  composeConfig(config, corePlugins);
