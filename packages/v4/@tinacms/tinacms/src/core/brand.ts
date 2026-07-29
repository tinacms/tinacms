// A branded type. The structure is still `T`, but TypeScript treats `Brand<T, K>` as a
// different type. A plain `T` therefore cannot go where the brand is expected. Use it to
// give a domain identifier its own type, with a constructor that validates the value and
// applies the brand. Refer to `toFieldAddress`. The `__brand` member exists in the type
// only, and never at runtime.
export type Brand<T, K extends string> = T & { readonly __brand: K };
