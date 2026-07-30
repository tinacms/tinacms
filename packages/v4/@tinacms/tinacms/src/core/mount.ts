import { invariant } from './invariant';
import {
  type Capability,
  type PluginManifest,
  isSingletonSliceCapability,
} from './plugin';

export interface CapabilityMount {
  namespace: string;
  isOverride: boolean;
}

export const declaresCapabilityOverride = (
  manifest: PluginManifest,
  capability: Capability
): boolean =>
  manifest.overrides.some((override) => override.capability === capability);

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
  invariant(
    !isSingletonSliceCapability(manifest.name),
    'plugin-name-squats-capability',
    `Plugin "${manifest.name}" is named after the "${manifest.name}" capability ` +
      'but does not provide it, so it would mount at that reserved ' +
      `namespace. Rename the plugin or declare \`provides: ["${manifest.name}"]\`.`
  );
  return { namespace: manifest.name, isOverride: false };
};
