/**



*/

export type AnyField = Field & { [key: string]: any }
import { SchemaField } from '@tinacms/schema-tools'

export type Field = SchemaField

// export interface Field<F extends Field = AnyField> {
//   name: string
//   label?: string | boolean
//   description?: string
//   component: React.FC<any> | string | null
//   inlineComponent?: React.FC<any>
//   parse?: (value: any, name: string, field: F) => any
//   format?: (value: any, name: string, field: F) => any
//   validate?(
//     value: any,
//     allValues: any,
//     meta: any,
//     field: Field
//   ): string | object | undefined
//   defaultValue?: any
//   fields?: F[]
// }
