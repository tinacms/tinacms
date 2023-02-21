/**

*/

export const lastItem = (arr: (number | string)[]) => {
  if (typeof arr === 'undefined') {
    throw new Error('Can not call lastItem when arr is undefined')
  }
  return arr[arr.length - 1]
}
