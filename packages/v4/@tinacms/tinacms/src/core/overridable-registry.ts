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
  // An override wins its key whichever order it resolves in; two bases, or two overrides,
  // at one key collide. Tracked as two sets rather than one so a second base is still a
  // `duplicate-base` even when an override already sits at the key — an override must not
  // mask a genuine base-vs-base collision between two other plugins.
  const overridden = new Set<string>();
  const based = new Set<string>();

  for (const { key, value, isOverride } of entries) {
    if (isOverride) {
      if (overridden.has(key)) throw conflictError('duplicate-override', key);
      // An override claims its key outright, whether or not a base has resolved yet.
      registry.set(key, value);
      overridden.add(key);
      continue;
    }
    if (based.has(key)) throw conflictError('duplicate-base', key);
    based.add(key);
    // A base fills its key only when no override has already claimed it; else it yields.
    if (!overridden.has(key)) registry.set(key, value);
  }
  return registry;
};
