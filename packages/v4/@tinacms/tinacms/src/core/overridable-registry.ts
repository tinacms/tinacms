// A registry with string keys, composed from the entries that the plugins supply. Each
// entry is a built-in, which this file calls a base, or an `overrides` declaration from a
// plugin. The composition does not depend on the order. An override wins its key, whether
// it resolves before the base or after it. Two bases at one key are a conflict, and so are
// two overrides. The caller writes the message for that conflict.
//
// The field registry holds the field descriptors by type. The slice composer of the store
// holds the slices by namespace. Both resolve in this way, so the rule lives here once.

export interface RegistryEntry<TValue> {
  key: string;
  value: TValue;
  // True when the plugin declares an `overrides` for `key`. The entry then replaces a
  // base at that key, and does not collide with it.
  isOverride: boolean;
}

export const REGISTRY_CONFLICTS = {
  duplicateBase: 'duplicate-base',
  duplicateOverride: 'duplicate-override',
} as const;

export type RegistryConflict =
  (typeof REGISTRY_CONFLICTS)[keyof typeof REGISTRY_CONFLICTS];

export const composeOverridableRegistry = <TValue>(
  entries: Iterable<RegistryEntry<TValue>>,
  conflictError: (conflict: RegistryConflict, key: string) => Error
): Map<string, TValue> => {
  const registry = new Map<string, TValue>();
  // An override wins its key in any order. Two bases at one key collide, and so do two
  // overrides. Two sets record this, and not one. A second base is therefore still a
  // duplicate base when an override already holds the key. An override must not hide a
  // real collision between two other plugins.
  const overriddenKeys = new Set<string>();
  const baseKeys = new Set<string>();

  for (const { key, value, isOverride } of entries) {
    if (isOverride) {
      if (overriddenKeys.has(key))
        throw conflictError(REGISTRY_CONFLICTS.duplicateOverride, key);
      // An override takes its key, whether or not a base has resolved.
      registry.set(key, value);
      overriddenKeys.add(key);
      continue;
    }
    if (baseKeys.has(key))
      throw conflictError(REGISTRY_CONFLICTS.duplicateBase, key);
    baseKeys.add(key);
    // A base fills its key only when no override holds it.
    if (!overriddenKeys.has(key)) registry.set(key, value);
  }
  return registry;
};
