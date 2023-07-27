export type AnyField = Field & { [key: string]: any }

export interface Field<F extends Field = AnyField> {
  name: string
  label?: string | boolean
  description?: string
  component: React.FC<any> | string | null
  inlineComponent?: React.FC<any>
  parse?: (value: any, name: string, field: F) => any
  format?: (value: any, name: string, field: F) => any
  validate?(
    value: any,
    allValues: any,
    meta: any,
    field: Field
  ): string | object | undefined
  defaultValue?: any
  fields?: F[]
  /**
   * Focus events can come from outside of the component, this is not
   * a guarantee that the given field will receive focus since that functionality
   * needs to be built on a per-component basis.
   *
   * This is also a one-way stree. The "active field" for a given form isn't
   * necessarily updated when a user clicks on a new field. So you can have a
   * field which is marked as the active field, and have focus on another field
   */
  experimental_focusIntent?: boolean
}
