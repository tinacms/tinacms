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
import { UICollection, Option } from './SchemaTypes'
// import { TinaCMSSchema } from './schema2'
import type React from 'react'

type FC<Type, List> = (props: {
  field: SchemaField & { namespace: string[] }
  input: {
    /**
     * The full name of the field, for fields nested inside object
     * fields, this will be the full path:
     *
     * `myObject.0.title`
     */
    name: string
    onBlur: (event?: React.FocusEvent<Type>) => void
    /**
     * The value provided will be saved to the form so it
     * should match the configured type:
     *
     * `input.onChange('some string')`
     */
    onChange: (event: React.ChangeEvent<Type>) => void
    onFocus: (event?: React.FocusEvent<Type>) => void
    type?: string
    value: List extends true ? Type[] : Type
  }
  meta: {
    active?: boolean
    dirty?: boolean
    error?: any
  }
}) => any

type UIField<Type, List extends boolean> = {
  label?: string
  description?: string
  // TODO type component
  component?: FC<Type, List> | string | null
  parse?: (
    value: List extends true ? Type[] : Type,
    name: string,
    field: Field
  ) => List extends true ? Type[] : Type
  format?: (
    value: Type,
    name: string,
    field: Field
  ) => List extends true ? Type[] : Type
  validate?(
    value: Type,
    allValues: any,
    meta: any
    // field: UIField<F, Shape>
  ): Type | undefined | void
  /**
   * @deprecated use `defaultItem` at the collection level instead
   */
  defaultValue?: List extends true ? Type[] : Type
}
type FieldGeneric<Type, List extends boolean | undefined> = List extends true
  ? {
      list: true
      ui?: UIField<Type, true>
    }
  : List extends false
  ? {
      list: false
      ui?: UIField<Type, false>
    }
  : {
      list?: never
      ui?: UIField<Type, false>
    }

export interface BaseField {
  label?: string
  required?: boolean
  name: string
}

export type StringFieldBase = BaseField & {
  type: 'string'
  isTitle?: boolean
  options?: Option[]
}

export type StringField = (
  | FieldGeneric<string, undefined>
  | FieldGeneric<string, true>
  | FieldGeneric<string, false>
) &
  StringFieldBase

export interface NumberField extends BaseField {
  type: 'number'
}

export interface BooleanField extends BaseField {
  type: 'boolean'
}

export interface DateTimeField extends BaseField {
  type: 'datetime'
}

export interface ImageField extends BaseField {
  type: 'image'
}

export interface ReferenceField extends BaseField {
  type: 'reference'
}

export interface RichTextField extends BaseField {
  type: 'rich-text'
}

export interface ObjectField extends BaseField {
  type: 'object'
}

type Field = StringField
// | NumberField
// | BooleanField
// | DateTimeField
// | ImageField
// | ReferenceField
// | RichTextField
// | ObjectField

type SchemaField = Field

export type { SchemaField }

export interface Template {
  label?: string
  name: string
  fields: Field[]
}

export interface FieldCollection {
  label?: string
  name: string
  path: string
  format?: 'json' | 'md' | 'markdown' | 'mdx'
  ui?: UICollection
  templates?: never
  /**
   * Fields define the shape of the content and the user input.
   *
   * https://tina.io/docs/reference/fields/
   */
  fields: Field[]
}

export interface TemplateCollection {
  label?: string
  name: string
  path: string
  format?: 'json' | 'md' | 'markdown' | 'mdx'
  ui?: UICollection
  /**
   * In most cases, just using fields is enough, however templates can be used when there are multiple variants of the same collection or object. For example in a "page" collection there might be a need for a marketing page template and a content page template, both under the collection "page".
   *
   * https://tina.io/docs/reference/templates/
   */
  templates?: Template[]
  fields?: never
}

export interface Schema {
  /**
   * Collections represent a type of content (EX, blog post, page, author, etc). We recommend using singular naming in a collection (Ex: use post and not posts).
   *
   * https://tina.io/docs/reference/collections/
   */
  collections: (FieldCollection | TemplateCollection)[]
}

/**
 * Used with `defineStaticConfig`
 *
 * These are mostly similar types as whats in `schemaTypes`
 * but since those have gone through several iterations
 * they're pretty messy. These should act as the happy path
 * for iframe/standalone setups which we hope to eventually
 * make the default/only path for all Tina users.
 */
export interface Config<
  CMSCallback = undefined,
  FormifyCallback = undefined,
  DocumentCreatorCallback = undefined,
  Store = undefined
> {
  // schema: TinaCloudSchema<false>
  /**
   * The Schema is used to define the shape of the content.
   *
   * https://tina.io/docs/reference/schema/
   */
  schema: Schema
  /**
   * The base branch to pull content from. Note that this is ignored for local development
   */
  branch: string | null
  /**
   * Your clientId from  app.tina.io
   */
  clientId: string | null
  /**
   * Your read only token from app.tina.io
   */
  token: string | null
  /**
   * Configurations for the autogenerated GraphQL HTTP client
   */
  client?: {
    /**
     * Autogenerated queries will traverse references to a given depth
     * @default 2
     */
    referenceDepth?: number
  }
  build: {
    /**
     * The folder where your application stores assets, eg. `"public"`
     */
    publicFolder: string
    /**
     * TinaCMS is shipped as a single-page app, the value specified here will
     * determine the path when visiting the TinaCMS dashboard.
     *
     * Eg. `"admin"` will be viewable at `[your-development-url]/admin/index.html`
     */
    outputFolder: string
  }
  media?:
    | {
        /**
         * Load a media store like Cloudinary
         *
         * ```ts
         * loadCustomStore = async () => {
         *   const pack = await import("next-tinacms-cloudinary");
         *   return pack.TinaCloudCloudinaryMediaStore;
         * }
         * ```
         */
        loadCustomStore: () => Promise<Store>
        tina?: never
      }
    | {
        /**
         * Use Git-backed assets for media, these values will
         * [Learn more](https://tina.io/docs/reference/media/repo-based/)
         */
        tina: {
          /**
           * The folder where your application stores assets, eg. `"public"`
           */
          publicFolder: string
          /**
           * The root folder for media managed by Tina. For example, `"uploads"`
           * would store content in `"<my-public-folder>/uploads"`
           */
          mediaRoot: string
        }
        loadCustomStore?: never
      }
  tinaioConfig?: {
    assetsApiUrlOverride?: string // https://assets.tinajs.io
    frontendUrlOverride?: string // https://app.tina.io
    identityApiUrlOverride?: string // https://identity.tinajs.io
    contentApiUrlOverride?: string // https://content.tinajs.io
  }
  cmsCallback?: CMSCallback
  formifyCallback?: FormifyCallback
  documentCreatorCallback?: DocumentCreatorCallback
}
export type TinaCMSConfig<
  CMSCallback = undefined,
  FormifyCallback = undefined,
  DocumentCreatorCallback = undefined,
  Store = undefined
> = Config<CMSCallback, FormifyCallback, DocumentCreatorCallback, Store>

export {}
