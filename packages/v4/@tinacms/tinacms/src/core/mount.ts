import { invariant } from './invariant';
import {
  type Capability,
  type PluginManifest,
  isSingletonSliceCapability,
} from './plugin';

// Where a plugin mounts, on both sides of the boundary. The client store slice and the
// server ops namespace resolve through this one rule, so that `get().media.*` and
// `server.media.*` always agree. The isOverride flag records an `overrides` declaration,
// which is the only way to replace another provider (ADR-006).
export interface CapabilityMount {
  namespace: string;
  isOverride: boolean;
}

export const declaresCapabilityOverride = (
  manifest: PluginManifest,
  capability: Capability
): boolean => {
  for (const override of manifest.overrides) {
    if (override.capability === capability) {
      return true;
    }
  }
  return false;
};

// A plugin that provides a singleton capability mounts at that key. Every other plugin
// mounts under its own name. A change of provider, from tinaCloudAuth to auth0Auth,
// therefore changes no reader of `get().auth` and no caller of `server.auth.*`.
export const capabilityMountFor = (
  manifest: PluginManifest
): CapabilityMount => {
  const singletons = manifest.provides.filter(isSingletonSliceCapability);
  invariant(
    singletons.length <= 1,
    'plugin-multiple-singleton-slices',
    `Plugin "${manifest.name}" provides ${singletons.length} singleton ` +
      `capabilities (${singletons.join(', ')}), but a plugin mounts at only ` +
      'one namespace. Split it into one plugin per capability.'
  );
  const capability = singletons[0];
  if (capability) {
    return {
      namespace: capability,
      isOverride: declaresCapabilityOverride(manifest, capability),
    };
  }
  // A feature plugin must not take a capability namespace by its name alone. The peers
  // read the capability state, and call the capability ops, at these keys.
  invariant(
    !isSingletonSliceCapability(manifest.name),
    'plugin-name-squats-capability',
    `Plugin "${manifest.name}" is named after the "${manifest.name}" capability ` +
      'but does not provide it, so it would mount at that reserved ' +
      `namespace. Rename the plugin or declare \`provides: ["${manifest.name}"]\`.`
  );
  return { namespace: manifest.name, isOverride: false };
};
