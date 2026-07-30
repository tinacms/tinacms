
export interface RegistryEntry<TValue> {
  key: string;
  value: TValue;
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
  const overriddenKeys = new Set<string>();
  const baseKeys = new Set<string>();

  for (const { key, value, isOverride } of entries) {
    if (isOverride) {
      if (overriddenKeys.has(key))
        throw conflictError(REGISTRY_CONFLICTS.duplicateOverride, key);
      registry.set(key, value);
      overriddenKeys.add(key);
      continue;
    }
    if (baseKeys.has(key))
      throw conflictError(REGISTRY_CONFLICTS.duplicateBase, key);
    baseKeys.add(key);
    if (!overriddenKeys.has(key)) registry.set(key, value);
  }
  return registry;
};
