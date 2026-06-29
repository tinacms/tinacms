import type { ClientSegment, PluginManifest } from '../plugin';
import type { FieldDescriptor } from './contract';

export type FieldRegistry = Map<string, FieldDescriptor>;

export interface ResolvedSegment {
  manifest: PluginManifest;
  segment: ClientSegment;
}

const overridesFieldKey = (manifest: PluginManifest, key: string): boolean =>
  (manifest.overrides ?? []).some(
    (override) => override.capability === 'field' && override.key === key
  );

export const createFieldRegistry = (
  resolved: ResolvedSegment[]
): FieldRegistry => {
  const registry: FieldRegistry = new Map();
  for (const { manifest, segment } of resolved) {
    const field = segment.field;
    if (!field) continue;
    const key = field.type;
    if (registry.has(key) && !overridesFieldKey(manifest, key)) {
      throw new Error(
        `Two plugins provide the \`field\` capability at type "${key}". ` +
          'Declare `overrides: [{ capability: "field", key }]` to replace a built-in.'
      );
    }
    registry.set(key, field);
  }
  return registry;
};

export const resolveFieldPlugins = async (
  plugins: PluginManifest[]
): Promise<FieldRegistry> => {
  const resolved: ResolvedSegment[] = [];
  for (const manifest of plugins) {
    if (!manifest.client) continue;
    const clientModule = await manifest.client();
    if (!clientModule?.default) {
      throw new Error(
        `Plugin "${manifest.name}" has a client segment with no default export.`
      );
    }
    resolved.push({ manifest, segment: clientModule.default });
  }
  return createFieldRegistry(resolved);
};
