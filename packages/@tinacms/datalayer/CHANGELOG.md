# tina-graphql

## 1.2.28

### Patch Changes

- Updated dependencies [8b8a6c96b]
  - @tinacms/graphql@1.4.28

## 1.2.27

### Patch Changes

- Updated dependencies [857414612]
- Updated dependencies [a58c5b12f]
- Updated dependencies [aec44a7dc]
  - @tinacms/graphql@1.4.27

## 1.2.26

### Patch Changes

- Updated dependencies [c244d963a]
- Updated dependencies [3b214ec6b]
- Updated dependencies [8bd85b15e]
  - @tinacms/graphql@1.4.26

## 1.2.25

### Patch Changes

- Updated dependencies [1144af060]
  - @tinacms/graphql@1.4.25

## 1.2.24

### Patch Changes

- @tinacms/graphql@1.4.24

## 1.2.23

### Patch Changes

- @tinacms/graphql@1.4.23

## 1.2.22

### Patch Changes

- bc812441b: Use .mjs extension for ES modules
- Updated dependencies [0d8a19632]
- Updated dependencies [bc812441b]
  - @tinacms/graphql@1.4.22

## 1.2.21

### Patch Changes

- Updated dependencies [94f353822]
  - @tinacms/graphql@1.4.21

## 1.2.20

### Patch Changes

- @tinacms/graphql@1.4.20

## 1.2.19

### Patch Changes

- Updated dependencies [495108725]
  - @tinacms/graphql@1.4.19

## 1.2.18

### Patch Changes

- Updated dependencies [e5e29ed58]
  - @tinacms/graphql@1.4.18

## 1.2.17

### Patch Changes

- @tinacms/graphql@1.4.17

## 1.2.16

### Patch Changes

- Updated dependencies [c385b5615]
- Updated dependencies [1c78bafc2]
  - @tinacms/graphql@1.4.16

## 1.2.15

### Patch Changes

- Updated dependencies [a94bf721b]
- Updated dependencies [52b1762e2]
  - @tinacms/graphql@1.4.15

## 1.2.14

### Patch Changes

- Updated dependencies [e731ab0c5]
  - @tinacms/graphql@1.4.14

## 1.2.13

### Patch Changes

- Updated dependencies [ca74add40]
- Updated dependencies [0f5557d23]
- Updated dependencies [ff4c1e0f4]
- Updated dependencies [6fefa56b0]
  - @tinacms/graphql@1.4.13

## 1.2.12

### Patch Changes

- @tinacms/graphql@1.4.12

## 1.2.11

### Patch Changes

- Updated dependencies [83b19fb8d]
- Updated dependencies [1c7998b7e]
  - @tinacms/graphql@1.4.11

## 1.2.10

### Patch Changes

- Updated dependencies [a402c8010]
  - @tinacms/graphql@1.4.10

## 1.2.9

### Patch Changes

- Updated dependencies [89dcad9d9]
- Updated dependencies [a0eb72ce0]
  - @tinacms/graphql@1.4.9

## 1.2.8

### Patch Changes

- Updated dependencies [f14f59a96]
- Updated dependencies [eeedcfd30]
- Updated dependencies [7d4be0e51]
  - @tinacms/graphql@1.4.8

## 1.2.7

### Patch Changes

- Updated dependencies [65d53d5b9]
- Updated dependencies [40d15644f]
- Updated dependencies [a6786cc73]
  - @tinacms/graphql@1.4.7

## 1.2.6

### Patch Changes

- Updated dependencies [75d5ed359]
  - @tinacms/graphql@1.4.6

## 1.2.5

### Patch Changes

- Updated dependencies [67c7a48b8]
  - @tinacms/graphql@1.4.5

## 1.2.4

### Patch Changes

- Updated dependencies [ae3abe927]
  - @tinacms/graphql@1.4.4

## 1.2.3

### Patch Changes

- Updated dependencies [40d908a79]
- Updated dependencies [02a555c39]
  - @tinacms/graphql@1.4.3

## 1.2.2

### Patch Changes

- Updated dependencies [af5c32eae]
- Updated dependencies [1f9f83718]
- Updated dependencies [a70204500]
  - @tinacms/graphql@1.4.2

## 1.2.1

### Patch Changes

- Updated dependencies [e9514656c]
- Updated dependencies [9a8074889]
- Updated dependencies [13b809ff5]
  - @tinacms/graphql@1.4.1

## 1.2.0

### Minor Changes

- 76c984bcc: Use new API endpoint in content api reqests
- 202cd714d: Internal updates to the CLI

### Patch Changes

- Updated dependencies [76c984bcc]
- Updated dependencies [5809796cf]
- Updated dependencies [e3b58c03e]
- Updated dependencies [0553035f5]
- Updated dependencies [202cd714d]
  - @tinacms/graphql@1.4.0

## 1.1.6

### Patch Changes

- @tinacms/graphql@1.3.5

## 1.1.5

### Patch Changes

- Updated dependencies [b095d06a9]
  - @tinacms/graphql@1.3.4

## 1.1.4

### Patch Changes

- f831dcf4f: security: update some deps
- Updated dependencies [0a5297800]
- Updated dependencies [5427d03c6]
  - @tinacms/graphql@1.3.3

## 1.1.3

### Patch Changes

- Updated dependencies [aa0250979]
  - @tinacms/graphql@1.3.2

## 1.1.2

### Patch Changes

- Updated dependencies [3bbb621cd]
  - @tinacms/graphql@1.3.1

## 1.1.1

### Patch Changes

- Updated dependencies [a8457798a]
- Updated dependencies [94b8bb6e0]
- Updated dependencies [e15d82c2e]
- Updated dependencies [e732906b6]
  - @tinacms/graphql@1.3.0

## 1.1.0

### Minor Changes

- efd56e769: Replace Store with AbstractLevel in Database. Update CLI to allow user to configure Database.

### Patch Changes

- efd56e769: Remove license headers
- Updated dependencies [efd56e769]
- Updated dependencies [efd56e769]
- Updated dependencies [50f86caed]
  - @tinacms/graphql@1.2.0

## 1.0.1

### Patch Changes

- e7c404bcf: Support remote path configuration for separate content repos

  Tina now supports serving content from a separate Git repo.

  ### Local development workflow

  To enable this during local development, point
  this config at the root of the content repo.

  > NOTE: Relative paths are fine to use here, but make sure it's relative to the `.tina/config` file

  ```ts
  localContentPath: process.env.REMOTE_ROOT_PATH // eg. '../../my-content-repo'
  ```

  ### Production workflow

  For production, your config should use the `clientId`, `branch`, and `token` values that are associated with your _content repo_.

## 1.0.0

### Major Changes

- 958d10c82: Tina 1.0 Release

  Make sure you have updated to th "iframe" path: https://tina.io/blog/upgrading-to-iframe/

## 0.2.4

### Patch Changes

- 0513ae416: Increase defualt file limit from 10 to 50

## 0.2.3

### Patch Changes

- 1fc0e339e: Fix issue where if a subfolder exists in a collection that matches a document, editing that document creates null commits

## 0.2.2

### Patch Changes

- dcbc57c86: update key generation to gracefully handle null / undefined field values by skipping indexing
- ae06f4a96: Fixed audit cmd to use datalayer

## 0.2.1

### Patch Changes

- cf0f531a1: limit db key values to 100 characters

## 0.2.0

### Minor Changes

- 4daf15b36: Updated matching logic to only return the correct extension.

  This means if you are using any other files besides `.md` the format must be provided in the schema.

  ```ts
  // .tina/schema.ts

  import { defineSchema } from 'tinacms'

  const schema = defineSchema({
    collections: [
      {
        name: 'page',
        path: 'content/page',
        label: 'Page',
        // Need to provide the format if the file being used (default is `.md`)
        format: 'mdx',
        fields: [
          //...
        ],
      },
    ],
  })
  //...

  export default schema
  ```

### Patch Changes

- b348f8b6b: Experimental isomorphic git bridge implementation

## 0.1.1

### Patch Changes

- a2906d6fe: Fix datetime filtering to handle both indexed and non-indexed queries
- 3e2d9e43a: Adds new GraphQL `deleteDocument` mutation and logic

## 0.1.0

### Minor Changes

- a87e1e6fa: Enable query filtering, pagination, sorting

### Patch Changes

- 8b3be903f: Escape index field separator in input strings
- b01f2e382: Fixed an issue where `0` as a numerical operand was being evaluated as falsy.

## 0.0.2

### Patch Changes

- b399c734c: Fixes support for collection.templates in graphql

## 0.0.1

### Patch Changes

- 80732bd97: Create a @tinacms/datalayer package which houses the logic for data management for the GraphQL API. This simplifies the @tinacms/graphql package and allows for a clearer separation.

## 0.59.1

### Patch Changes

- f46c6f987: Fix type definitions for schema metadata so they're optional

## 0.59.0

### Minor Changes

- 62bea7019: #2323: fix saving bold and italic text in rich-text editor

### Patch Changes

- bd4e1f802: Pin version number from @tinacms/graphql during schema compilation. This can be used to ensure the proper version is provided when working with Tina Cloud

## 0.58.2

### Patch Changes

- fffce3af8: Don't cache graphql schema during resolution, this was causing the schema to go stale, while updating the schema.gql, so GraphQL tooling thought the value was updated, but the server was still holding on to the cached version

## 0.58.1

### Patch Changes

- 4700d7ae4: Patch fix to ensure builds include latest dependencies

## 0.58.0

### Minor Changes

- fa7a0419f: Adds experimental support for a data layer between file-based content and the GraphQL API. This allows documents to be indexed so the CMS can behave more like a traditional CMS, with the ability enforce foreign reference constraints and filtering/pagination capabilities.

### Patch Changes

- eb5fbfac7: Ensure GraphQL resolve doesn't access "bridge" documents
- 47d126029: Fix support of objects in a list for MDX templates

## 0.57.2

### Patch Changes

- edb2f4011: Trim path property on collections during compilation

## 0.57.1

### Patch Changes

- 60729f60c: Adds a `reference` field

## 0.57.0

### Minor Changes

- ed277e3bd: Remove aws dependency and cache logic from GithubBridge
- d1ed404ba: Add support for auto-generated SDK for type-safe data fetching

### Patch Changes

- 138ceb8c4: Clean up dependencies
- 577d6a5ad: Adds collection arg back for generic queries as optional

## 0.56.1

### Patch Changes

- 4b7795612: Adds support for collection.templates to TinaAdmin

## 0.56.0

### Minor Changes

- b99baebf1: Add rich-text editor based on mdx, bump React dependency requirement to 16.14

### Patch Changes

- 891623c7c: Adds support for List and Update to TinaAdmin

## 0.55.2

### Patch Changes

- 9ecb392ca: Fix bug which would set markdown body to undefined when the payload was emptry"

## 0.55.1

### Patch Changes

- ff4446c8e: Adds `getDocumentFields()` query for use with Tina Admin
- 667c33e2a: Add support for rich-text field, update build script to work with unified packages, which are ESM-only

## 0.55.0

### Minor Changes

- f3bddeb4a: Added new warning messages for list UI that we do not support by default

### Patch Changes

- 2908f8176: Fixes an issue where nested reference fields weren't updated properly when their values changed.
- 5d83643b2: Adds create document mutations

## 0.54.3

### Patch Changes

- 9b27192fe: Build packages with new scripting, which includes preliminary support for ES modules.

## 0.54.2

### Patch Changes

- d94fec611: Improve exported types for defineSchema

## 0.54.1

### Patch Changes

- 4de977f63: Makes `DateFieldPlugin` timezone-friendly

## 0.54.0

### Minor Changes

- 7663e0f7f: Fixed windows issue where you could not save a file

## 0.53.0

### Minor Changes

- b4f5e973f: Update datetime field to expect and receive ISO string

## 0.52.2

### Patch Changes

- b4bbdda86: Better error messaging when no tina schema files are found

## 0.52.1

### Patch Changes

- b05c91c6: Remove console.log

## 0.52.0

### Minor Changes

- aa4507697: When working with a new document that queries for a reference, we were not properly building the path information required to update that reference, resulting in an error until the page was refreshed.

## 0.51.1

### Patch Changes

- 589c7806: Fix issue where the `isBody` field wasn't properly removing that value from frontmatter. Ensure that the field is not treating any differently for JSON format

## 0.51.0

### Minor Changes

- 5a934f6b: Fixed windows path issues

### Patch Changes

- 271a72d7: Use collection label (defined in schema.ts) as form label

## 0.50.2

### Patch Changes

- 0970961f: addPendingDocument was expecting params, which are not supported for new doc creation at this time

## 0.50.1

### Patch Changes

- 65b3e3a3: Uses checkbox-group field

## 0.50.0

### Minor Changes

- 7f3c8c1a: # 🔧 Changes coming to TinaCMS ⚙️

  👋 You may have noticed we've been hard at-work lately building out a more opinionated approach to TinaCMS. To that end, we've settled around a few key points we'd like to announce. To see the work in progress, check out the [main](https://github.com/tinacms/tinacms/tree/main) branch, which will become the primary branch soon.

  ## Consolidating @tinacms packages in to @tinacms/toolkit

  By nature, Tina relies heavily on React context, and the dependency mismatches from over-modularizing our toolkit has led to many bugs related to missing context. To fix this, we'll be consolidating nearly every package in the @tinacms scope to a single package called `@tinacms/toolkit`

  We'll also be rolling out esm support as it's now much easier to address build improvements

  ## A more focused tinacms package

  The `tinacms` package now comes baked-in with APIs for working with the TinaCMS GraphQL API. Because `@tinacms/toolkit` now encompasses everything you'd need to build your own CMS integration, we're repurposing the `tinacms` package to more accurately reflect the "batteries-included" approach.

  If you haven't been introduced, the GraphQL API is a Git-backed CMS which we'll be leaning into more in the future. With a generous free tier and direct syncing with Github its something we're really excited to push forward. Sign up for free here
  Note: tinacms still exports the same APIs, but we'll gradually start moving the backend-agnostic tools to @tinacms/toolkit.

  ## Consolidating the tina-graphql-gateway repo

  The tina-graphql-gateway repo will be absorbed into this one. If you've been working with our GraphQL APIs you'll need to follow our migration guide.

  ## Moving from Lerna to Yarn PNP

  We've had success with Yarn 2 and PNP in other monorepos, if you're a contributor you'll notice some updates to the DX, which should hopefully result in a smoother experience.

  ## FAQ

  ### What about other backends?

  The `@tinacms/toolkit` isn't going anywhere. And if you're using packages like `react-tinacms-strapi` or r`eact-tinacms-github` with success, that won't change much, they'll just be powered by `@tinacms/toolkit` under the hood.

  ### Do I need to do anything?

  We'll be bumping all packages to `0.50.0` to reflect the changes. If you're using @tincams scoped packages those won't receive the upgrade. Unscoped packages like `react-tinacms-editor` will be upgraded, and should be bumped to 0.50.0 as well.
  When we move to `1.0.0` we'll be pushing internal APIs to `@tinacms/toolkit`, so that's the long-term location of

  ### Will you continue to patch older versions?

  We'll continue to make security patches, however major bug fixes will likely not see any updates. Keep in mind that `@tinacms/toolkit` will continue to be developed.

## 0.2.0

### Minor Changes

- 7351d92f: # Define schema changes

  We're going to be leaning on a more _primitive_ concept of how types are defined with Tina, and in doing so will be introducing some breaking changes to the way schemas are defined. Read the detailed [RFC discussion](https://github.com/tinacms/rfcs/pull/18) for more on this topic, specifically the [latter portions](https://github.com/tinacms/rfcs/pull/18#issuecomment-805400313) of the discussion.

  ## Collections now accept a `fields` _or_ `templates` property

  You can now provide `fields` instead of `templates` for your collection, doing so will result in a more straightforward schema definition:

  ```js
  {
    collections: [
      {
        name: 'post',
        label: 'Post',
        path: 'content/posts',
        fields: [
          {
            name: 'title',
            label: 'Title',
            type: 'string', // read on below to learn more about _type_ changes
          },
        ],
        // defining `fields` and `templates` would result in a compilation error
      },
    ]
  }
  ```

  **Why?**

  Previously, a collection could define multiple templates, the ambiguity introduced with this feature meant that your documents needed a `_template` field on them so we'd know which one they belonged to. It also mean having to disambiguate your queries in graphql:

  ```graphql
  getPostDocument(relativePage: $relativePath) {
    data {
      ...on Article_Doc_Data {
        title
      }
    }
  }
  ```

  Going forward, if you use `fields` on a collection, you can omit the `_template` key and simplify your query:

  ```graphql
  getPostDocument(relativePage: $relativePath) {
    data {
      title
    }
  }
  ```

  ## `type` changes

  Types will look a little bit different, and are meant to reflect the lowest form of the shape they can represent. Moving forward, the `ui` field will represent the UI portion of what you might expect. For a blog post "description" field, you'd define it like this:

  ```js
  {
    type: "string",
    label: "Description",
    name: "description",
  }
  ```

  By default `string` will use the `text` field, but you can change that by specifying the `component`:

  ```js
  {
    type: "string",
    label: "Description",
    name: "description",
    ui: {
      component: "textarea"
    }
  }
  ```

  For the most part, the UI properties are added to the field and adhere to the existing capabilities of Tina's core [field plugins](https://tina.io/docs/fields/). But there's nothing stopping you from providing your own components -- just be sure to register those with the CMS object on the frontend:

  ```js
  {
    type: "string",
    label: "Description",
    name: "description",
    ui: {
      component: "myMapField"
      someAdditionalMapConfig: 'some-value'
    }
  }
  ```

  [Register](https://tina.io/docs/fields/custom-fields/#registering-the-plugin) your `myMapField` with Tina:

  ```js
  cms.fields.add({
    name: 'myMapField',
    Component: MapPicker,
  })
  ```

  ### One important gotcha

  Every property in the `defineSchema` API must be serlializable. Meaning functions will not work. For example, there's no way to define a `validate` or `parse` function at this level. However, you can either use the [formify](https://tina.io/docs/tina-cloud/client/#formify) API to get access to the Tina form, or provide your own logic by specifying a plugin of your choice:

  ```js
  {
    type: "string",
    label: "Description",
    name: "description",
    ui: {
      component: "myText"
    }
  }
  ```

  And then when you register the plugin, provide your custom logic here:

  ```js
  import { TextFieldPlugin } from 'tinacms'

  // ...

  cms.fields.add({
    ...TextFieldPlugin, // spread existing text plugin
    name: 'myText',
    validate: (value) => {
      someValidationLogic(value)
    },
  })
  ```

  **Why?**

  The reality is that under the hood this has made no difference to the backend, so we're removing it as a point of friction. Instead, `type` is the true definition of the field's _shape_, while `ui` can be used for customizing the look and behavior of the field's UI.

  ## Defensive coding in Tina

  When working with GraphQL, there are 2 reasons a property may not be present.

  1. The data is not a required property. That is to say, if I have a blog post document, and "category" is an optional field, we'll need to make sure we factor that into how we render our page:

  ```tsx
  const MyPage = (props) => {
    return (
      <>
        <h2>{props.getPostDocument.data.title}</h2>
        <MyCategoryComponent>
          {props.getPostDocument.data?.category}
        </MyCategoryComponent>
      </>
    )
  }
  ```

  2. The query did not ask for that field:

  ```graphql
  {
    getPostDocument {
      data {
        title
      }
    }
  }
  ```

  But with Tina, there's a 3rd scenario: the document may be in an invalid state. Meaning, we could mark the field as `required` _and_ query for the appropriate field, and _still_ not have the expected shape of data. Due to the contextual nature of Tina, it's very common to be in an intermediate state, where your data is incomplete simply because you're still working on it. Most APIs would throw an error when a document is in an invalid state. Or, more likely, you couldn't even request it.

  ## Undefined list fields will return `null`

  Previously an listable field which wasn't defined in the document was treated as an emptry array. So for example:

  ```md
  ---
  title: 'Hello, World'
  categories:
    - sports
    - movies
  ---
  ```

  The responsee would be `categories: ['sports', 'movies']`. If you omit the items, but kept the empty array:

  ```md
  ---
  title: 'Hello, World'
  categories: []
  ---
  ```

  The responsee would be `categories: []`. If you omit the field entirely:

  ```md
  ---
  title: 'Hello, World'
  ---
  ```

  The response will be `categories: null`. Previously this would have been `[]`, which was incorrect.

  ## For a listable item which is `required: true` you _must_ provide a `ui.defaultItem` property

  ### Why?

  It's possible for Tina's editing capabilities to introduce an invalid state during edits to list items. Imagine the scenario where you are iterating through an array of objects, and each object has a categories array on it we'd like to render:

  ```tsx
  const MyPage = (props) => {
    return props.blocks.map((block) => {
      return (
        <>
          <h2>{block.categories.split(',')}</h2>
        </>
      )
    })
  }
  ```

  For a new item, `categories` will be null, so we'll get an error. This only happens when you're editing your page with Tina, so it's not a production-facing issue.

  ## Every `type` can be a list

  Previously, we had a `list` field, which allowed you to supply a `field` property. Instead, _every_ primitive type can be represented as a list:

  ```js
  {
    type: "string",
    label: "Categories",
    name: "categories",
    list: true
  }
  ```

  Additionally, enumerable lists and selects are inferred from the `options` property. The following example is represented by a `select` field:

  ```js
  {
    type: "string",
    label: "Categories",
    name: "categories",
    options: ["fitness", "movies", "music"]
  }
  ```

  While this, is a `checkbox` field

  ```js
  {
    type: "string",
    label: "Categories",
    name: "categories"
    list: true,
    options: ["fitness", "movies", "music"]
  }
  ```

  > Note we may introduce an `enum` type, but haven't discussed it thoroughly

  ## Introducing the `object` type

  Tina currently represents the concept of an _object_ in two ways: a `group` (and `group-list`), which is a uniform collection of fields; and `blocks`, which is a polymporphic collection. Moving forward, we'll be introducing a more comporehensive type, which envelopes the behavior of both `group` and `blocks`, and since _every_ field can be a `list`, this also makes `group-list` redundant.

  > Note: we've previously assumed that `blocks` usage would _always_ be as an array. We'll be keeping that assumption with the `blocks` type for compatibility, but `object` will allow for non-array polymorphic objects.

  ### Defining an `object` type

  An `object` type takes either a `fields` _or_ `templates` property (just like the `collections` definition). If you supply `fields`, you'll end up with what is essentially a `group` item. And if you say `list: true`, you'll have what used to be a `group-list` definition.

  Likewise, if you supply a `templates` field and `list: true`, you'll get the same API as `blocks`. However you can also say `list: false` (or omit it entirely), and you'll have a polymorphic object which is _not_ an array.

  This is identical to the current `blocks` definition:

  ```js
  {
    type: "object",
    label: "Page Sections",
    name: "pageSections",
    list: true,
    templates: [{
      label: "Hero",
      name: "hero",
      fields: [{
        label: "Title",
        name: "title",
        type: "string"
      }]
    }]
  }
  ```

  And here is one for `group`:

  ```js
  {
    type: "object",
    label: "Hero",
    name: "hero",
    fields: [{
      label: "Title",
      name: "title",
      type: "string"
    }]
  }
  ```

  ## `dataJSON` field

  You can now request `dataJSON` for the entire data object as a single query key. This is great for more tedius queries like theme files where including each item in the result is cumbersome.

  > Note there is no typescript help for this feature for now

  ```graphql
  getThemeDocument(relativePath: $relativePath) {
    dataJSON
  }
  ```

  ```json
  {
    "getThemeDocument": {
      "dataJSON": {
        "every": "field",
        "in": {
          "the": "document"
        },
        "is": "returned"
      }
    }
  }
  ```

  ## Lists queries will now adhere to the GraphQL connection spec

  [Read the spec](https://relay.dev/graphql/connections.htm)

  Previously, lists would return a simple array of items:

  ```graphql
  {
    getPostsList {
      id
    }
  }
  ```

  Which would result in:

  ```json
  {
    "data": {
      "getPostsList": [
        {
          "id": "content/posts/voteForPedro.md"
        }
      ]
    }
  }
  ```

  In the new API, you'll need to step through `edges` & `nodes`:

  ```graphql
  {
    getPostsList {
      edges {
        node {
          id
        }
      }
    }
  }
  ```

  ```json
  {
    "data": {
      "getPostsList": {
        "edges": [
          {
            "node": {
              "id": "content/posts/voteForPedro.md"
            }
          }
        ]
      }
    }
  }
  ```

  **Why?**

  The GraphQL connection spec opens up a more future-proof structure, allowing us to put more information in to the _connection_ itself like how many results have been returned, and how to request the next page of data.

  Read [a detailed explanation](https://graphql.org/learn/pagination/) of how the connection spec provides a richer set of capabilities.

  > Note: sorting and filtering is still not supported for list queries.

  ## `_body` is no longer included by default

  There is instead an `isBody` boolean which can be added to any `string` field

  **Why?**

  Since markdown files sort of have an implicit "body" to them, we were automatically populating a field which represented the body of your markdown file. This wasn't that useful, and kind of annoying. Instead, just attach `isBody` to the field which you want to represent your markdown "body":

  ```js
  {
    collections: [{
      name: "post",
      label: "Post",
      path: "content/posts",
      fields: [
        {
          name: "title",
          label: "Title",
          type: "string"
        }
        {
          name: "myBody",
          label: "My Body",
          type: "string",
          component: 'textarea',
          isBody: true
        }
      ]
    }]
  }
  ```

  This would result in a form field called `My Body` getting saved to the body of your markdown file (if you're using markdown):

  ```md
  ---
  title: Hello, World!
  ---

  This is the body of the file, it's edited through the "My Body" field in your form.
  ```

  ## References now point to more than one collection.

  Instead of a `collection` property, you must now define a `collections` field, which is an array:

  ```js
  {
    type: "reference",
    label: "Author",
    name: "author",
    collections: ["author"]
  }
  ```

  ```graphql
  {
    getPostDocument(relativePath: "hello.md") {
      data {
        title
        author {
          ...on Author_Document {
            name
          }
          ...on Post_Document {
            title
          }
        }
      }
    }
  ```

  ## Other breaking changes

  ### The `template` field on polymorphic objects (formerly _blocks_) is now `_template`

  **Old API:**

  ```md
  ---
  ---

  myBlocks:

  - template: hero
    title: Hello

  ---
  ```

  **New API:**

  ```md
  ---
  ---

  myBlocks:

  - \_template: hero
    title: Hello

  ---
  ```

  ### `data` `__typename` values have changed

  They now include the proper namespace to prevent naming collisions and no longer require `_Doc_Data` suffix. All generated `__typename` properties are going to be slightly different. We weren't fully namespacing fields so it wasn't possible to guarantee that no collisions would occur. The pain felt here will likely be most seen when querying and filtering through blocks. This ensures the stability of this type in the future

  ```graphql
  {
    getPageDocument(relativePath: "home.md") {
      data {
        title
        myBlocks {
          ...on Page_Hero_Data {  # previously this would have been Hero_Data
            # ...
          }
        }
      }
    }
  ```

### Patch Changes

- fdb7724b: Fix stringify for json extensions
- d42e2bcf: Adds number, datetime, and boolean fields back into primitive field generators
- 5cd5ce76: - Improve types for ui field
  - Marks system fields as required so the user has a guarantee that they'll be there
  - Return null for listable fields which are null or undefined
  - Handle null values for reference fields better
- 8c425440: Remmove accidental additional of dataJSON in schema
- Updated dependencies [7351d92f]
  - tina-graphql-helpers@0.1.2

## 0.1.25

### Patch Changes

- 348ef1e5: Testing version bumps go into a PR

## 0.1.24

### Patch Changes

- b36de960: lruClearCache should just be clearCache for now

## 0.1.23

### Patch Changes

- Bump packages to reflect new changest capabilities
- Updated dependencies [undefined]
  - tina-graphql-helpers@0.1.1

## 0.1.22

### Patch Changes

- Updated dependencies [undefined]
  - tina-graphql-helpers@0.1.0

## 0.1.21

### Patch Changes

- Testin

## 0.1.20

### Patch Changes

- Testing

## 0.1.13

### Patch Changes

- Testing out changesets
