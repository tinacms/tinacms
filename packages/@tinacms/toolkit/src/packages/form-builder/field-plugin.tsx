/**



*/

import { Field } from '../forms'
import { InputFieldType } from '../fields/plugins/wrapFieldWithMeta'

export interface FieldPlugin<ExtraFieldProps = {}, InputProps = {}> {
  __type: 'field'
  name: string
  Component: React.FC<InputFieldType<ExtraFieldProps, InputProps>>
  type?: string
  validate?(
    value: any,
    allValues: any,
    meta: any,
    field: Field
  ): string | object | undefined
  parse?: (value: any, name: string, field: Field) => any
  format?: (value: any, name: string, field: Field) => any
  defaultValue?: any
}

export type { InputFieldType } from '../fields/plugins/wrapFieldWithMeta'
