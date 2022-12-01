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

import * as yup from 'yup'
import { GraphQLError } from 'graphql'

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
) => {
  const accum: B[] = []
  if (!items) {
    return []
  }

  const reducePromises = async (previous: Promise<B>, endpoint: A) => {
    const prev = await previous
    // initial value will be undefined
    if (prev) {
      accum.push(prev)
    }

    return callback(endpoint, accum.length)
  }

  // @ts-ignore FIXME: this can be properly typed
  const result = await items.reduce(reducePromises, Promise.resolve())
  if (result) {
    // @ts-ignore FIXME: this can be properly typed
    accum.push(result)
  }

  return accum
}

export function assertShape<T extends unknown>(
  value: unknown,
  yupSchema: (args: typeof yup) => yup.AnySchema,
  errorMessage?: string
): asserts value is T {
  const shape = yupSchema(yup)
  try {
    shape.validateSync(value)
  } catch (e) {
    const message = errorMessage || `Failed to assertShape - ${e.message}`
    throw new GraphQLError(message, null, null, null, null, null, {
      stack: e.stack,
    })
  }
}

export const lastItem = (arr: (number | string)[]) => {
  return arr[arr.length - 1]
}
