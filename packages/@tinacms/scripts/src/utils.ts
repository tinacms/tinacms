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
) {
  const accum: B[] = [];
  if (!items) {
    return [];
  }

  const reducePromises = async (previous: Promise<B>, endpoint: A) => {
    const prev = await previous;
    // Initial value will be undefined
    if (prev) accum.push(prev);
    return callback(endpoint, accum.length);
  };

  // @ts-ignore FIXME: this can be properly typed
  const result = await items.reduce(reducePromises, Promise.resolve());
  if (result) {
    // @ts-ignore FIXME: this can be properly typed
    accum.push(result);
  }

  return accum;
}
