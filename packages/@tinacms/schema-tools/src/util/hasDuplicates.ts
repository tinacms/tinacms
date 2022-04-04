export function hasDuplicates<T = any>(array: T[]) {
  return new Set(array).size !== array.length
}
