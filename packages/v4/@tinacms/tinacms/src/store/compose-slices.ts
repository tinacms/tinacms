import { invariant } from '../core/invariant';
import { capabilityMountsFor } from '../core/mount';
import {
  REGISTRY_CONFLICTS,
  type RegistryConflict,
  composeOverridableRegistry,
} from '../core/overridable-registry';
import {
  type ClientSlice,
  type ResolvedSegment,
  isSingletonSliceCapability,
} from '../core/plugin';

export type SliceRegistry = Map<string, ClientSlice>;

const sliceConflictError = (
  conflict: RegistryConflict,
  namespace: string
): Error => {
  if (conflict === REGISTRY_CONFLICTS.duplicateOverride) {
    return new Error(
      `Two plugins both declare an \`overrides\` for the "${namespace}" capability. ` +
        'Only one may replace the built-in.'
    );
  }
  if (isSingletonSliceCapability(namespace)) {
    return new Error(
      `Two plugins provide the "${namespace}" capability, so both mount a store ` +
        `slice at "${namespace}". Declare \`overrides\` on one to replace the other.`
    );
  }
  return new Error(
    `Two plugins are named "${namespace}" and both contribute a store slice. ` +
      'Give them distinct names.'
  );
};

const validatedSlices = ({
  manifest,
  segment,
}: ResolvedSegment): Partial<Record<string, ClientSlice>> | undefined => {
  invariant(
    !(segment.slice && segment.slices),
    'plugin-slice-and-slices',
    `Plugin "${manifest.name}" sets both \`slice\` and \`slices\`. Set one.`
  );
  if (segment.slices) {
    for (const key of Object.keys(segment.slices)) {
      invariant(
        isSingletonSliceCapability(key) && manifest.provides.includes(key),
        'plugin-slices-key-not-provided',
        `Plugin "${manifest.name}" has a slice under \`slices.${key}\`, but ` +
          `"${key}" is not a singleton capability it provides.`
      );
    }
    return segment.slices;
  }
  return undefined;
};

export const composePluginSlices = (
  resolved: ResolvedSegment[]
): SliceRegistry =>
  composeOverridableRegistry(
    resolved.flatMap((entry) => {
      const { manifest, segment } = entry;
      const slices = validatedSlices(entry);
      if (!slices && !segment.slice) return [];
      const mounts = capabilityMountsFor(manifest);
      invariant(
        slices || mounts.length === 1,
        'plugin-slice-ambiguous',
        `Plugin "${manifest.name}" provides ${mounts.length} singleton ` +
          `capabilities (${mounts.map((mount) => mount.namespace).join(', ')}) ` +
          'but sets one `slice`. Set `slices`, keyed by capability.'
      );
      return mounts.flatMap((mount) => {
        const slice = slices ? slices[mount.namespace] : segment.slice;
        if (!slice) return [];
        return [
          { key: mount.namespace, value: slice, isOverride: mount.isOverride },
        ];
      });
    }),
    sliceConflictError
  );
