/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
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
