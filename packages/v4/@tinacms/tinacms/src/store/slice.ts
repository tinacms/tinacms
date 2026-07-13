import { invariant } from '../core/invariant';
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
  const singletons = (manifest.provides ?? []).filter(
    isSingletonSliceCapability
  );
  invariant(
    singletons.length <= 1,
    'plugin-multiple-singleton-slices',
    `Plugin "${manifest.name}" provides ${singletons.length} singleton ` +
      `capabilities (${singletons.join(', ')}), but a client segment has one ` +
      'slice, so it can mount at only one namespace.'
  );
  // The invariant above caps singletons at one, so [0] is that single capability or
  // undefined — undefined ⇒ a feature plugin, mounted under its own name.
  const capability = singletons[0];
  if (capability) return { namespace: capability, capability };
  // A feature plugin must not squat a capability namespace by name alone: peers read
  // capability state at these keys (`get().media`), so only a genuine provider may
  // mount there — the same reservation createTinaStore applies to core namespaces.
  invariant(
    !isSingletonSliceCapability(manifest.name),
    'plugin-name-squats-capability',
    `Plugin "${manifest.name}" is named after the "${manifest.name}" capability ` +
      'but does not provide it, so its slice would mount at that reserved ' +
      `namespace. Rename the plugin or declare \`provides: ["${manifest.name}"]\`.`
  );
  return { namespace: manifest.name };
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
