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
      //   console.log(e.issues)
      // TODO parse the ZodIssue to provide a better error
      //   e.errors.forEach((error) => {
      //     console.log({ error })
      //   })
    }
    throw e
  }
}
