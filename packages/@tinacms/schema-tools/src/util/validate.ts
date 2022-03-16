import * as yup from 'yup'

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
    throw new Error(message)
  }
}
