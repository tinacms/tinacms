/**



*/

import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import { Reference } from './../components/Reference'
import { parse } from './textFormat'

export const ReferenceField = wrapFieldsWithMeta(Reference)

export const ReferenceFieldPlugin = {
  name: 'reference',
  type: 'reference',
  Component: ReferenceField,
  parse,
}
