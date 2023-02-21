/**

*/
import { TinaSchema } from '@tinacms/schema-tools'
import type { Schema } from '@tinacms/schema-tools/dist/types'
import type { Schema as SchemaWithNamespace } from '@tinacms/schema-tools'

// @ts-ignore File '...' is not under 'rootDir'
import packageJSON from '../../package.json'

export const createSchema = async ({
  schema,
  flags = [],
}: {
  schema: Schema | SchemaWithNamespace
  flags?: string[]
}) => {
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
    ...schema,
  })
}
