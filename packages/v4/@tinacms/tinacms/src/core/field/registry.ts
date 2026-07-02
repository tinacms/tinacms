import {
  type RegistryConflict,
  composeOverridableRegistry,
} from '../overridable-registry';
import {
  type PluginManifest,
  type ResolvedSegment,
  resolveClientSegments,
} from '../plugin';
import type { FieldDescriptor } from './contract';

export type FieldRegistry = Map<string, FieldDescriptor>;

const overridesFieldKey = (manifest: PluginManifest, key: string): boolean =>
  (manifest.overrides ?? []).some(
    (override) => override.capability === 'field' && override.key === key
  );

const fieldConflictError = (conflict: RegistryConflict, key: string): Error => {
  if (conflict === 'duplicate-override') {
    return new Error(
      `Two plugins both declare an \`overrides\` for the \`field\` type "${key}". ` +
        'Only one may replace the built-in.'
    );
  }
  return new Error(
    `Two plugins provide the \`field\` capability at type "${key}". ` +
      'Declare `overrides: [{ capability: "field", key }]` to replace a built-in.'
  );
};

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
): Promise<FieldRegistry> =>
  createFieldRegistry(await resolveClientSegments(plugins));
