/**

*/

import { Option, UICollection } from './SchemaTypes'

/**
 * NOTE this is WIP - it's not being used but ideally
 * we can start to leverage it for the `defineStaticConfig`
 *
 * The current schema type defs are way more complex to be
 * user-facing. This schema also gets rid of stuff we didn't
 * get around to implementing like `templates: string` (which
 * were for global templates)
 *
 */

type FC<T> = (props: T) => unknown

type UIField<Type> = {
  label?: string
  description?: string
  // TODO type component
  component?: FC<any> | string | null
  parse?: (value: Type, name: string, field: Field) => any // This should be able to enforce return of Type
  format?: (value: Type, name: string, field: Field) => any // This should be able to enforce return of Type
  validate?(
    value: Type,
    allValues: any,
    meta: any
    // field: UIField<F, Shape>
  ): Type | undefined | void
  /**
   * @deprecated use `defaultItem` at the collection level instead
   */
  defaultValue?: Type
}

type FieldGeneric<Type> =
  | {
      required: true
      list: true
      ui?: UIField<Type[]>
    }
  | {
      required: true
      list?: false | undefined
      ui?: UIField<Type>
    }
  | {
      required?: false | undefined
      list: true
      ui?: UIField<Type[] | undefined>
    }
  | {
      required?: false | undefined
      list?: false | undefined
      ui?: UIField<Type | undefined>
    }

type BaseField<Type, Ui extends object = undefined> = {
  name: string
  label?: string
  description?: string
  ui?: Ui extends object ? UIField<Type> & Ui : UIField<Type>
} & FieldGeneric<Type>

type StringFieldBase = {
  type: 'string'
  /** Designate this field's value as the document title  */
  isTitle?: boolean
  options?: Option[]
} & BaseField<string>

type StringField = StringFieldBase & FieldGeneric<string>

type NumberField = {
  type: 'number'
} & BaseField<number>
type BooleanField = {
  type: 'boolean'
} & BaseField<boolean>
type DateTimeField = {
  type: 'datetime'
} & BaseField<string>
type ImageField = {
  type: 'image'
} & BaseField<string>
type ReferenceField = {
  type: 'reference'
  collections: string[]
} & BaseField<string> // TODO: Reference with `list: true` not yet supported
type RichTextField = {
  type: 'rich-text'
  /**
   * For markdown or MDX formats, this value will be
   * saved to the document body
   */
  isBody?: boolean
} & BaseField<object> &
  WithTemplates<true>
// FIXME: This produces `any` on the Type generic
type ObjectField = ({
  type: 'object'
} & BaseField<
  object,
  {
    itemProps?(item: Record<string, any>): {
      key?: string
      label?: string
    }
  }
>) &
  (WithFields | WithTemplates)

type Field =
  | StringField
  | NumberField
  | BooleanField
  | DateTimeField
  | ImageField
  | ReferenceField
  | RichTextField
  | ObjectField

type WithFields = {
  fields: Field[]
  templates?: never
}

type Template = {
  name: string
  label?: string
  fields: Field[]
  match?: {
    start: string
    end: string
    name?: string
  }
}

type WithTemplates<Optional extends boolean = false> = Optional extends true
  ? {
      templates?: Template[]
      fields?: never
    }
  : {
      templates: Template[]
      fields?: never
    }

type TinaCMSCollection = {
  label?: string
  name: string
  path: string
  format?: 'json' | 'md' | 'markdown' | 'mdx'
  match?: string
  ui?: UICollection
} & (WithTemplates | WithFields)

/**
 * @deprecated use TinaCMSSchema instead
 */
export type TinaCloudSchema = TinaCMSSchema

export type TinaCMSSchema = {
  collections: TinaCMSCollection[]
}

export {}
