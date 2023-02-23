import type { FC } from 'react'

import { TinaSchema } from '../schema'
import { Config } from '../types'

/**
 * @deprecated use Config instead
 */
export type TinaCloudSchemaConfig<DeleteMe = undefined> = Config

export type { Config }

type UIField<F extends UIField = any, Shape = any> = {
  // name?: string
  label?: string
  description?: string
  // TODO type component
  component?: FC<any> | string | null
  // inlineComponent?: FC<any>
  parse?: (value: Shape, name: string, field: F) => any
  format?: (value: Shape, name: string, field: F) => any
  validate?(
    value: Shape,
    allValues: any,
    meta: any,
    field: UIField<F, Shape>
  ): string | object | undefined | void
  /**
   * @deprecated use `defaultItem` at the collection level instead
   */
  defaultValue?: Shape
}

export interface TinaCloudSchema<WithNamespace extends boolean = false> {
  collections: TinaCloudCollection<WithNamespace>[]
  /**
   * @deprecated use `defineConfig` in a config.{js,ts} file instead
   */
  config?: Config
}

type MaybeNamespace<WithNamespace extends boolean> = WithNamespace extends true
  ? { namespace: string[] }
  : {}

export type TinaCloudCollection<WithNamespace extends boolean> =
  | CollectionFields<WithNamespace>
  | CollectionTemplates<WithNamespace>

type FormatType = 'json' | 'md' | 'markdown' | 'mdx'

type Document = {
  _sys: {
    title?: string
    template: string
    breadcrumbs: string[]
    path: string
    basename: string
    relativePath: string
    filename: string
    extension: string
  }
}
export interface UICollection {
  /**
   * Customize the way filenames are generated during content creation
   */
  filename?: {
    /**
     * A callback which receives form values as an argument. The return value
     * here will be used as the filename (the extension is not necessary)
     *
     * eg:
     * ```ts
     * slugify: (values) => values.title.toLowerCase().split(" ").join("-")
     * ```
     */
    slugify?: (values: Record<string, any>) => string
    /**
     * When set to `true`, editors won't be able to modify the filename
     */
    readonly?: boolean
  }

  allowedActions?: {
    create?: boolean
    delete?: boolean
  }

  /**
   * Forms for this collection will be editable from the global sidebar rather than the form panel
   */
  global?: boolean | { icon?: any; layout: 'fullscreen' | 'popup' }
  /**
   * Provide the path that your document is viewable on your site
   *
   * eg:
   * ```ts
   * router: ({ document }) => {
   *   return `blog-posts/${document._sys.filename}`;
   * }
   * ```
   */
  router?: (args: {
    document: Document
    collection: TinaCloudCollection<true>
  }) => string | undefined
}

export type DefaultItem<ReturnType> = ReturnType | (() => ReturnType)

export type IndexType = {
  name: string
  fields: {
    name: string
  }[]
}

interface BaseCollection {
  label?: string
  name: string
  path: string
  defaultItem?: DefaultItem<Record<string, any>>
  indexes?: IndexType[]
  format?: FormatType
  /**
   * This format will be used to parse the markdown frontmatter
   */
  frontmatterFormat?: 'yaml' | 'toml' | 'json'
  /**
   * The delimiters used to parse the frontmatter.
   */
  frontmatterDelimiters?: [string, string] | string
  ui?: UICollection
  match?: string
}

export type TinaTemplate = Template<false>

export type CollectionTemplates<WithNamespace extends boolean> = {
  templates: Template<WithNamespace>[]
  fields?: undefined
} & BaseCollection &
  MaybeNamespace<WithNamespace>

export type CollectionFields<WithNamespace extends boolean> = {
  fields: TinaField<WithNamespace>[]
  templates?: undefined
} & BaseCollection &
  MaybeNamespace<WithNamespace>

export type TinaField<WithNamespace extends boolean = false> =
  | ScalarType<WithNamespace>
  | ObjectType<WithNamespace>
  | ReferenceType<WithNamespace>
  | RichTextType<WithNamespace>

export interface TinaFieldBase {
  name: string
  label?: string
  description?: string
  required?: boolean
  indexed?: boolean
  // list?: boolean
  /**
   * Any items passed to the UI field will be passed to the underlying field.
   * NOTE: only serializable values are supported, so functions like `validate`
   * will be ignored.
   */
  ui?: Record<string, any>
}

type ScalarType<WithNamespace extends boolean> = ScalarTypeInner &
  MaybeNamespace<WithNamespace>

export type Option =
  | string
  | {
      label?: string
      icon?: FC
      value: string
    }
type ScalarTypeInner = TinaFieldBase &
  TinaScalarField & {
    options?: Option[]
  }

type TinaScalarField =
  | StringField
  | BooleanField
  | DateTimeField
  | NumberField
  | ImageField

type StringField =
  | {
      type: 'string'
      isBody?: boolean
      list?: false
      isTitle?: boolean
      ui?: UIField<any, string>
    }
  | {
      type: 'string'
      isBody?: boolean
      list: true
      isTitle?: never
      ui?: UIField<any, string[]> & { defaultItem?: DefaultItem<string> }
    }

type BooleanField =
  | {
      type: 'boolean'
      list?: false
      ui?: object | UIField<any, boolean>
    }
  | {
      type: 'boolean'
      list: true
      ui?: object | UIField<any, boolean[]>
    }

type NumberField =
  | {
      type: 'number'
      list?: false
      ui?: object | UIField<any, number>
    }
  | {
      type: 'number'
      list: true
      ui?: object | UIField<any, number[]>
    }

type DateTimeField =
  | {
      type: 'datetime'
      dateFormat?: string
      timeFormat?: string
      list?: false
      ui?: object | UIField<any, string>
    }
  | {
      type: 'datetime'
      dateFormat?: string
      timeFormat?: string
      list: true
      ui?: object | UIField<any, string[]>
    }

type ImageField =
  | {
      type: 'image'
      list?: false
      ui?: object | UIField<any, string>
    }
  | {
      type: 'image'
      list: true
      ui?: object | UIField<any, string[]>
    }

export type RichTextType<WithNamespace extends boolean = false> =
  TinaFieldBase & {
    type: 'rich-text'
    isBody?: boolean
    list?: boolean
    parser?:
      | {
          type: 'markdown'
          skipEscaping?: 'all' | 'html' | 'none'
        }
      | { type: 'mdx' }
    templates?: RichTextTemplate<WithNamespace>[]
  } & MaybeNamespace<WithNamespace>

export type ReferenceType<WithNamespace extends boolean = false> =
  TinaFieldBase & {
    type: 'reference'
    list?: boolean
    collections: string[]
    ui?: UIField<any, string[]>
  } & MaybeNamespace<WithNamespace>

export type RichTextTemplate<WithNamespace extends boolean> =
  Template<WithNamespace> & {
    inline?: boolean
    match?: {
      start: string
      end: string
      name?: string
    }
  }
export type ObjectType<WithNamespace extends boolean> =
  | ObjectTemplates<WithNamespace>
  | ObjectFields<WithNamespace>

type ObjectTemplates<WithNamespace extends boolean> =
  ObjectTemplatesInner<WithNamespace> & MaybeNamespace<WithNamespace>

type ObjectTemplatesInner<WithNamespace extends boolean> =
  | ObjectTemplatesInnerWithList<WithNamespace>
  | ObjectTemplatesInnerWithoutList<WithNamespace>
interface ObjectTemplatesInnerWithList<WithNamespace extends boolean>
  extends ObjectTemplatesInnerBase<WithNamespace> {
  list?: true
  ui?:
    | object
    | ({
        // TODO: we could Type item based on fields or templates? (might be hard)
        itemProps?(item: Record<string, any>): {
          key?: string
          label?: string
        }
        defaultItem?: DefaultItem<Record<string, any>>
      } & UIField<any, string>)
}
interface ObjectTemplatesInnerWithoutList<WithNamespace extends boolean>
  extends ObjectTemplatesInnerBase<WithNamespace> {
  list?: false
  ui?: object | UIField<any, string>
}

interface ObjectTemplatesInnerBase<WithNamespace extends boolean>
  extends TinaFieldBase {
  type: 'object'
  visualSelector?: boolean
  required?: false
  list?: boolean
  templates: Template<WithNamespace>[]
  fields?: undefined
}

type ObjectFields<WithNamespace extends boolean> =
  InnerObjectFields<WithNamespace> & MaybeNamespace<WithNamespace>

interface InnerObjectFields<WithNamespace extends boolean>
  extends TinaFieldBase {
  type: 'object'
  visualSelector?: boolean
  required?: false
  ui?: UIField<any, Record<string, any>> & {
    itemProps?(item: Record<string, any>): {
      key?: string
      label?: string
    }
    defaultItem?: DefaultItem<Record<string, any>>
  }
  /**
   * fields can either be an array of Tina fields, or a reference to the fields
   * of a global template definition.
   *
   * You can only provide one of `fields` or `templates`, but not both.
   */
  fields: TinaField<WithNamespace>[]
  templates?: undefined
  list?: boolean
}

/**
 * Templates allow you to define an object as polymorphic
 */
export type Template<WithNamespace extends boolean = false> = {
  label?: string
  name: string
  ui?: object | (UIField<any, any> & { previewSrc: string })
  fields: TinaField<WithNamespace>[]
} & MaybeNamespace<WithNamespace>

// Builder types
export type CollectionTemplateableUnion = {
  namespace: string[]
  type: 'union'
  templates: Template<true>[]
}
export type CollectionTemplateableObject = {
  namespace: string[]
  type: 'object'
  visualSelector?: boolean
  ui?: UIField<any, Record<string, any>> & {
    itemProps?(item: Record<string, any>): {
      key?: string
      label?: string
    }
    defaultItem?: DefaultItem<Record<string, any>>
  }
  required?: false
  template: Template<true>
}
export type CollectionTemplateable =
  | CollectionTemplateableUnion
  | CollectionTemplateableObject

export type Collectable = Pick<
  TinaCloudCollection<true>,
  'namespace' | 'templates' | 'fields' | 'name'
> & { label?: string }
