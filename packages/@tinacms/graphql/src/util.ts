/**

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

export function assertShape<T>(
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

export const atob = (b64Encoded: string) => {
  return Buffer.from(b64Encoded, 'base64').toString()
}
export const btoa = (string: string) => {
  return Buffer.from(string).toString('base64')
}

export const lastItem = (arr: (number | string)[]) => {
  return arr[arr.length - 1]
}
