import type { FC } from 'react'
import type React from 'react'

type Meta = {
  active?: boolean
  dirty?: boolean
  error?: any
}

type Component<Type, List> = (props: {
  field: TinaField & { namespace: string[] }
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
  meta: Meta
}) => any

export type UIField<Type, List extends boolean> = {
  max?: List extends true ? number : never
  min?: List extends true ? number : never
  /**
   * Override the label from parent object
   */
  label?: string
  /**
   * Override the description from parent object
   */
  description?: string
  /**
   * A React component which will be used in the Tina form. Be sure
   * to import React into the config file.
   *
   * Note: Any Tailwind classes provided here will be compiled as part
   * of the Tina stylesheet
   *
   * eg:
   * ```tsx
   *  component: (props) => {
   *    const { input, field } = props
   *    return (
   *      <div className="my-4">
   *        <label
   *          htmlFor={input.name}
   *          className="block text-sm font-medium"
   *        >
   *          {field.name}
   *        </label>
   *        <div className="mt-1">
   *          <input
   *            id={input.name}
   *            className="py-2 px-4 block"
   *            type="text"
   *            {...input}
   *          />
   *        </div>
   *      </div>
   *    )
   *  }
   * ```
   *
   * Note: If the form has already been registered with the cms, you
   * can provide it's name here (eg. `textarea`)
   */
  component?: Component<Type, List> | string | null
  /**
   * Optional: Prepare data for use in the component. This is useful
   * if you don't have access to the component directly
   */
  parse?: (
    value: List extends true ? Type[] : Type,
    name: string,
    field: Field
  ) => List extends true ? Type[] : Type
  /**
   * Optional: Prepare data for saving. This is useful
   * if you don't have access to the component directly
   */
  format?: (
    value: Type,
    name: string,
    field: Field
  ) => List extends true ? Type[] : Type
  /**
   * Optional: Return undefined when valid. Return a string or an object when there are errors.
   *
   * ```ts
   * validate: (value) => {
   *   if(value.length > 40){
   *      return 'Title cannot be more than 40 characters long'
   *   }
   * }
   * ```
   */
  validate?(
    value: List extends true ? Type[] : Type,
    allValues: { [key: string]: any },
    meta: Meta,
    field: UIField<Type, List>
  ): (List extends true ? Type[] : Type) | undefined | void
  /**
   * @deprecated use `defaultItem` at the collection level instead
   */
  defaultValue?: List extends true ? Type[] : Type
}

type FieldGeneric<
  Type,
  List extends boolean | undefined,
  ExtraFieldUIProps = {}
> = List extends true
  ? {
      list: true
      ui?: UIField<Type, true> & ExtraFieldUIProps
    }
  : List extends false
  ? {
      list?: false
      ui?: UIField<Type, false> & ExtraFieldUIProps
    }
  : {
      list?: undefined
      ui?: UIField<Type, false> & ExtraFieldUIProps
    }

export interface BaseField {
  label?: string | boolean
  required?: boolean
  indexed?: boolean
  name: string
  description?: string
}

export type StringField = (
  | FieldGeneric<string, undefined>
  | FieldGeneric<string, true>
  | FieldGeneric<string, false>
) &
  BaseField & {
    type: 'string'
    isTitle?: boolean
    isBody?: boolean
    options?: Option[]
  }

export type NumberField = (
  | FieldGeneric<number, undefined>
  | FieldGeneric<number, true>
  | FieldGeneric<number, false>
) &
  BaseField & {
    type: 'number'
  }

export type BooleanField = (
  | FieldGeneric<boolean, undefined>
  | FieldGeneric<boolean, true>
  | FieldGeneric<boolean, false>
) &
  BaseField & {
    type: 'boolean'
  }

type DateFormatProps = {
  /**
   * Customize the way the format is rendered
   * ```
   * dateFormat: 'YYYY MM DD'
   * ```
   */
  dateFormat?: string
  timeFormat?: string
}
export type DateTimeField = (
  | FieldGeneric<string, undefined, DateFormatProps>
  | FieldGeneric<string, true, DateFormatProps>
  | FieldGeneric<string, false, DateFormatProps>
) &
  BaseField & {
    type: 'datetime'
  }

export type ImageField = (
  | FieldGeneric<string, undefined>
  | FieldGeneric<string, true>
  | FieldGeneric<string, false>
) &
  BaseField & {
    type: 'image'
  }

export type ReferenceField = (
  | FieldGeneric<string, undefined>
  | FieldGeneric<string, false>
) &
  BaseField & {
    type: 'reference'
    /**
     * The names of the collections this field can use as a reference
     * ```ts
     * {
     *   type: 'reference',
     *   name: 'author',
     *   collections: ['author'],
     * }
     * ```
     */
    collections: string[]
  }

type RichTextAst = { type: 'root'; children: Record<string, unknown>[] }
export type RichTextField<WithNamespace extends boolean = false> = (
  | FieldGeneric<RichTextAst, undefined>
  | FieldGeneric<RichTextAst, false>
) &
  BaseField & {
    type: 'rich-text'
    /**
     * When using Markdown or MDX formats, this field's value
     * will be saved to the markdown body, while all other values
     * will be stored as frontmatter
     */
    isBody?: boolean
    templates?: RichTextTemplate<WithNamespace>[]
    /**
     * By default, Tina parses markdown with MDX, this is a more strict parser
     * that allows you to use structured content inside markdown (via `templates`).
     *
     * Specify `"markdown"` if you're having problems with Tina parsing your content.
     */
    parser?:
      | {
          type: 'markdown'
          /**
           * Tina will escape entities like `<` and `[` by default. You can choose to turn
           * off all escaping, or specify HTML, so `<div>` will not be turned into `\<div>`
           */
          skipEscaping?: 'all' | 'html' | 'none'
        }
      | { type: 'mdx' }
  }
export type RichTextTemplate<WithNamespace extends boolean> =
  Template<WithNamespace> & {
    inline?: boolean
    /**
     * If you have some custom shortcode logic in your markdown,
     * you can specify it in the 'match' property and Tina will
     * handle it as if it were a jsx element:
     *
     * ```
     * # This is my markdown, it uses some custom shortcode
     * syntax {{ myshortcode title="hello!" }}.
     *
     * {
     *   match: {
     *     start: "{{"
     *     end: "}}"
     *   }
     * }
     * ```
     */
    match?: {
      start: string
      end: string
      name?: string
    }
  }

type ObjectListUiProps = {
  /**
   * Override the properties passed to the field
   * component. This is mostly useful for controlling
   * the display value via callback on `itemProps.label`
   */
  itemProps?(item: Record<string, any>): {
    key?: string
    /**
     * Control the display value when object
     * items are shown in a compact list, eg:
     *
     * ```ts
     * itemProps: (values) => ({
     *   label: values?.title || 'Showcase Item',
     * }),
     * ```
     */
    label?: string
  }
  /**
   * The value will be used when a new object is inserted, eg:
   *
   * ```ts
   * {
   *   title: "My Headline",
   *   description: "Some description"
   * }
   * ```
   *
   * Note: when supplying a value for a `rich-text` field, you must supply
   * the the value as an object.
   * ```ts
   * {
   *   title: "My Headline",
   *   description: "Some description"
   *   // This is field a rich-text field
   *   body: {
   *     type: "root",
   *     children: [{
   *       type: "p",
   *       children: [{
   *         type: "text",
   *         value: "This is some placeholder text"
   *       }]
   *     }]
   *   }
   * }
   * ```
   *
   */
  defaultItem?: DefaultItem<Record<string, any>>
}

type ObjectUiProps = {
  visualSelector?: boolean
}

export type ObjectField<WithNamespace extends boolean = false> =
  | (
      | FieldGeneric<string, undefined, ObjectUiProps>
      | FieldGeneric<string, true, ObjectUiProps>
      | FieldGeneric<string, false, ObjectUiProps>
    ) &
      MaybeNamespace<WithNamespace> &
      BaseField &
      (
        | {
            type: 'object'
            fields: Field<WithNamespace>[]
            templates?: undefined
            ui?: Template['ui']
          }
        | {
            type: 'object'
            fields?: undefined
            templates: Template<WithNamespace>[]
          }
      )

type Field<WithNamespace extends boolean = false> = (
  | StringField
  | NumberField
  | BooleanField
  | DateTimeField
  | ImageField
  | ReferenceField
  | RichTextField<WithNamespace>
  | ObjectField<WithNamespace>
) &
  MaybeNamespace<WithNamespace>

export type TinaField<WithNamespace extends boolean = false> =
  Field<WithNamespace> & MaybeNamespace<WithNamespace>

type MaybeNamespace<WithNamespace extends boolean = false> =
  WithNamespace extends true ? { namespace: string[] } : {}

export type Template<WithNamespace extends boolean = false> = {
  label?: string | boolean
  name: string
  ui?: {
    /**
     * Override the properties passed to the field
     * component. This is mostly useful for controlling
     * the display value via callback on `itemProps.label`
     */
    itemProps?(item: Record<string, any>): {
      key?: string
      /**
       * Control the display value when object
       * items are shown in a compact list, eg:
       *
       * ```ts
       * itemProps: (values) => ({
       *   label: values?.title || 'Showcase Item',
       * }),
       * ```
       */
      label?: string | boolean // FIXME: this is reused is places that don't accept a boolean
    }
    defaultItem?: DefaultItem<Record<string, any>>
    /**
     * When used in relation to the `visualSelector`,
     * provide an image URL to be used as the preview
     * in the blocks selector menu
     */
    previewSrc?: string
  }
  fields: Field<WithNamespace>[]
} & MaybeNamespace<WithNamespace>

type TokenObject = {
  id_token: string
  access_token?: string
  refresh_token?: string
}

export interface Config<
  CMSCallback = undefined,
  FormifyCallback = undefined,
  DocumentCreatorCallback = undefined,
  Store = undefined
> {
  contentApiUrlOverride?: string
  admin?: {
    auth?: {
      /**
       * If you wish to use the local auth provider, set this to true
       *
       * This will take precedence over the customAuth option (if set to true)
       *
       **/
      useLocalAuth?: boolean
      /**
       * If you are using a custom auth provider, set this to true
       **/
      customAuth?: boolean
      /**
       *  Used for getting the token from the custom auth provider
       *
       * @returns {Promise<TokenObject | null>}
       **/
      getToken?: () => Promise<TokenObject | null>
      /**
       *  Used to logout from the custom auth provider
       *
       **/
      logout?: () => Promise<void>
      /**
       *  Used for getting the user from the custom auth provider. If this returns a truthy value, the user will be logged in and the CMS will be enabled.
       *
       *  If this returns a falsy value, the user will be logged out and the CMS will be disabled.
       *
       **/
      getUser?: () => Promise<any | null>
      /**
       * Used to authenticate the user with the custom auth provider. This is called when the user clicks the login button.
       *
       **/
      authenticate?: () => Promise<any | null>

      onLogin?: (args: { token: TokenObject }) => Promise<void>
      onLogout?: () => Promise<void>
    }
  }
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
  /**
   *
   * Tina supports serving content from a separate Git repo. To enable this during local development, point
   * this config at the root of the content repo.
   *
   * NOTE: Relative paths are fine to use here, but you should use an environment variable for this, as each developer on your team may have a different
   * location to the path.
   *
   * ```ts
   * localContentPath: process.env.REMOTE_ROOT_PATH // eg. '../../my-content-repo'
   * ```
   */
  localContentPath?: string
  /**
   * Tina is compiled as a single-page app and placed in the public directory
   * of your application.
   */
  build: {
    /**
     * The folder where your application stores assets, eg. `"public"`
     */
    publicFolder: string
    /**
     * The value specified here will determine the path when visiting the TinaCMS dashboard.
     *
     * Eg. `"admin"` will be viewable at `[your-development-url]/admin/index.html`
     *
     * Note that for most framworks you can omit the `index.html` portion, for Next.js see the [rewrites section](https://nextjs.org/docs/api-reference/next.config.js/rewrites)
     */
    outputFolder: string
    /**
     *
     *  the host option for the vite config. This is useful when trying to run tinacms dev in a docker container.
     *
     * See https://vitejs.dev/config/server-options.html#server-host for more details
     */
    host?: string | boolean
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
  /**
   * Used to override the default Tina Cloud API URL
   *
   * [mostly for internal use only]
   */
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

export interface Schema<WithNamespace extends boolean = false> {
  /**
   * Collections represent a type of content (EX, blog post, page, author, etc). We recommend using singular naming in a collection (Ex: use post and not posts).
   *
   * https://tina.io/docs/reference/collections/
   */
  collections: Collection<WithNamespace>[]
  /**
   * @deprecated use `defineConfig` in a config.{js,ts} file instead
   */
  config?: Config
}

export type Collection<WithNamespace extends boolean = false> =
  | FieldCollection<WithNamespace>
  | TemplateCollection<WithNamespace>

interface BaseCollection {
  label?: string
  name: string
  path: string
  indexes?: IndexType[]
  format?: 'json' | 'md' | 'markdown' | 'mdx' | 'yaml' | 'yml' | 'toml'
  ui?: UICollection
  /**
   * @deprecated - use `ui.defaultItem` on the each `template` instead
   */
  defaultItem?: DefaultItem<Record<string, any>>
  /**
   * This format will be used to parse the markdown frontmatter
   */
  frontmatterFormat?: 'yaml' | 'toml' | 'json'
  /**
   * The delimiters used to parse the frontmatter.
   */
  frontmatterDelimiters?: [string, string] | string
  match?: string
}

type TemplateCollection<WithNamespace extends boolean> = {
  /**
   * In most cases, just using fields is enough, however templates can be used when there are multiple variants of the same collection or object. For example in a "page" collection there might be a need for a marketing page template and a content page template, both under the collection "page".
   *
   * https://tina.io/docs/reference/templates/
   */
  templates: Template<WithNamespace>[]
  fields?: undefined
} & BaseCollection &
  MaybeNamespace<WithNamespace>

type FieldCollection<WithNamespace extends boolean> = {
  /**
   * Fields define the shape of the content and the user input.
   *
   * https://tina.io/docs/reference/fields/
   */
  fields: TinaField<WithNamespace>[]
  templates?: undefined
} & BaseCollection &
  MaybeNamespace<WithNamespace>

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
  /**
   * Determines whether or not this collection can accept new docments
   * or allow documents to be deleted from the CMS.
   */
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
    collection: Collection<true>
  }) => string | undefined
}

export type DefaultItem<ReturnType> = ReturnType | (() => ReturnType)

type IndexType = {
  name: string
  fields: {
    name: string
  }[]
}

export type Option =
  | string
  | {
      label?: string
      icon?: FC
      value: string
    }

export type UITemplate = {
  /**
   * Override the properties passed to the field
   * component. This is mostly useful for controlling
   * the display value via callback on `itemProps.label`
   */
  itemProps?(item: Record<string, any>): {
    key?: string
    /**
     * Control the display value when object
     * items are shown in a compact list, eg:
     *
     * ```ts
     * itemProps: (values) => ({
     *   label: values?.title || 'Showcase Item',
     * }),
     * ```
     */
    label?: string | boolean
  }
  defaultItem?: DefaultItem<Record<string, any>>
  /**
   * When used in relation to the `visualSelector`,
   * provide an image URL to be used as the preview
   * in the blocks selector menu
   */
  previewSrc?: string
}

export type CollectionTemplateableUnion = {
  namespace: string[]
  type: 'union'
  templates: Template<true>[]
}
export type CollectionTemplateableObject = {
  namespace: string[]
  type: 'object'
  visualSelector?: boolean
  ui?: UIField<any, any> & {
    itemProps?(item: Record<string, any>): {
      key?: string
      label?: string | boolean
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
  Collection<true>,
  'namespace' | 'templates' | 'fields' | 'name'
> & { label?: string | boolean }

/**
 * @deprecated use Config instead
 */
export type TinaCloudSchemaConfig<DeleteMe = undefined> = Config
/** @deprecated use Schema instead */
export type TinaCloudSchema<WithNamespace extends boolean = false> =
  Schema<WithNamespace>
/** @deprecated use Schema instead */
export type TinaCloudSchemaBase = TinaCloudSchema<false>
/** @deprecated use Schema instead */
export type TinaCloudSchemaEnriched = TinaCloudSchema<true>
/** @deprecated use Schema instead */
export type TinaCloudSchemaWithNamespace = TinaCloudSchema<true>
/** @deprecated use Collection instead */
export type TinaCloudCollection<WithNamespace extends boolean> =
  Collection<WithNamespace>
/** @deprecated use Collection instead */
export type TinaCloudCollectionBase = TinaCloudCollection<false>
/** @deprecated use Collection instead */
export type TinaCloudCollectionEnriched = TinaCloudCollection<true>
/** @deprecated use Template instead */
export type TinaTemplate = Template<false>
/** @deprecated use Template instead */
export type TinaCloudTemplateBase = Template<false>
/** @deprecated use Template instead */
export type TinaCloudTemplateEnriched = Template<true>
/** @deprecated use Collection instead */
export type CollectionFieldsWithNamespace = FieldCollection<true>
/** @deprecated use Collection instead */
export type CollectionTemplates = TemplateCollection<false>
/** @deprecated use Collection instead */
export type CollectionTemplatesWithNamespace = TemplateCollection<true>
/** @deprecated use Template instead */
export type GlobalTemplate = Template
/** @deprecated use TinaField instead */
export type TinaFieldBase = TinaField<false>
/** @deprecated use TinaField instead */
export type TinaFieldInner = TinaField<false>
/** @deprecated use TinaField instead */
export type TinaFieldEnriched = TinaField<true>
/** @deprecated use ObjectField instead */
export type ObjectType<WithNamespace extends boolean = false> =
  ObjectField<WithNamespace>
/** @deprecated use RichTextField instead */
export type RichTextType<WithNamespace extends boolean = false> =
  RichTextField<WithNamespace>
/** @deprecated use ReferenceField instead */
export type ReferenceType<WithNamespace extends boolean = false> =
  ReferenceField & MaybeNamespace<WithNamespace>
/** @deprecated use ReferenceField instead */
export type ReferenceTypeInner = ReferenceType<false>
/** @deprecated use ReferenceField instead */
export type ReferenceTypeWithNamespace = ReferenceType<true>
/** @deprecated use RichTextField instead */
export type RichTypeWithNamespace = RichTextField<true>
/** @deprecated use TinaField instead */
export type SchemaField<WithNamespace extends boolean = false> =
  TinaField<WithNamespace>
