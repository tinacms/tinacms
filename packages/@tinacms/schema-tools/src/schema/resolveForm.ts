import { sequential } from '../util'
import { resolveField } from './resolveField'
import type { ResolveFormArgs } from '../types'

export const resolveForm = async ({
  collection,
  basename,
  template,
  schema,
}: ResolveFormArgs) => {
  return {
    id: basename,
    label: collection.label,
    name: basename,
    fields: await sequential(template.fields, async (field) => {
      return resolveField(field, schema)
    }),
  }
}
