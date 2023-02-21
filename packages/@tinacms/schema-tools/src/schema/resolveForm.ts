/**

*/

import { resolveField } from './resolveField'
import type { ResolveFormArgs } from '../types/index'

/**
 *  Given a collection, basename, template and schema. This will transform the given information into a valid frontend form config
 */
export const resolveForm = ({
  collection,
  basename,
  template,
  schema,
}: ResolveFormArgs) => {
  return {
    id: basename,
    label: collection.label,
    name: basename,
    fields: template.fields.map((field) => {
      return resolveField(field, schema)
    }),
  }
}
