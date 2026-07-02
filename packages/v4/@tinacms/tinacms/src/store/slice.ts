import {
  type ClientSlice,
  type PluginManifest,
  type SingletonSliceCapability,
  type SliceSet,
  type SliceState,
  type TinaStoreState,
  isSingletonSliceCapability,
} from '../core/plugin';

// The slice/store types and the singleton-capability list live in core/plugin.ts (the plugin
// contract owns them); the types are re-exported here so the store module imports them from
// one place.
export type { ClientSlice, SliceSet, SliceState, TinaStoreState };

export interface SliceMount {
  namespace: string;
  // Present only when the namespace is a singleton capability key; absent when the
  // slice mounts under the plugin name (a feature plugin like editorial-workflow).
  capability?: SingletonSliceCapability;
}

// A plugin providing a singleton capability mounts its slice at that key; anything else
// mounts under the plugin name. Swapping providers (tinaCloudAuth → auth0Auth) leaves
// `get().auth` consumers unchanged.
export const sliceMountFor = (manifest: PluginManifest): SliceMount => {
  const capability = (manifest.provides ?? []).find(isSingletonSliceCapability);
  return capability
    ? { namespace: capability, capability }
    : { namespace: manifest.name };
};

// A later plugin may replace a singleton's slice only by declaring an explicit override
// for that capability — the same rule the field registry enforces per field type.
export const overridesSliceMount = (
  manifest: PluginManifest,
  mount: SliceMount
): boolean =>
  mount.capability != null &&
  (manifest.overrides ?? []).some(
    (override) => override.capability === mount.capability
  );
