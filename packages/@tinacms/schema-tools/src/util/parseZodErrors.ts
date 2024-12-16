/**

*/

import type { ZodError } from 'zod'

export const parseZodError = ({ zodError }: { zodError: ZodError }) => {
  const errors = zodError.flatten((issue) => {
    const moreInfo: unknown[] = []
    if (issue.code === 'invalid_union') {
      issue.unionErrors.map((unionError) => {
        moreInfo.push(parseZodError({ zodError: unionError }))
      })
      // moreInfo.push(issue.unionErrors.map((x) => x.flatten()))
    }
    const errorMessage = `${
      issue?.message
    }\nAdditional information: \n\t- Error found at path ${issue.path.join(
      '.'
    )}\n`
    const errorMessages = [errorMessage, ...moreInfo]

    return {
      errors: errorMessages as string[],
    }
  })
  const formErrors = errors.formErrors.flatMap((x) => x.errors)

  const parsedErrors = [
    ...(errors.fieldErrors?.collections?.flatMap((x) => x.errors) || []),
    ...(errors.fieldErrors?.config?.flatMap((x) => x.errors) || []),
    ...formErrors,
  ]
  return parsedErrors
}
