// A branded (nominal) type: structurally still `T`, but TS treats `Brand<T, K>` as
// distinct, so a raw `T` can't be passed where the brand is expected. Use it to give
// a domain identifier its own type — so it can't be confused with a plain value or
// built from any `T` — paired with a smart-constructor that validates + applies the
// brand (see `toFieldAddress`). `__brand` is phantom: type-only, never exists at
// runtime.
export type Brand<T, K extends string> = T & { readonly __brand: K };
