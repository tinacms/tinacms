import { invariant } from './invariant';
import { type PluginManifest, isSingletonSliceCapability } from './plugin';

// Where a plugin's contribution mounts, on either side of the boundary: the client store
// slice (store/compose-slices.ts) and the server ops namespace (rpc/handler.ts) resolve
// through this one rule so `get().media.*` and `server.media.*` always agree.
export interface CapabilityMount {
  namespace: string;
  // True when the plugin declares an explicit `overrides` for the capability it mounts
  // at — the only sanctioned way to replace another provider (ADR-006).
  isOverride: boolean;
}

// Whether the manifest declares an explicit override for `capability` — shared with the
// graph validation pass (core/resolve.ts), which checks it per provided capability.
export const declaresCapabilityOverride = (
  manifest: PluginManifest,
  capability: string
): boolean =>
  (manifest.overrides ?? []).some(
    (override) => override.capability === capability
  );

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
  if (capability) {
    return {
      namespace: capability,
      isOverride: declaresCapabilityOverride(manifest, capability),
    };
  }
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
  return { namespace: manifest.name, isOverride: false };
};
