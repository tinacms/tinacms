import { invariant } from './invariant';
import {
  type PluginManifest,
  type SingletonSliceCapability,
  isSingletonSliceCapability,
} from './plugin';

// Where a plugin's contribution mounts, on either side of the boundary: the client store
// slice (store/compose-slices.ts) and the server ops namespace (rpc/handler.ts) resolve
// through this one rule so `get().media.*` and `server.media.*` always agree.
export interface CapabilityMount {
  namespace: string;
  // Present only when the namespace is a singleton capability key; absent when the
  // plugin mounts under its own name (a feature plugin like editorial-workflow).
  capability?: SingletonSliceCapability;
}

// A plugin providing a singleton capability mounts at that key; anything else mounts
// under the plugin name. Swapping providers (tinaCloudAuth → auth0Auth) leaves
// `get().auth` readers and `server.auth.*` callers unchanged.
export const capabilityMountFor = (
  manifest: PluginManifest
): CapabilityMount => {
  const singletons = (manifest.provides ?? []).filter(
    isSingletonSliceCapability
  );
  invariant(
    singletons.length <= 1,
    'plugin-multiple-singleton-slices',
    `Plugin "${manifest.name}" provides ${singletons.length} singleton ` +
      `capabilities (${singletons.join(', ')}), but a plugin mounts at only ` +
      'one namespace. Split it into one plugin per capability.'
  );
  // The invariant above caps singletons at one, so [0] is that single capability or
  // undefined — undefined ⇒ a feature plugin, mounted under its own name.
  const capability = singletons[0];
  if (capability) return { namespace: capability, capability };
  // A feature plugin must not squat a capability namespace by name alone: peers read
  // capability state and call capability ops at these keys, so only a genuine provider
  // may mount there — the same reservation createTinaStore applies to core namespaces.
  invariant(
    !isSingletonSliceCapability(manifest.name),
    'plugin-name-squats-capability',
    `Plugin "${manifest.name}" is named after the "${manifest.name}" capability ` +
      'but does not provide it, so it would mount at that reserved ' +
      `namespace. Rename the plugin or declare \`provides: ["${manifest.name}"]\`.`
  );
  return { namespace: manifest.name };
};

// A later plugin may replace a singleton's mount only by declaring an explicit override
// for that capability — the same rule the field registry enforces per field type.
export const overridesCapabilityMount = (
  manifest: PluginManifest,
  mount: CapabilityMount
): boolean =>
  mount.capability != null &&
  (manifest.overrides ?? []).some(
    (override) => override.capability === mount.capability
  );
