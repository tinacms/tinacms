// A registry keyed by string, composed from plugin-contributed entries where each entry is
// either a built-in ("base") or a plugin's explicit `overrides` of one. Composition is
// order-independent: an override wins its key whether it resolves before or after the base;
// two bases, or two overrides, at one key is a conflict the caller describes.
//
// The field registry (field descriptors by type) and the store's slice composer (slices by
// namespace) share this exact resolution, so it lives here once — one place to fix if the
// rules ever change.

export interface RegistryEntry<TValue> {
  key: string;
  value: TValue;
  // True when the entry comes from a plugin declaring `overrides` for `key` — it replaces a
  // base at the same key rather than colliding with it.
  isOverride: boolean;
}

export type RegistryConflict = 'duplicate-base' | 'duplicate-override';

export const composeOverridableRegistry = <TValue>(
  entries: Iterable<RegistryEntry<TValue>>,
  conflictError: (conflict: RegistryConflict, key: string) => Error
): Map<string, TValue> => {
  const registry = new Map<string, TValue>();
  // Keys whose value was placed by an override — so an override wins a collision whichever
  // order it resolves in, rather than relying on the base registering first.
  const overridden = new Set<string>();

  for (const { key, value, isOverride } of entries) {
    if (!registry.has(key)) {
      registry.set(key, value);
      if (isOverride) overridden.add(key);
      continue;
    }
    if (isOverride && !overridden.has(key)) {
      // An override replaces the base it targets, even if the override resolved first.
      registry.set(key, value);
      overridden.add(key);
      continue;
    }
    if (!isOverride && overridden.has(key)) {
      // A base yields to an override already registered for this key.
      continue;
    }
    throw conflictError(
      overridden.has(key) ? 'duplicate-override' : 'duplicate-base',
      key
    );
  }
  return registry;
};
