// TODO: Type
export function deepMerge(target: any, source: any): any {
  for (const key in source) {
    if (
      !source.hasOwnProperty(key) ||
      key === '__proto__' ||
      key === 'constructor'
    )
      continue;
    if (
      source[key] instanceof Object &&
      !Array.isArray(source[key]) &&
      target.hasOwnProperty(key)
    ) {
      // If both target and source have the same key and it's an object, merge them recursively
      target[key] = deepMerge(target[key], source[key]);
    } else if (Array.isArray(source[key]) && Array.isArray(target[key])) {
      // If both target and source have the same key and it's an array, concatenate them
      target[key] = [...new Set([...target[key], ...source[key]])]; // Merging arrays and removing duplicates
    } else if (Array.isArray(source[key])) {
      // If source has an array and target doesn't, use the source array
      target[key] = [...source[key]];
    } else {
      // Otherwise, take the value from the source
      target[key] = source[key];
    }
  }
  return target;
}

export async function sequential<A, B>(
  items: A[] | undefined,
  callback: (args: A, idx: number) => Promise<B>
): Promise<B[]> {
  if (!items) {
    return [];
  }

  const accum: B[] = [];
  for (let i = 0; i < items.length; i++) {
    accum.push(await callback(items[i], i));
  }

  return accum;
}
