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

type BaseField<Type> = {
  name: string
  label?: string
  description?: string
} & FieldGeneric<Type>

type StringFieldBase = {
  type: 'string'
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
  isBody?: boolean
} & BaseField<object> &
  WithTemplates
// FIXME: This produces `any` on the Type generic
type ObjectField = ({
  type: 'object'
} & BaseField<object>) &
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
  }
}

type WithTemplates = {
  templates: Template[]
  fields?: never
}

type TinaCMSCollection = {
  label?: string
  name: string
  path: string
  format?: 'json' | 'md' | 'markdown' | 'mdx'
  match?: string
} & (WithTemplates | WithFields)

type TinaCMSSchema = {
  collections: TinaCMSCollection[]
}

export {}
