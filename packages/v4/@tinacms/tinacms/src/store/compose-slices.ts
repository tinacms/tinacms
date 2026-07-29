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

// A map from a namespace to the slice creator that mounts there. It is composed once at
// boot from the resolved client segments. createFieldRegistry reads the same input, and
// composeOverridableRegistry resolves the overrides for both. That resolution does not
// depend on the order.
export type SliceRegistry = Map<string, ClientSlice>;

// A namespace is a singleton capability key, such as `media`, or a plugin name, such as
// `editorial-workflow`. The two collide for different reasons, so the message differs.
// Only a capability accepts an override, so a duplicate override is always a capability.
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
