import { invariant } from '../invariant';
import {
  REGISTRY_CONFLICTS,
  type RegistryConflict,
  composeOverridableRegistry,
} from '../overridable-registry';
import {
  FIELD_CAPABILITY,
  type PluginManifest,
  type ResolvedSegment,
  resolveClientSegments,
} from '../plugin';
import type { FieldDescriptor } from './contract';

export type FieldRegistry = Map<string, FieldDescriptor>;

export const overridesFieldKey = (
  manifest: PluginManifest,
  key: string
): boolean =>
  manifest.overrides.some(
    (override) =>
      override.capability === FIELD_CAPABILITY && override.key === key
  );

export const fieldConflictError = (
  conflict: RegistryConflict,
  key: string
): Error => {
  if (conflict === REGISTRY_CONFLICTS.duplicateOverride) {
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

const fieldEntryOf = ({ manifest, segment }: ResolvedSegment) => {
  if (!(manifest.field || segment.field)) return [];
  invariant(
    manifest.field,
    'field-plugin-no-provision',
    `Plugin "${manifest.name}" has a field descriptor but declares no \`field: { type, contractVersion }\` on its manifest.`
  );
  invariant(
    segment.field,
    'field-plugin-no-descriptor',
    `Plugin "${manifest.name}" declares the field type "${manifest.field.type}" but its client segment exports no field descriptor.`
  );
  return [
    {
      key: manifest.field.type,
      value: segment.field,
      isOverride: overridesFieldKey(manifest, manifest.field.type),
    },
  ];
};

export const createFieldRegistry = (
  resolved: ResolvedSegment[]
): FieldRegistry =>
  composeOverridableRegistry(
    resolved.flatMap(fieldEntryOf),
    fieldConflictError
  );

export const resolveFieldPlugins = async (
  plugins: PluginManifest[]
): Promise<FieldRegistry> =>
  createFieldRegistry(await resolveClientSegments(plugins));
