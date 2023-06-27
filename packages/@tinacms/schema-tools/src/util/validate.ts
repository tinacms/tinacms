/**

*/

import * as yup from 'yup'
import type { AnySchema } from 'yup'

export function assertShape<T>(
  value: unknown,
  yupSchema: (args: typeof yup) => AnySchema,
  errorMessage?: string
): asserts value is T {
  const shape = yupSchema(yup)
  try {
    shape.validateSync(value)
  } catch (e) {
    const message = errorMessage || `Failed to assertShape - ${e.message}`
    throw new Error(message)
  }
}
