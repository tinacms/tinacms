/**

*/

export function hasDuplicates<T = any>(array: T[] = []) {
  return new Set(array).size !== array.length
}

/**
 *
 * @param array
 * @returns False if the array is undefined or has no duplicates.
 */
export function findDuplicates<T = any>(
  array: T[] | undefined = []
): undefined | string {
  // get a list of unique duplicates in array
  const duplicates = [
    ...new Set(array.filter((item, index) => array.indexOf(item) !== index)),
  ].map((x) => `"${x}"`)
  if (duplicates.length) {
    return duplicates.join(', ')
  } else return undefined
}
