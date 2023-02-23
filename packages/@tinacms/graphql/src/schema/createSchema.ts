/**

*/
import { TinaSchema, Schema } from '@tinacms/schema-tools'

import { validateSchema } from './validate'
// @ts-ignore File '...' is not under 'rootDir'
import packageJSON from '../../package.json'

export const createSchema = async ({
  schema,
  flags = [],
}: {
  schema: Schema
  flags?: string[]
}) => {
  const validSchema = await validateSchema(schema)
  const [major, minor, patch] = packageJSON.version.split('.')
  const meta = {}
  if (flags && flags.length > 0) {
    meta['flags'] = flags
  }
  return new TinaSchema({
    version: {
      fullVersion: packageJSON.version,
      major,
      minor,
      patch,
    },
    meta,
    ...validSchema,
  })
}
