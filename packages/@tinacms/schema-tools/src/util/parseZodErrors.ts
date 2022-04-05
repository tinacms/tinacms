import type { ZodError } from 'zod'

export const parseZodError = ({ zodError }: { zodError: ZodError }) => {
  const errors = zodError.flatten((issue) => {
    const moreInfo = []
    if (issue.code === 'invalid_union') {
      issue.unionErrors.map((unionError) => {
        moreInfo.push(parseZodError({ zodError: unionError }))
      })
      moreInfo.push(issue.unionErrors.map((x) => x.flatten()))
    }
    return {
      message: issue.message,
      code: issue.code || 'no code provided',
      path: issue.path.join('.'),
      moreInfo,
    }
  })

  return errors
}
