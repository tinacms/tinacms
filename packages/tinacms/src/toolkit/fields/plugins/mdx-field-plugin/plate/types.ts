import type { Field } from '@toolkit/forms'

export type MdxTemplate = {
  label: string
  key: string
  inline?: boolean
  name: string
  defaultItem?: {}
  fields: Field[]
}
