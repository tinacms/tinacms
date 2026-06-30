import type { ResolvedSegment } from '../core/field/registry';
import {
  type RegistryConflict,
  composeOverridableRegistry,
} from '../core/overridable-registry';
import { SINGLETON_SLICE_CAPABILITIES } from '../core/plugin';
import { type ClientSlice, overridesSliceMount, sliceMountFor } from './slice';

// Namespace → the slice creator mounted there. Composed once at boot from the resolved
// client segments — the same input the field registry consumes (createFieldRegistry), through
// the same order-independent override resolution (composeOverridableRegistry).
export type SliceRegistry = Map<string, ClientSlice>;

const isCapabilityNamespace = (namespace: string): boolean =>
  (SINGLETON_SLICE_CAPABILITIES as readonly string[]).includes(namespace);

// A namespace is either a singleton capability key (`media`) or a plugin name
// (`editorial-workflow`); the two collide for different reasons, so the message differs. Only
// a capability can be overridden, so a `duplicate-override` is always a capability.
const sliceConflictError = (
  conflict: RegistryConflict,
  namespace: string
): Error =>
  new Error(
    conflict === 'duplicate-override'
      ? `Two plugins both declare an \`overrides\` for the "${namespace}" capability. ` +
          'Only one may replace the built-in.'
      : isCapabilityNamespace(namespace)
        ? `Two plugins provide the "${namespace}" capability, so both mount a store ` +
          `slice at "${namespace}". Declare \`overrides\` on one to replace the other.`
        : `Two plugins are named "${namespace}" and both contribute a store slice. ` +
          'Give them distinct names.'
  );

export const composePluginSlices = (
  resolved: ResolvedSegment[]
): SliceRegistry =>
  composeOverridableRegistry(
    resolved.flatMap(({ manifest, segment }) => {
      const slice = segment.slice;
      if (!slice) return [];
      const mount = sliceMountFor(manifest);
      return [
        {
          key: mount.namespace,
          value: slice,
          isOverride: overridesSliceMount(manifest, mount),
        },
      ];
    }),
    sliceConflictError
  );
