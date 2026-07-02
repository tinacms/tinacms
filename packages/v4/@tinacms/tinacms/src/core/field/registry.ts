import { invariant } from '../invariant';
import {
  type RegistryConflict,
  composeOverridableRegistry,
} from '../overridable-registry';
import type { PluginManifest, ResolvedSegment } from '../plugin';
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

// Load every plugin's client segment once. The one boot-time resolution pass — its
// result feeds both createFieldRegistry and createTinaStore so the two compose from
// the same segments and can't diverge.
export const resolveClientSegments = async (
  plugins: PluginManifest[]
): Promise<ResolvedSegment[]> => {
  const resolved: ResolvedSegment[] = [];
  for (const manifest of plugins) {
    if (!manifest.client) continue;
    const clientModule = await manifest.client();
    invariant(
      clientModule?.default,
      'plugin-client-no-default',
      `Plugin "${manifest.name}" has a client segment with no default export.`
    );
    resolved.push({ manifest, segment: clientModule.default });
  }
  return resolved;
};

export const resolveFieldPlugins = async (
  plugins: PluginManifest[]
): Promise<FieldRegistry> =>
  createFieldRegistry(await resolveClientSegments(plugins));
