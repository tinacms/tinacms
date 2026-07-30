import { capabilityMountFor } from '../core/mount';
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

export const composePluginSlices = (
  resolved: ResolvedSegment[]
): SliceRegistry =>
  composeOverridableRegistry(
    resolved.flatMap(({ manifest, segment }) => {
      const slice = segment.slice;
      if (!slice) return [];
      const mount = capabilityMountFor(manifest);
      return [
        { key: mount.namespace, value: slice, isOverride: mount.isOverride },
      ];
    }),
    sliceConflictError
  );
