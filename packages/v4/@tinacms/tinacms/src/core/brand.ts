export type Brand<T, K extends string> = T & { readonly __brand: K };
