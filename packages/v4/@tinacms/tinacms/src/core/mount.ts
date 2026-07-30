import { invariant } from './invariant';
import {
  type Capability,
  type PluginManifest,
  isSingletonSliceCapability,
} from './plugin';

// Where a plugin mounts, on both sides of the boundary: one rule so
// `get().media.*` and `server.media.*` always agree.
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

// Singleton providers mount at the capability key, everything else under its
// own name, so a change of provider changes no reader.
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
  // A feature plugin must not squat a capability namespace by name alone.
  invariant(
    !isSingletonSliceCapability(manifest.name),
    'plugin-name-squats-capability',
    `Plugin "${manifest.name}" is named after the "${manifest.name}" capability ` +
      'but does not provide it, so it would mount at that reserved ' +
      `namespace. Rename the plugin or declare \`provides: ["${manifest.name}"]\`.`
  );
  return { namespace: manifest.name, isOverride: false };
};
