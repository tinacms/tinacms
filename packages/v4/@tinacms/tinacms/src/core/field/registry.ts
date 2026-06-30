import {
  type RegistryConflict,
  composeOverridableRegistry,
} from '../overridable-registry';
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

const fieldConflictError = (conflict: RegistryConflict, key: string): Error =>
  new Error(
    conflict === 'duplicate-override'
      ? `Two plugins both declare an \`overrides\` for the \`field\` type "${key}". ` +
          'Only one may replace the built-in.'
      : `Two plugins provide the \`field\` capability at type "${key}". ` +
          'Declare `overrides: [{ capability: "field", key }]` to replace a built-in.'
  );

export const createFieldRegistry = (
  resolved: ResolvedSegment[]
): FieldRegistry =>
  composeOverridableRegistry(
    resolved.flatMap(({ manifest, segment }) =>
      segment.field
        ? [
            {
              key: segment.field.type,
              value: segment.field,
              isOverride: overridesFieldKey(manifest, segment.field.type),
            },
          ]
        : []
    ),
    fieldConflictError
  );

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
