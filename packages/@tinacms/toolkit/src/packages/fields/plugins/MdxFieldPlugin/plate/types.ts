/**

*/

import type { Field } from '../../../../forms'

export type MdxTemplate = {
  label: string
  key: string
  inline?: boolean
  name: string
  defaultItem?: {}
  fields: Field[]
}
