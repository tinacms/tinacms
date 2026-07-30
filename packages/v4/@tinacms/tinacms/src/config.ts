
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

const composePlugins = (plugins: PluginManifest[]): PluginManifest[] => {
  const replaced = new Set(plugins.map((plugin) => plugin.name));
  return [
    ...corePlugins.filter((plugin) => !replaced.has(plugin.name)),
    ...plugins,
  ];
};

export const defineConfig = (config: TinaConfig): ResolvedConfig => {
  invariant(
    Array.isArray(config.schema?.collections),
    'config-schema-not-collections',
    '`schema.collections` must be an array of collections.'
  );
  const plugins = composePlugins(config.plugins ?? []);
  invariant(
    plugins.some((plugin) => plugin.provides.includes(CONTENT_CAPABILITY)),
    'config-no-content-provider',
    'No installed plugin provides the "content" capability. Add a Data Layer ' +
      'provider to `plugins` — `localContentPlugin()` for local development.'
  );
  validateCapabilityGraph(plugins);
  return asResolvedConfig({
    plugins,
    schema: config.schema,
    build: resolveBuild(config.build),
  });
};
