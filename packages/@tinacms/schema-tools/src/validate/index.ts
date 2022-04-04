import { ZodError } from 'zod'
import { TinaCloudSchema } from '../types'
import { TinaCloudSchemaZod } from './schema'
export const validateSchema = ({
  config,
}: {
  config: TinaCloudSchema<false>
}) => {
  try {
    TinaCloudSchemaZod.parse(config)
  } catch (e) {
    if (e instanceof ZodError) {
      const errors = e.flatten((issue) => {
        const moreInfo = []
        if (issue.code === 'invalid_union') {
          // TODO: should probably change this to be a recursive function that iterates over the entire nested error object instead of just one level deep
          moreInfo.push(issue.unionErrors.map((x) => x.flatten()))
        }
        return {
          message: issue.message,
          code: issue.code || 'no code provided',
          path: issue.path.join('.'),
          moreInfo,
        }
      })
      console.error(
        '!!! Error when trying to validate `.tina/schema file`!!!,\n' +
          JSON.stringify(errors, null, 2)
      )
    }
    throw e
  }
}
