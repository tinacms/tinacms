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

export const capabilityMountsFor = (
  manifest: PluginManifest
): CapabilityMount[] => {
  const singletons = manifest.provides.filter(isSingletonSliceCapability);
  if (singletons.length > 0) {
    return singletons.map((capability) => ({
      namespace: capability,
      isOverride: declaresCapabilityOverride(manifest, capability),
    }));
  }
  invariant(
    !isSingletonSliceCapability(manifest.name),
    'plugin-name-squats-capability',
    `Plugin "${manifest.name}" is named after the "${manifest.name}" capability ` +
      'but does not provide it, so it would mount at that reserved ' +
      `namespace. Rename the plugin or declare \`provides: ["${manifest.name}"]\`.`
  );
  return [{ namespace: manifest.name, isOverride: false }];
};
