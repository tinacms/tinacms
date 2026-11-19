/**

*/

/**
 * Iterate through an array of promises sequentially, ensuring the order
 * is preserved.
 *
 * ```js
 * await sequential(templates, async (template) => {
 *   await doSomething(template)
 * })
 * ```
 */
export const sequential = async <A, B>(
  items: A[] | undefined,
  callback: (args: A, idx: number) => Promise<B>
): Promise<B[]> => {
  if (!items) {
    return [];
  }

  const accum: B[] = [];
  for (let i = 0; i < items.length; i++) {
    accum.push(await callback(items[i], i));
  }

  return accum;
};
