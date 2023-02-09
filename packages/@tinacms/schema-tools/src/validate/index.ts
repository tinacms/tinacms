/**

*/

import { ZodError } from 'zod'
import { Schema } from '../types'
import { TinaCloudSchema } from '../types/index'
import { parseZodError } from '../util/parseZodErrors'
import { TinaCloudSchemaZod } from './schema'

export { validateTinaCloudSchemaConfig } from './tinaCloudSchemaConfig'

export class TinaSchemaValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'TinaSchemaValidationError'
  }
}

export const validateSchema = ({
  schema,
}: {
  // TODO: deprecate TinaClouSchema
  schema: Schema | TinaCloudSchema<false>
}) => {
  try {
    TinaCloudSchemaZod.parse(schema)
  } catch (e) {
    if (e instanceof ZodError) {
      const errors = parseZodError({ zodError: e })
      throw new TinaSchemaValidationError(errors.join(', \n'))
    } else {
      throw new Error(e)
    }
  }
}
