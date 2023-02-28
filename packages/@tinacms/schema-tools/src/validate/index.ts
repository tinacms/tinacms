import { ZodError } from 'zod'
import type { Schema } from '../types/index'
import { parseZodError } from '../util/parseZodErrors'
import { TinaCloudSchemaZod } from './schema'

export { validateTinaCloudSchemaConfig } from './tinaCloudSchemaConfig'

export class TinaSchemaValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'TinaSchemaValidationError'
  }
}

export const validateSchema = ({ schema }: { schema: Schema }) => {
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
