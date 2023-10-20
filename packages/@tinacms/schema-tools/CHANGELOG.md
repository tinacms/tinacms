# @tinacms/schema-tools

## 1.4.13

### Patch Changes

- 6861b5e01: Fix bug where match property was not working on windows
- aec44a7dc: Allow backend/client to include partial queries

## 1.4.12

### Patch Changes

- 7e4de0b2a: Improvements to error handling with auth
- 099bf5646: Make router optionally async
- c92de7b1d: fix: Fix matches regression where matches on collections wouldn't match proper collection

## 1.4.11

### Patch Changes

- 1563ce5b2: Update the router function to work asynchronously. This means that a user can now fetch data or perform other async operations in the router function.

  Example:

  ```ts
   router: async ({ document }) => {
    const res = await client.queries.post({
      relativePath: document._sys.relativePath,
    })
    return `/posts/${res.data.slug}`
  },
  ```

## 1.4.10

### Patch Changes

- 133e97d5b: Update the before submit types to not pass the finalForm form since it is contained in the TinaForm
- f02b4368b: Adds a second parameter to the slugify function that passes the current collection and template.
- 7991e097e: Add a `beforeSubmit` hook function on a collection.ui. This give users the ability to run a function before the form is submitted.

  If the function returns values those values will be used will be submitted instead of the form values.

  If the function returns a falsy value the original form values will be submitted.

  ### Example

  ```js
  // tina/config.{ts.js}

  export default defineConfig({
    schema: {
      collections: [
        {
          ui: {
            // Example of beforeSubmit
            beforeSubmit: async ({ values }) => {
              return {
                ...values,
                lastUpdated: new Date().toISOString(),
              }
            },
            //...
          },
          //...
        },
        //...
      ],
    },
    //...
  })
  ```

## 1.4.9

### Patch Changes

- bc812441b: Use .mjs extension for ES modules

## 1.4.8

### Patch Changes

- 019920a35: Make clientId, branch and token optional in the config.

## 1.4.7

### Patch Changes

- fe13b4ed9: Fix search index tokenizer regex to not treat underscores as token separators

## 1.4.6

### Patch Changes

- a94e123b6: Fix optional config validation for search

## 1.4.5

### Patch Changes

- c385b5615: Initial implementation of search functionality

## 1.4.4

### Patch Changes

- beb179279: Add support for sites deployed to sub-paths. To enabled, provide the sub-path at config.build.basePath:

  ```ts
    ...
    build: {
      outputFolder: 'admin',
      publicFolder: 'public',
      basePath: 'my-site', // site is served at my-domain.com/my-site
    },
    ...
  ```

## 1.4.3

### Patch Changes

- f14f59a96: Handle `path: "/"` in a collection
- eeedcfd30: Adds folder support in the admin. See [this PR](https://github.com/tinacms/tinacms/pull/3750) for more info and a demo.

## 1.4.2

### Patch Changes

- a70204500: feat: Configurable template key on blocks

## 1.4.1

### Patch Changes

- 9a8074889: Consolidate payload transform logic
- c48326846: Move --skipSDK into config property: `client.skip = true`

## 1.4.0

### Minor Changes

- 76c984bcc: Use new API endpoint in content api reqests

### Patch Changes

- 5809796cf: Adds match property to collection
- 54aac9017: Support more forgiving markdown parser for non-MDX collections. Previously, this feature was only available by opting in
  with the `parser: {type: "markdown"}` configuration on a rich-text field. Now, all `rich-text` fields will adhere to the
  appropriate parser based on their collection format, but can continue to be overridden manually.

## 1.3.4

### Patch Changes

- d1cf65999: Adds list support to image field, improved field UI

## 1.3.3

### Patch Changes

- 0a5297800: feat: Allow adding aliases in field configs, to export special characters like names with dashes, or fields named "id"
- 7a3e86ba1: fix: templates regression
- 353899de1: Deprecate and reconfigure internal types. Most user-facing types should remain unchanged aside from a couple of bug fixes:

  - Fix missing `indexed` and `indexes` properties on `collection` and `field` configs.

  Deprecations

  ```
  CollectionFieldsWithNamespace
  CollectionTemplates
  CollectionTemplatesWithNamespace
  GlobalTemplate
  ObjectType
  ReferenceType
  ReferenceTypeInner
  ReferenceTypeWithNamespace
  RichTextType
  RichTypeWithNamespace
  TinaCloudCollection
  TinaCloudCollectionBase
  TinaCloudCollectionEnriched
  TinaCloudSchema
  TinaCloudSchemaBase
  TinaCloudSchemaConfig
  TinaCloudSchemaEnriched
  TinaCloudSchemaWithNamespace
  TinaCloudTemplateBase
  TinaCloudTemplateEnriched
  TinaFieldBase
  TinaFieldEnriched
  TinaFieldInner
  TinaTemplate
  ```

  Removals

  ```
  Templatable
  TinaIndex
  ResolveFormArgs
  ```

- 01b858e41: Better error message on the name field

## 1.3.2

### Patch Changes

- 892b4e39e: Fix issue where return type for `ui.validate` was incorrect
- c97ffc20d: Add schema checks to ensure the local and server schema are the same.

## 1.3.1

### Patch Changes

- e732906b6: Support .yml file extension for yaml files

## 1.3.0

### Minor Changes

- efd56e769: Replace Store with AbstractLevel in Database. Update CLI to allow user to configure Database.

### Patch Changes

- efd56e769: Remove license headers

## 1.2.1

### Patch Changes

- 84fe97ca7: Fix issue where deeply nested template objects inside field objects weren't transformed on save properly
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

## 1.2.0

### Minor Changes

- 3165f397d: fix: Shortcodes need to be specified by name to match with match-start / match-end

### Patch Changes

- 7d41435df: added ability to use toml in markdown frontmatter
- b2952a298: Adds meta wrapper for list-type fields that displays errors. Adds optional min/max for list-type fields that controls add/remove UI. Removes duplicate label from group field.

## 1.1.0

### Minor Changes

- 7554ea362: Adds hidden and button toggle fields, Improves toggle, radio, checkbox, select, textarea, and list field styles, Fixes block field UI, adds ability to set label to false on any field.

### Patch Changes

- 4ebc44068: Add a migration tool for forestry users

## 1.0.3

### Patch Changes

- 7495f032b: Added `onLogout` hook function and a logout redirect page in the admin
- de37c9eff: Content is now merged with existing content. This means if you have a field that is not defined in the schema it will not be overridden.

## 1.0.2

### Patch Changes

- c91bc0fc9: Tweak CLI styling for create-tina-app, tinacms dev, and tinacms init
- c1ac4bf10: Added a `onLogin` Callback function that is called when the user logs in.

  EX:

  ```ts
  import { defineConfig } from 'tinacms'

  export default defineConfig({
    admin: {
      auth: {
        onLogin: () => {
          console.log('On Log in!')
        },
      },
    },
    /// ...
  })
  ```

## 1.0.1

### Patch Changes

- 08e02ec21: Add types for allowedActions in the config

## 1.0.0

### Major Changes

- 958d10c82: Tina 1.0 Release

  Make sure you have updated to th "iframe" path: https://tina.io/blog/upgrading-to-iframe/

## 0.2.2

### Patch Changes

- a5d6722c7: Adds the ability to hide the delete and create buttons.

  EX,

  ```ts
  export default defineConfig({
    collections: [
      {
        label: 'Global',
        name: 'global',
        path: 'content/global',
        ui: {
          global: true,
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        format: 'json',
        fields: [
          //...
        ],
      },
    ],
  })
  ```

## 0.2.1

### Patch Changes

- 6c93834a2: Update config and schema types

## 0.2.0

### Minor Changes

- 774abcf9c: - `staticConfig` becomes `defineConfig`
  - `defineConfig` becomes `defineLegacyConfig`
  - Deprecate `config` property in the schema

### Patch Changes

- 245a65dfe: Fix issue saving deeply nested objects in visual mode

## 0.1.9

### Patch Changes

- c4f9607ce: Add validation to schema

## 0.1.8

### Patch Changes

- 005e1d699: update itemProps types

## 0.1.7

### Patch Changes

- b1a357f60: Update object field types to include `defaultItem`

## 0.1.6

### Patch Changes

- c6e3bd321: Fix issue where slugify function breaks templates

## 0.1.5

### Patch Changes

- 183249b11: - deprecate: `defaultValue`
  - add `defaultItem` to the collection (as a function or an object)
  ```ts
  defaultItem: () => {
    const m = new Date()
    return {
      title: 'New Page',
      test: 'This is a default value of the test field',
      filename: `new-page-${
        m.getUTCFullYear() +
        '-' +
        (m.getUTCMonth() + 1) +
        '-' +
        m.getUTCDate()
      }`,
    }
  },
  ```
  - Allow `datetime` field to be undefined or empty
- 8060d0949: Provide filename customization API.

  ```ts
  name: 'posts',
  path: 'content/posts',
  ui: {
       filename: {
          slugify: (values) => mySlugifyFunc(values),
          disabled: true
          // other field props like `label`, `component`, `parse` can still be used too
        }
  },
  ```

  If one is using `isTitle` a default slugify function is added that slugifys the title.

## 0.1.4

### Patch Changes

- f581f263d: Add --static option for `tina init`
- 7ae1b0697: Remove duplicate TinaSchema class
- f3439ea35: Replace loading message and hide forms while loading.
- 48032e2ba: Use tinaio url config override in the client

## 0.1.3

### Patch Changes

- 9183157c4: This allows us to use a leaner `define` function for the standalone config. Right now we're balancing a lot on the `defineSchema/defineConfig` types and have a few overlapping things like `client`, which accepts both an optional object with `referenceDepth` config as well as the autogenerated http client.

  One thing it does that's a bit different is it uses the `apiUrl` from the client generation function and sends it through as a global constant to the Vite app, this avoids the need for the generated `client`.

- 4adf12619: Add support for experimental iframe mode
- f8b89379c: Fixed an issue with windows paths not working.

## 0.1.2

### Patch Changes

- 777b1e08a: add better error messages for duplicate values in zod

## 0.1.1

### Patch Changes

- 59ff1bb10: fix: fix collection fetching when paths overlap
- 232ae6d52: Added better checks for name field in schema
- fd4d8c8ff: Add `router` property on collections. This replaces the need for using the RouteMapper plugin.

  ```ts
  ...
    name: 'post',
    path: 'posts',
    ui: {
      router: ({ document }) => {
        // eg. post items can be previewed at posts/hello-world
        return `/posts/${document._sys.filename}`;
      },
    },
  ...
  ```

  Add `global` property on collections. This replaces the need for `formifyCallback` in most cases

  ```ts
  ...
    name: 'post',
    path: 'posts',
    ui: {
      global: true
    },
  ...
  ```

- 9e5da3103: Add router to default schema

## 0.1.0

### Minor Changes

- 7b0dda55e: Updates to the `rich-text` component as well the shape of the `rich-text` field response from the API

  - Adds support for isTitle on MDX elements
  - Fixes issues related to nested marks
  - Uses monaco editor for code blocks
  - Improves styling of nested list items
  - Improves handling of rich-text during reset
  - No longer errors on unrecognized JSX/html, instead falls back to print `No component provided for <compnonent name>`
  - No longer errors on markdown parsing errors, instead falls back to rendering markdown as a string, customizable via the TinaMarkdown component (invalid_markdown prop)
  - Prepares rich-text component for raw mode - where you can edit the raw markdown directly in the Tina form. This will be available in future release.

### Patch Changes

- 8183b638c: ## Adds a new "Static" build option.

  This new option will build tina into a static `index.html` file. This will allow someone to use tina without having react as a dependency.

  ### How to update

  1.  Add a `.tina/config.{js,ts,tsx,jsx}` with the default export of define config.

  ```ts
  // .tina/config.ts
  import schema from './schema'

  export default defineConfig({
    schema: schema,
    //.. Everything from define config in `schema.ts`
    //.. Everything from `schema.config`
  })
  ```

  2. Add Build config

  ```
  .tina/config.ts

  export default defineConfig({
     build: {
       outputFolder: "admin",
       publicFolder: "public",
    },
    //... other config
  })
  ```

  3. Go to `http://localhost:3000/admin/index.html` and view the admin

## 0.0.9

### Patch Changes

- 870a32f18: This PR adds the new generated client, a new build command and introduces a new path of working with tina.

  # How to upgrade

  ## Updates to schema.ts

  Instead of passing an ApiURL, now the clientId, branch and read only token (NEW) will all be configured in the schema. The local url will be used if the --local flag is passed.

  This will require a change to the schema and the scripts.

  ```diff
  // .tina/schema.ts

  + import { client } from "./__generated__/client";

  // ...

  const schema = defineSchema({
  +    config: {
  +        branch: "main",
  +        clientId: "***",
  +        token: "***",
      },
      collections: [
          // ...
      ]
  })

  // ...
  - const branch = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF
  - const clientId = 'YOUR-CLIENT-ID-HERE'
  - const apiURL =
  -   process.env.NODE_ENV == 'development'
  -     ? 'http://localhost:4001/graphql'
  -    : `https://content.tinajs.io/content/${clientId}/github/${branch}`
  export const tinaConfig = defineConfig({
  +  client,
  -  apiURl,
    schema,
    // ...
  })

  export default schema
  ```

  The token must be a wildcard token (`*`) and can be generated from the tina dashboard. [Read more hear](https://tina.io/docs/graphql/read-only-tokens/)

  ## Updates to scripts in package.json

  We now recommend separating the graphQL server into two separate processes (two separate terminals in development). The scripts should look like this:

  ```json
  {
    "scripts": {
      "dev": "tinacms build --local && next dev",
      "dev-server": "tinacms server:start",
      "build": "tinacms build && next build"
      // ... Other Scripts
    }
  }
  ```

  When developing, in the first terminal run `yarn dev-server` and then `yarn dev` in the second.

  The old `-c` subcommand can still be used. This will start the dev server and next dev process in the same terminal.

  ```json
  {
    "scripts": {
      "dev": "tinacms server:start \"tinacms build --local && next dev\"",
      "dev-server": "tinacms server:start",
      "build": "tinacms build && next build"
      // ... Other Scripts
    }
  }
  ```

  ## Updates to generated files

  We now recommend ignoring most of the generated files. This is because `client.ts` and `types.ts` will be generated in CI with `tinacms build`

  To remove them from your repository, run `git rm --cached .tina/__generated__/*` and then `yarn tinacms build` to update the generated files that need to stay.

- 660247b6b: Throw an error message when name contains spaces

## 0.0.8

### Patch Changes

- b0dfc6205: Fixed bug where objects where not being copied

## 0.0.7

### Patch Changes

- 7d87eb6b7: Add `loadCustomStore` to top schema config
- 67e291e56: Add support for ES modules
- ae23e9ad6: Remove unused deps from monorepo

## 0.0.6

### Patch Changes

- fb73fb355: Renames syncFolder to a mediaRoot when configuring Repo-Based Media

## 0.0.5

### Patch Changes

- f6cb634c2: Added an optional config key to the schema that will be used for tina cloud media store

## 0.0.4

### Patch Changes

- 6e2ed31a2: Added `isTitle` property to the schema that allows the title to be displayed in the CMS

## 0.0.3

### Patch Changes

- 921709a7e: Adds validation to the schema instead of only using typescript types

## 0.0.2

### Patch Changes

- abf25c673: The schema can now to used on the frontend (optional for now but will be the main path moving forward).

  ### How to migrate.

  If you gone though the `tinacms init` process there should be a file called `.tina/components/TinaProvider`. In that file you can import the schema from `schema.ts` and add it to the TinaCMS wrapper component.

  ```tsx
  import TinaCMS from 'tinacms'
  import schema, { tinaConfig } from '../schema.ts'

  // Importing the TinaProvider directly into your page will cause Tina to be added to the production bundle.
  // Instead, import the tina/provider/index default export to have it dynamially imported in edit-moode
  /**
   *
   * @private Do not import this directly, please import the dynamic provider instead
   */
  const TinaProvider = ({ children }) => {
    return (
      <TinaCMS {...tinaConfig} schema={schema}>
        {children}
      </TinaCMS>
    )
  }

  export default TinaProvider
  ```

- 801f39f62: Update types
- e8b0de1f7: Add `parentTypename` to fields to allow us to disambiguate between fields which have the same field names but different types. Example, an event from field name of `blocks.0.title` could belong to a `Cta` block or a `Hero` block, both of which have a `title` field.
