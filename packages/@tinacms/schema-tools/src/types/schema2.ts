/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { Option, UICollection } from './SchemaTypes'
import type { TinaSchema } from '../schema/TinaSchema'

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

type Namespace = { namespace: string[] }

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

type CommonField<Type, Ui extends object = undefined> = {
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
} & CommonField<string>

type StringField = StringFieldBase & FieldGeneric<string>

type NumberField = {
  type: 'number'
} & CommonField<number>
type BooleanField = {
  type: 'boolean'
} & CommonField<boolean>
type DateTimeField = {
  type: 'datetime'
} & CommonField<string>
type ImageField = {
  type: 'image'
} & CommonField<string>
type ReferenceField = {
  type: 'reference'
  collections: string[]
} & CommonField<string> // TODO: Reference with `list: true` not yet supported
type RichTextField = {
  type: 'rich-text'
  /**
   * For markdown or MDX formats, this value will be
   * saved to the document body
   */
  isBody?: boolean
} & CommonField<object> &
  WithTemplates<true>
// FIXME: This produces `any` on the Type generic
type ObjectField = ({
  type: 'object'
} & CommonField<
  object,
  {
    itemProps?(item: Record<string, any>): {
      key?: string
      label?: string
    }
  }
>) &
  (WithFields | WithTemplates)

type BaseField =
  | StringField
  | NumberField
  | BooleanField
  | DateTimeField
  | ImageField
  | ReferenceField
  | RichTextField
  | ObjectField

type Field<WithNamespace extends boolean = false> = WithNamespace extends true
  ? BaseField & Namespace
  : BaseField

type BaseWithFields = {
  fields: Field[]
  templates?: never
}

type WithFields<WithNamespace extends boolean = false> =
  WithNamespace extends true ? BaseWithFields & Namespace : BaseWithFields

export type BaseTemplate<WithNamespace extends boolean = false> = {
  name: string
  label?: string
  fields: Field<WithNamespace>[]
  match?: {
    start: string
    end: string
  }
}
type Template<WithNamespace extends boolean = false> =
  WithNamespace extends true ? BaseTemplate<true> & Namespace : BaseTemplate

type BaseWithTemplates<Optional extends boolean = false> = Optional extends true
  ? {
      name: string
      templates?: Template[]
      fields?: never
    }
  : {
      name: string
      templates: Template[]
      fields?: never
    }

type WithTemplates<
  Optional extends boolean = false,
  WithNamespace extends boolean = false
> = WithNamespace extends true
  ? BaseWithTemplates<Optional> & Namespace
  : BaseWithTemplates<Optional>

type BaseTinaCMSCollection<WithNamespace extends boolean = false> = {
  label?: string
  name: string
  path: string
  format?: 'json' | 'md' | 'markdown' | 'mdx'
  match?: string
  ui?: UICollection
} & (WithTemplates<true, WithNamespace> | WithFields<WithNamespace>)

export type TinaCMSCollection<WithNamespace extends boolean = false> =
  WithNamespace extends true
    ? BaseTinaCMSCollection<true> & Namespace
    : BaseTinaCMSCollection

export type BaseTinaCMSSchema<WithNamespace extends boolean = false> = {
  collections: TinaCMSCollection<WithNamespace>[]
}

export type TinaCMSSchemaInternal<WithNamespace extends boolean = false> =
  WithNamespace extends true
    ? BaseTinaCMSSchema<true> & Namespace
    : BaseTinaCMSSchema

/**
 * This is the schema
 */
export type TinaCMSSchema = TinaCMSSchemaInternal<false>

/** LEGACY TYPES */

/**
 * @deprecated use TinaCMSSchema instead
 */
export type TinaCloudSchemaEnriched = TinaCMSSchemaInternal<true>
export type TinaCloudSchema = TinaCMSSchema
export type TinaCloudSchemaBase = TinaCMSSchema
export type TinaCloudCollection<WithNamespace extends boolean = false> =
  TinaCMSCollection<WithNamespace>
export type Templateable = WithTemplates<true, true> | WithFields<true>
export type Collectable = Templateable
export type CollectionTemplateable =
  | { type: 'union'; templates: Template<true>[] }
  | { type: 'object'; template: WithFields<true> }
export type TinaFieldEnriched = Field<true>
export type TinaFieldInner<WithNamespace extends boolean = false> =
  Field<WithNamespace>
export type ReferenceTypeWithNamespace = ReferenceField & Namespace

export type ResolveFormArgs = {
  collection: TinaCloudCollection<true>
  basename: string
  template: WithFields<true>
  schema: TinaSchema
}

export {}
