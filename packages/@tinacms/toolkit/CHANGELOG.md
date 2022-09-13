# Change Log

## 0.57.4

### Patch Changes

- 4adf12619: Add support for experimental iframe mode
- f8b89379c: Fixed an issue with windows paths not working.

## 0.57.3

### Patch Changes

- 1dd9d01e2: Sets max height on image field to prevent it from getting too big
- 54dd48115: Improve sync event UI
- e650bc571: User interface for synchronization log event display

## 0.57.2

### Patch Changes

- 0ad8075aa: Errors are now blocking modals.

## 0.57.1

### Patch Changes

- b369d7238: Update dependencies to fix vulnerabilities in external packages.

## 0.57.0

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

  - @tinacms/sharedctx@0.1.2

## 0.56.37

### Patch Changes

- 028e10686: Adding sorting in the CMS

## 0.56.36

### Patch Changes

- 090a5b995: fixed issue where a dot would show up in the media store directory

## 0.56.35

### Patch Changes

- 67e291e56: Add support for ES modules
- 7a45e4e12: Added a media sync button that adds new media to tina-cloud. This button only appears when you are not in local mode and have the new media store enable
- ae23e9ad6: Remove unused deps from monorepo
- 489be9cb1: docs: Update media help link in sidebar
- Updated dependencies [67e291e56]
  - @tinacms/sharedctx@0.1.2

## 0.56.34

### Patch Changes

- ea9c190e8: Fix rich text field focus styles

## 0.56.33

### Patch Changes

- 2ef5a1f33: fix scale isssue, truncate form label to filename
- 7b77fe1b5: Add a default TinaMediaStore for repo-based media
- 99a13024d: Enables paging for local media manager
  - @tinacms/sharedctx@0.1.1

## 0.56.32

### Patch Changes

- 1f7d3ca3d: Use custom wrapper class for tailwind type plugin
- 6c17f0160: fix scale isssue, truncate form label to filename
- cceef726e: Fix login ui issue
  - @tinacms/sharedctx@0.1.1

## 0.56.31

### Patch Changes

- 999f0895a: Set font family on heading elements

## 0.56.30

### Patch Changes

- aaaa5bb09: Added pagination to the CMS

## 0.56.29

### Patch Changes

- 58a7a00f7: Replace field meta components, fix text wrapping
- 2cc206b1a: Improve mobile nav behaviour
- aaadefd2d: Improve group list ui, add edit icon

## 0.56.28

### Patch Changes

- a196198bd: Add ability to disable sidebar nav
- 57a4a3789: Persist sidebar state across browser reload
- ba1499029: Displays a helpful message in branch switcher when running locally

## 0.56.27

### Patch Changes

- d4f98d0fc: Add ability to set default sidebar open state, fix overlay position
- 7e2272442: Improve list field UI by using group list components

## 0.56.26

### Patch Changes

- f6f56bcc0: Remove old MDX editor component
- 59d33a74a: Fix issue where items of type "string" with list: true weren't sending the right event payload
- 8b7ee346a: - Display label instead of name for mdx dropdown af306fa
  - Fix issue where reset triggered chagnes to the wrong rich-text field 03f6191
  - Fix issue where null children in a code block threw an error e454bce
- acb38bf9f: fix overflow menu click bug with popover panel

## 0.56.25

### Patch Changes

- e90647da3: Fix issue where popover item onMouseDown wasn't triggering

## 0.56.24

### Patch Changes

- 41d666f9a: Styles list page overflow menu, removes unused prop

## 0.56.23

### Patch Changes

- 6a6f137ae: # Simplify GraphQL API

  ## `schema` must be supplied to the `<TinaCMS>` component

  Previously the `.tina/schema.ts` was only used by the Tina CLI to generate the GraphQL API. However it's now required as a prop to `<TinaCMS>`. This allows you to provide runtime logic in the `ui` property of field definitions. See the documentation on "Extending Tina" for examples.

  ## The GraphQL API has been simplified

  ### `get<collection name>` is now just the collection name

  ```graphql
  # old
  {
    getPostDocument(relativePath: $relativePath) { ... }
  }

  # new
  {
    post(relativePath: $relativePath) { ... }
  }
  ```

  ### `get<collection name>List` is now `<collection name>Connection`

  The use of the term `connection` is due to our adherence the the [relay cursor spec](https://relay.dev/graphql/connections.htm). We may offer a simplified list field in a future release

  ```graphql
  # old
  {
    getPostList { ... }
  }

  # new
  {
    postConnection { ... }
  }
  ```

  ### `getCollection` and `getCollections` are now `collection` and `collections`

  ```graphql
  # old
  {
    getCollection(collection: "post") {...}
  }
  {
    getCollections {...}
  }

  # new
  {
    collection(collection: "post") {...}
  }
  {
    collections {...}
  }
  ```

  ### No more `data` property

  The `data` property was previously where all field definitions could be found. This has been moved on level up:

  ```graphql
  # old
  {
    getPostDocument(relativePath: $relativePath) {
      data {
        title
      }
    }
  }

  # new
  {
    post(relativePath: $relativePath) {
      title
    }
  }
  ```

  #### The type for documents no longer includes "Document" at the end

  ```graphql
  # old
  {
    getPostDocument(relativePath: $relativePath) {
      data {
        author {
          ... on AuthorDocument {
            data {
              name
            }
          }
        }
      }
    }
  }

  # new
  {
    post(relativePath: $relativePath) {
      author {
        ... on Author {
          name
        }
      }
    }
  }
  ```

  ### Meta fields are now underscored

  Aside from `id`, other metadata is now underscored:

  ```graphql
  # old
  {
    getPostDocument(relativePath: $relativePath) {
      sys {
        relativePath
      }
      values
    }
  }

  # new
  {
    post(relativePath: $relativePath) {
      _sys {
        relativePath
      }
      _values
    }
  }
  ```

  ### `dataJSON` is gone

  This is identical to `_values`

  ### `form` is gone

  `form` was used internally to generate forms for the given document, however that's now handled by providing your `schema` to `<TinaCMS>`.

  ### `getDocumentList` is gone

  It's no longer possible to query all documents at once, you can query for collection documents via the `collection` query:

  ```graphql
  {
    collection {
      documents {
        edges {
          node {...}
        }
      }
    }
  }
  ```

## 0.56.22

### Patch Changes

- bf5fe0074: Improvement of select dropdown. Make arrow icon clickable

## 0.56.21

### Patch Changes

- d37562999: Export OverflowMenu

## 0.56.20

### Patch Changes

- 40afac061: updated @headlessui/react

## 0.56.19

### Patch Changes

- 6c517b5da: Improves branch switcher UI
- e81cf8867: Improve rich text input list styles
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

- 0e270d878: Use async function to get reference field options
- Updated dependencies [429d8e93e]
  - @tinacms/sharedctx@0.1.1

## 0.56.18

### Patch Changes

- e9a0c82cf: Updated sidebar nav component to allow scrolling if needed
- d4fdeaa9f: Fix console warning about a ref being passed to a function component
- ed85f2594: Update version of react-beautiful-dnd to silence red herrings in the console

  See https://github.com/atlassian/react-beautiful-dnd/issues/1108

- d86e515ba: Ensure `error` is a string before rendering it from field meta component. In situations where an object's sub-field was invalid, touching the sub-field would trigger this error to be an object at the parent, React throws an error when trying to render an object
- db0dab1d4: add spacing and link styles to rich text field

## 0.56.17

### Patch Changes

- 106549814: Add a CMS event for when a field's value changes. To listen for events:

  ```ts
  cms.events.subscribe(`forms:fields:onChange`, event => console.log(event))
  ```

  Add a CMS event for when a field is reset. To listen for form resets:

  ```ts
  cms.events.subscribe(`forms:reset`, event => console.log(event))
  ```

- 4923a2d66: Checks isAuthenticated() before making requests to the GraphQL client
- a07ff39bb: Fixed z index issue with nested forms

## 0.56.16

### Patch Changes

- ae1a5a58f: Sets `tina-admin` to default to `true`
- 5535a9970: Switches to using HashRouter for Admin
- 3ff1de06a: Upgrade to Tailwind 3
- 022ccd389: fix: allow multiword tags
- 24f8b057f: Handles errors better in the CMS
  - @tinacms/sharedctx@0.1.0

## 0.56.15

### Patch Changes

- 43c834565: Adds an activity indicator throughout Admin

## 0.56.14

### Patch Changes

- af9f6c2c2: Prevents hard navigation away from dirty forms
- 2e14cda5e: Add visual block selector as optional UI
- 3d4c52a19: Change the default for rich-text to use the newer version

## 0.56.13

### Patch Changes

- e41b709ce: Fix sidebar position

## 0.56.12

### Patch Changes

- 8c18edd5c: restore event handlers that were detached from most field types
- 0773f6486: Added filtering to add block menu
- d8cd60f65: Update rich-text editor with some
  - Use our own components instead of the out-of-the box ones from Plate
  - Fix handling focus and selection of block/inline embeds
  - Fixes inconsistencies with deleting and adding elements for uncollapsed collections
  - For links, instead of a window prompt to get the value, use a Tina form (like the image field)
  - Toolbar is now sticky so that it moves down the screen as you scroll
  - Support for quick action slash command to MDX elements
- 9e77273d2: use collection name as fallback for label
- 63a74aece: Fixes form header bug when there's no label

## 0.56.11

### Patch Changes

- 3bba1817d: Integrates Chrome Components with TinaAdmin
- 415c03d25: adds missing arrow icon to reference field, truncates text in select dropdown
  - @tinacms/sharedctx@0.1.0

## 0.56.10

### Patch Changes

- 37286858e: style: multiform header and list

## 0.56.9

### Patch Changes

- 8ad8f03fd: Select field now validates when required is true.
- 6a50a1368: Updates the look and feel of the Tina Sidebar
- Updated dependencies [792f47251]
  - @tinacms/sharedctx@0.1.0

## 0.56.8

### Patch Changes

- 7006b38ea: Fixed issue where one could not login with tina cloud because the model context was null

## 0.56.7

### Patch Changes

- e8ca82899: Passes id to FormWrapper now that id is required

## 0.56.6

### Patch Changes

- 60f939f34: Don't allow "tabbing" for rich-text. Tabs in markdown represent code blocks, so this isn't something we want to support.

  Fixes bug where "reset" wasn't working for rich text.

## 0.56.5

### Patch Changes

- ddf81a4fd: constrain width of simple branch selector dropdown
- 20260a82d: Prevents navigation into objects when parent form is invalid
- 0370147fb: Remove ability to tab in rich-text editing
- 3de8c6165: Enabled branch creation in branch switcher
- 2eaad97bf: Remove unused underline and strikethrough icons in rich text editor
- 5c070a83f: feat: Add UI banner for when in localMode

## 0.56.4

### Patch Changes

- 2c7718636: updated media link

## 0.56.3

### Patch Changes

- 4700d7ae4: Patch fix to ensure builds include latest dependencies

## 0.56.2

### Patch Changes

- bc4699d2b: Use inline style instead of missing tailwind classes"

## 0.56.1

### Patch Changes

- f6876d30f: Alter empty sidebar message to be more specific to auto-generating logic
- 92268fc85: Ensure "src" is used instead of "previewSrc" for images in MDX

## 0.56.0

### Minor Changes

- df3030990: Add basic branch switcher

## 0.55.4

### Patch Changes

- 60729f60c: Adds a `reference` field

## 0.55.3

### Patch Changes

- 138ceb8c4: Clean up dependencies
- 0417e3750: Adds RouteMapperPlugin and FormMetaPlugin
- d9f37ea7e: Ensure the full image resolution URL is persisted

## 0.55.2

### Patch Changes

- 2724c48c0: Fix issue where the rich-text editor didn't allow user input when the initial value was empty

## 0.55.1

### Patch Changes

- 9c0d48e09: Fix console errors for mdx editor

## 0.55.0

### Minor Changes

- b99baebf1: Add rich-text editor based on mdx, bump React dependency requirement to 16.14

## 0.54.1

### Patch Changes

- b961c7417: Adjust z-index for global menu so it sits overtop of nested form panels

## 0.54.0

### Minor Changes

- b59f23295: Fixed issue where heading button would not work in the WYSIWYG editor when using react 17
- a419056b6: Fixed component types for field plugins
- ded8dfbee: support visually linking fields to DOM elements using `data-tinafield`
- 5df9fe543: Export Blocks, Group List, List, HTML and Markdown fields so that they can be used in field plugins.
- 9d68b058f: Add support for multiple image upload in the Media Store.

### Patch Changes

- 9213d5608: Uses a better default dateFormat for the DateField
- 91cebe5bc: Prevents navigating away from a form while invalid

## 0.53.0

### Minor Changes

- 906d72c50: Add generics to CMS event methods to allow type hinting specific events

### Patch Changes

- 7b149a4e7: Tina toolkit sometimes uses the "path" module, which presumably was built-in with the previous build script logic. It's now listed explicitly as a package dependency

## 0.52.3

### Patch Changes

- 9b27192fe: Build packages with new scripting, which includes preliminary support for ES modules.

## 0.52.2

### Patch Changes

- 6b1cbf916: Updated NoFormsPlaceholder links

## 0.52.1

### Patch Changes

- 4de977f63: Makes `DateFieldPlugin` timezone-friendly

## 0.52.0

### Minor Changes

- b4f5e973f: Update datetime field to expect and receive ISO string

## 0.51.0

### Minor Changes

- 634524925: image accecpt now comes from the media store

## 0.50.1

### Patch Changes

- e074d555: fix: link to forms guide

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

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.43.0](https://github.com/tinacms/tinacms/compare/v0.42.1...v0.43.0) (2021-07-12)

### Features

- **tinacms:** customize list error message by throwing a MediaListError ([5aff1da](https://github.com/tinacms/tinacms/commit/5aff1da8e725ad4046bf1888fa83599c3ef0a4c5))

# [0.42.0](https://github.com/tinacms/tinacms/compare/v0.41.1...v0.42.0) (2021-06-28)

### Features

- **tinacms:** configure media mgr page size via mediaOptions.pageSize ([5d7890f](https://github.com/tinacms/tinacms/commit/5d7890f5312e5efa08a07cd7fc4e3967d71eccf3))
- **tinacms:** remove pluggable pagination ([846b516](https://github.com/tinacms/tinacms/commit/846b51621aa85520724817192f8d8ade19c1b02a))
- **tinacms:** use cursor-based pagination in media manager ([7a94b97](https://github.com/tinacms/tinacms/commit/7a94b97e228ffd490a68159d458130e089dd6c87))

## [0.41.1](https://github.com/tinacms/tinacms/compare/v0.41.0...v0.41.1) (2021-06-11)

**Note:** Version bump only for package tinacms

# [0.41.0](https://github.com/tinacms/tinacms/compare/v0.40.1...v0.41.0) (2021-05-17)

### Features

- **@tinacms/fields:** Adds date field to default plugins ([8ac27d1](https://github.com/tinacms/tinacms/commit/8ac27d12bcc488a73f75b214b718da111e185d28))

## [0.40.1](https://github.com/tinacms/tinacms/compare/v0.40.0...v0.40.1) (2021-05-05)

**Note:** Version bump only for package tinacms

# [0.40.0](https://github.com/tinacms/tinacms/compare/v0.39.0...v0.40.0) (2021-04-19)

**Note:** Version bump only for package tinacms

# [0.39.0](https://github.com/tinacms/tinacms/compare/v0.38.0...v0.39.0) (2021-03-30)

### Bug Fixes

- copyright ([e4323c2](https://github.com/tinacms/tinacms/commit/e4323c25b7e893005bffad1827018b523b7f6939)), closes [#1778](https://github.com/tinacms/tinacms/issues/1778)
- **tinacms:** Fixes pagination for MediaStore ([5e51cbe](https://github.com/tinacms/tinacms/commit/5e51cbe9086df2540453295c86bb12575574a2ad))

### Features

- **tinacms:** export independent components for CMS provider and UI ([c8bd31e](https://github.com/tinacms/tinacms/commit/c8bd31efdd5966af0dffa3d36e3618cf6ea3e02a))

# [0.38.0](https://github.com/tinacms/tinacms/compare/v0.37.0...v0.38.0) (2021-03-08)

**Note:** Version bump only for package tinacms

# [0.37.0](https://github.com/tinacms/tinacms/compare/v0.36.1...v0.37.0) (2021-02-08)

### Features

- radio group field ([7b53a64](https://github.com/tinacms/tinacms/commit/7b53a649edd35b50522ec70b1ea968bc8e8f6c99))

## [0.36.1](https://github.com/tinacms/tinacms/compare/v0.36.0...v0.36.1) (2021-02-01)

**Note:** Version bump only for package tinacms

# [0.36.0](https://github.com/tinacms/tinacms/compare/v0.35.1...v0.36.0) (2021-01-25)

**Note:** Version bump only for package tinacms

# [0.34.0](https://github.com/tinacms/tinacms/compare/v0.33.0...v0.34.0) (2020-11-23)

### Features

- **tinacms:** media manager dropzone accepts multiple files ([179eec6](https://github.com/tinacms/tinacms/commit/179eec60ff25366d10e2657784dab32a1b900ea1))

# [0.33.0](https://github.com/tinacms/tinacms/compare/v0.32.1...v0.33.0) (2020-11-16)

### Features

- **tinacms:** expose plugin handle for media pagination ([4b4345b](https://github.com/tinacms/tinacms/commit/4b4345bc2047de88a4d0473ad2e4674182972f0b))

# [0.32.0](https://github.com/tinacms/tinacms/compare/v0.31.0...v0.32.0) (2020-10-20)

### Bug Fixes

- **tinacms:** media manager upload button is busy while uploading ([3ab978c](https://github.com/tinacms/tinacms/commit/3ab978c43a11ba64f9db2122e94431f48d1b93c3))

# [0.31.0](https://github.com/tinacms/tinacms/compare/v0.30.0...v0.31.0) (2020-10-05)

### Features

- **tinacms:** add media manager UI ([4f0cf96](https://github.com/tinacms/tinacms/commit/4f0cf9631afe68d0b5204aabb66085a2a2291b24))
- **tinacms:** added a default MediaManager screen ([dc33594](https://github.com/tinacms/tinacms/commit/dc33594c227afd884d5078af53f9340277734bca))
- **tinacms:** an alerts map can be provided to TinaCMS constructor ([fcee016](https://github.com/tinacms/tinacms/commit/fcee01604bb6ae08b126c7903c8d90601adf92e5))
- **tinacms:** apis can define their own event-to-alerts map ([24a9305](https://github.com/tinacms/tinacms/commit/24a93059a0abe7930a4f301fa447de162d19fd5c))

# [0.29.0](https://github.com/tinacms/tinacms/compare/v0.28.0...v0.29.0) (2020-08-25)

**Note:** Version bump only for package tinacms

# [0.28.0](https://github.com/tinacms/tinacms/compare/v0.27.3...v0.28.0) (2020-08-17)

**Note:** Version bump only for package tinacms

## [0.27.1](https://github.com/tinacms/tinacms/compare/v0.27.0...v0.27.1) (2020-08-10)

**Note:** Version bump only for package tinacms

# [0.27.0](https://github.com/tinacms/tinacms/compare/v0.26.0...v0.27.0) (2020-08-10)

### Bug Fixes

- **tinacms:** enabling cms with sidebar doesn't remount children ([1188dbf](https://github.com/tinacms/tinacms/commit/1188dbfa5bcaeb0ae9b832b15ad299b5c1ea4c01))

# [0.26.0](https://github.com/tinacms/tinacms/compare/v0.25.0...v0.26.0) (2020-08-03)

**Note:** Version bump only for package tinacms

# [0.23.0-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.22.1...tinacms@0.23.0-alpha.0) (2020-07-15)

### Features

- WIP - add list field plugin ([9e7c1be](https://github.com/tinacms/tinacms/commit/9e7c1be))

## [0.22.1](https://github.com/tinacms/tinacms/compare/tinacms@0.22.1-alpha.0...tinacms@0.22.1) (2020-07-07)

**Note:** Version bump only for package tinacms

## [0.22.1-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.22.0...tinacms@0.22.1-alpha.0) (2020-07-04)

**Note:** Version bump only for package tinacms

# [0.22.0](https://github.com/tinacms/tinacms/compare/tinacms@0.22.0-alpha.0...tinacms@0.22.0) (2020-06-29)

**Note:** Version bump only for package tinacms

# [0.22.0-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.21.3...tinacms@0.22.0-alpha.0) (2020-06-24)

### Bug Fixes

- only register default fields if one hasn't been added yet ([7b40d2f](https://github.com/tinacms/tinacms/commit/7b40d2f))

### Features

- date field is no longer a default plugin ([8ef7a98](https://github.com/tinacms/tinacms/commit/8ef7a98)), closes [#771](https://github.com/tinacms/tinacms/issues/771)
- sidebar config can be a boolean to simplify setup ([d6ca564](https://github.com/tinacms/tinacms/commit/d6ca564))
- the toolbar and sidebar ui are both opt-in ([92c50b3](https://github.com/tinacms/tinacms/commit/92c50b3))
- toolbar config can be a boolean ([4e8def5](https://github.com/tinacms/tinacms/commit/4e8def5))

## [0.21.3](https://github.com/tinacms/tinacms/compare/tinacms@0.21.3-alpha.0...tinacms@0.21.3) (2020-06-23)

**Note:** Version bump only for package tinacms

## [0.21.3-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.21.2...tinacms@0.21.3-alpha.0) (2020-06-17)

**Note:** Version bump only for package tinacms

## [0.21.2](https://github.com/tinacms/tinacms/compare/tinacms@0.21.2-alpha.1...tinacms@0.21.2) (2020-06-15)

**Note:** Version bump only for package tinacms

## [0.21.2-alpha.1](https://github.com/tinacms/tinacms/compare/tinacms@0.21.2-alpha.0...tinacms@0.21.2-alpha.1) (2020-06-12)

**Note:** Version bump only for package tinacms

## [0.21.2-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.21.1...tinacms@0.21.2-alpha.0) (2020-06-08)

**Note:** Version bump only for package tinacms

## [0.21.1](https://github.com/tinacms/tinacms/compare/tinacms@0.21.0...tinacms@0.21.1) (2020-06-08)

**Note:** Version bump only for package tinacms

# [0.21.0](https://github.com/tinacms/tinacms/compare/tinacms@0.21.0-alpha.2...tinacms@0.21.0) (2020-06-01)

**Note:** Version bump only for package tinacms

# [0.21.0-alpha.2](https://github.com/tinacms/tinacms/compare/tinacms@0.21.0-alpha.1...tinacms@0.21.0-alpha.2) (2020-06-01)

**Note:** Version bump only for package tinacms

# [0.21.0-alpha.1](https://github.com/tinacms/tinacms/compare/tinacms@0.21.0-alpha.0...tinacms@0.21.0-alpha.1) (2020-05-29)

**Note:** Version bump only for package tinacms

# [0.21.0-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.20.0...tinacms@0.21.0-alpha.0) (2020-05-28)

### Bug Fixes

- default format now being passed to ReactDateTime ([bc4e1bd](https://github.com/tinacms/tinacms/commit/bc4e1bd))
- parse function returns string in default datetime format ([beafd0b](https://github.com/tinacms/tinacms/commit/beafd0b))
- time parsing & formatting should always deal in UTC ([9a04621](https://github.com/tinacms/tinacms/commit/9a04621))
- we weren't handling time formatting in any way ([6a72ce6](https://github.com/tinacms/tinacms/commit/6a72ce6))

### Features

- add font loader ([4f37605](https://github.com/tinacms/tinacms/commit/4f37605))
- tina provider accepts 'styled' prop ([c581595](https://github.com/tinacms/tinacms/commit/c581595))

# [0.20.0](https://github.com/tinacms/tinacms/compare/tinacms@0.19.4...tinacms@0.20.0) (2020-05-25)

### Bug Fixes

- remove wysiwyg export from tinacms ([6d4cd7e](https://github.com/tinacms/tinacms/commit/6d4cd7e))

### Features

- added TagsFieldPlugin ([8b447e5](https://github.com/tinacms/tinacms/commit/8b447e5))
- remove markdown editor from tinacms default plugins ([c1c36f8](https://github.com/tinacms/tinacms/commit/c1c36f8))

## [0.19.4](https://github.com/tinacms/tinacms/compare/tinacms@0.19.3...tinacms@0.19.4) (2020-05-19)

**Note:** Version bump only for package tinacms

## [0.19.3](https://github.com/tinacms/tinacms/compare/tinacms@0.19.2...tinacms@0.19.3) (2020-05-12)

**Note:** Version bump only for package tinacms

## [0.19.2](https://github.com/tinacms/tinacms/compare/tinacms@0.19.2-alpha.3...tinacms@0.19.2) (2020-05-11)

**Note:** Version bump only for package tinacms

## [0.19.2-alpha.3](https://github.com/tinacms/tinacms/compare/tinacms@0.19.2-alpha.2...tinacms@0.19.2-alpha.3) (2020-05-08)

**Note:** Version bump only for package tinacms

## [0.19.2-alpha.2](https://github.com/tinacms/tinacms/compare/tinacms@0.19.2-alpha.1...tinacms@0.19.2-alpha.2) (2020-05-08)

**Note:** Version bump only for package tinacms

## [0.19.2-alpha.1](https://github.com/tinacms/tinacms/compare/tinacms@0.19.2-alpha.0...tinacms@0.19.2-alpha.1) (2020-05-08)

**Note:** Version bump only for package tinacms

## [0.19.2-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.19.1...tinacms@0.19.2-alpha.0) (2020-05-06)

**Note:** Version bump only for package tinacms

## [0.19.1](https://github.com/tinacms/tinacms/compare/tinacms@0.19.1-alpha.0...tinacms@0.19.1) (2020-05-04)

**Note:** Version bump only for package tinacms

## [0.19.1-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.19.0...tinacms@0.19.1-alpha.0) (2020-04-28)

**Note:** Version bump only for package tinacms

# [0.19.0](https://github.com/tinacms/tinacms/compare/tinacms@0.19.0-alpha.5...tinacms@0.19.0) (2020-04-27)

**Note:** Version bump only for package tinacms

# [0.19.0-alpha.5](https://github.com/tinacms/tinacms/compare/tinacms@0.19.0-alpha.4...tinacms@0.19.0-alpha.5) (2020-04-24)

**Note:** Version bump only for package tinacms

# [0.19.0-alpha.4](https://github.com/tinacms/tinacms/compare/tinacms@0.19.0-alpha.3...tinacms@0.19.0-alpha.4) (2020-04-20)

### Bug Fixes

- add moment as dep to tinacms ([df5cc6f](https://github.com/tinacms/tinacms/commit/df5cc6f))
- deprecated useGlobalForm ([6d79cca](https://github.com/tinacms/tinacms/commit/6d79cca))

### Features

- introduce useFormScreenPlugin ([b29c310](https://github.com/tinacms/tinacms/commit/b29c310))

# [0.19.0-alpha.3](https://github.com/tinacms/tinacms/compare/tinacms@0.19.0-alpha.2...tinacms@0.19.0-alpha.3) (2020-04-14)

### Bug Fixes

- forms are more flexible with the shape of Fields ([90d8b0c](https://github.com/tinacms/tinacms/commit/90d8b0c))

# [0.19.0-alpha.2](https://github.com/tinacms/tinacms/compare/tinacms@0.19.0-alpha.1...tinacms@0.19.0-alpha.2) (2020-04-07)

**Note:** Version bump only for package tinacms

# [0.19.0-alpha.1](https://github.com/tinacms/tinacms/compare/tinacms@0.18.4...tinacms@0.19.0-alpha.1) (2020-04-06)

### Features

- adds toolbar state to tinacms ([ff779c5](https://github.com/tinacms/tinacms/commit/ff779c5))
- adds Toolbar to TinaProvider ([8acae8d](https://github.com/tinacms/tinacms/commit/8acae8d))

## [0.18.4](https://github.com/tinacms/tinacms/compare/tinacms@0.18.3...tinacms@0.18.4) (2020-04-06)

**Note:** Version bump only for package tinacms

## [0.18.3](https://github.com/tinacms/tinacms/compare/tinacms@0.18.2...tinacms@0.18.3) (2020-04-06)

### Bug Fixes

- removed unused useSidebar hook ([2165a3b](https://github.com/tinacms/tinacms/commit/2165a3b))

## [0.18.2](https://github.com/tinacms/tinacms/compare/tinacms@0.18.1...tinacms@0.18.2) (2020-03-30)

### Bug Fixes

- duplicate exports ([eb24613](https://github.com/tinacms/tinacms/commit/eb24613))

## [0.18.1](https://github.com/tinacms/tinacms/compare/tinacms@0.18.0...tinacms@0.18.1) (2020-03-30)

**Note:** Version bump only for package tinacms

# [0.18.0](https://github.com/tinacms/tinacms/compare/tinacms@0.17.0...tinacms@0.18.0) (2020-03-23)

### Bug Fixes

- tinacms constructor accepts media.store ([3293fce](https://github.com/tinacms/tinacms/commit/3293fce))
- **alerts:** use @tinacms/react-alerts ([6f94d6c](https://github.com/tinacms/tinacms/commit/6f94d6c))

### Features

- introduce @tinacms/alerts ([5f556b4](https://github.com/tinacms/tinacms/commit/5f556b4))
- introduce @tinacms/media ([a1be1b6](https://github.com/tinacms/tinacms/commit/a1be1b6))
- move theme system to css custom properties ([ba3bb22](https://github.com/tinacms/tinacms/commit/ba3bb22))

# [0.17.0](https://github.com/tinacms/tinacms/compare/tinacms@0.16.0...tinacms@0.17.0) (2020-03-16)

### Bug Fixes

- correct FormApi and FieldRenderProsp imports ([cbedf41](https://github.com/tinacms/tinacms/commit/cbedf41))
- **TinaCMS:** config is now optional ([ffe567a](https://github.com/tinacms/tinacms/commit/ffe567a))
- renamed Tina to TinaProvider ([dca44e1](https://github.com/tinacms/tinacms/commit/dca44e1))

### Features

- introduce react-tinacms-editor ([06bfb4b](https://github.com/tinacms/tinacms/commit/06bfb4b))

# [0.16.0](https://github.com/tinacms/tinacms/compare/tinacms@0.16.0-alpha.1...tinacms@0.16.0) (2020-03-09)

**Note:** Version bump only for package tinacms

# [0.16.0-alpha.1](https://github.com/tinacms/tinacms/compare/tinacms@0.16.0-alpha.0...tinacms@0.16.0-alpha.1) (2020-03-06)

**Note:** Version bump only for package tinacms

# [0.16.0-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.15.0-alpha.0...tinacms@0.16.0-alpha.0) (2020-03-05)

### Bug Fixes

- BlockOption doesn't throw react warnings ([fcb477a](https://github.com/tinacms/tinacms/commit/fcb477a))
- react warnings from MenuLinks ([386829f](https://github.com/tinacms/tinacms/commit/386829f))
- react warnings with index ([b705b85](https://github.com/tinacms/tinacms/commit/b705b85))
- supress react key warnings from form actions ([42cc21f](https://github.com/tinacms/tinacms/commit/42cc21f))

### Features

- **Fields:** added an HTML field plugin ([f12cf3e](https://github.com/tinacms/tinacms/commit/f12cf3e))
- added API for triggering alerts ([e396699](https://github.com/tinacms/tinacms/commit/e396699)), closes [#821](https://github.com/tinacms/tinacms/issues/821)

# [0.15.0](https://github.com/tinacms/tinacms/compare/tinacms@0.15.0-alpha.0...tinacms@0.15.0) (2020-03-02)

### Features

- added API for triggering alerts ([e396699](https://github.com/tinacms/tinacms/commit/e396699)), closes [#821](https://github.com/tinacms/tinacms/issues/821)
- **Fields:** added an HTML field plugin ([f12cf3e](https://github.com/tinacms/tinacms/commit/f12cf3e))

# [0.15.0-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.14.0...tinacms@0.15.0-alpha.0) (2020-02-26)

### Bug Fixes

- **sidebar:** fix layout issue with sidebar header ([cc86f50](https://github.com/tinacms/tinacms/commit/cc86f50))

### Features

- add useScreenPlugin for react ([7236374](https://github.com/tinacms/tinacms/commit/7236374))
- createScreen helps with making plugins ([1a35617](https://github.com/tinacms/tinacms/commit/1a35617))

# [0.14.0](https://github.com/tinacms/tinacms/compare/tinacms@0.14.0-alpha.1...tinacms@0.14.0) (2020-02-24)

### Bug Fixes

- **sidebar:** fix toggling hidden state ([254326c](https://github.com/tinacms/tinacms/commit/254326c))

### Features

- **Sidebar:** set the text of save/reset buttons ([5af1516](https://github.com/tinacms/tinacms/commit/5af1516)), closes [#620](https://github.com/tinacms/tinacms/issues/620) [#647](https://github.com/tinacms/tinacms/issues/647)

# [0.14.0-alpha.1](https://github.com/tinacms/tinacms/compare/tinacms@0.14.0-alpha.0...tinacms@0.14.0-alpha.1) (2020-02-21)

### Bug Fixes

- pass close to ScreenPlugin components ([081f9b6](https://github.com/tinacms/tinacms/commit/081f9b6))

# [0.14.0-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.13.1...tinacms@0.14.0-alpha.0) (2020-02-20)

### Bug Fixes

- **tinacms:** if single form, FormView no longer renders form list ([780b16c](https://github.com/tinacms/tinacms/commit/780b16c))

### Features

- **tinacms:** adds isHidden getter & setter to sidebar instance ([e98e595](https://github.com/tinacms/tinacms/commit/e98e595))

## [0.13.1](https://github.com/tinacms/tinacms/compare/tinacms@0.13.1-alpha.1...tinacms@0.13.1) (2020-02-18)

**Note:** Version bump only for package tinacms

## [0.13.1-alpha.1](https://github.com/tinacms/tinacms/compare/tinacms@0.13.1-alpha.0...tinacms@0.13.1-alpha.1) (2020-02-16)

**Note:** Version bump only for package tinacms

## [0.13.1-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.13.0...tinacms@0.13.1-alpha.0) (2020-02-14)

### Bug Fixes

- **Tina:** can override hidden and position ([63824ea](https://github.com/tinacms/tinacms/commit/63824ea))
- hiding the sidebar ([691e936](https://github.com/tinacms/tinacms/commit/691e936)), closes [#744](https://github.com/tinacms/tinacms/issues/744)
- sidebar theming ([a5b02e8](https://github.com/tinacms/tinacms/commit/a5b02e8))
- TinaCMS sidebar props are entirely optional ([8e15c21](https://github.com/tinacms/tinacms/commit/8e15c21))

# [0.13.0](https://github.com/tinacms/tinacms/compare/tinacms@0.13.0-alpha.1...tinacms@0.13.0) (2020-02-11)

**Note:** Version bump only for package tinacms

# [0.13.0-alpha.1](https://github.com/tinacms/tinacms/compare/tinacms@0.13.0-alpha.0...tinacms@0.13.0-alpha.1) (2020-02-11)

**Note:** Version bump only for package tinacms

# [0.13.0-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.12.1...tinacms@0.13.0-alpha.0) (2020-02-06)

### Bug Fixes

- **withTina:** TinaCMSConfig compat ([101c61d](https://github.com/tinacms/tinacms/commit/101c61d))

### Features

- **Modals:** export all modal components ([3309eaf](https://github.com/tinacms/tinacms/commit/3309eaf))

## [0.12.1](https://github.com/tinacms/tinacms/compare/tinacms@0.12.1-alpha.1...tinacms@0.12.1) (2020-02-03)

**Note:** Version bump only for package tinacms

## [0.12.1-alpha.1](https://github.com/tinacms/tinacms/compare/tinacms@0.12.0...tinacms@0.12.1-alpha.1) (2020-02-03)

**Note:** Version bump only for package tinacms

## [0.12.1-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.12.0...tinacms@0.12.1-alpha.0) (2020-01-29)

**Note:** Version bump only for package tinacms

# [0.12.0](https://github.com/tinacms/tinacms/compare/tinacms@0.12.0-alpha.0...tinacms@0.12.0) (2020-01-27)

### Bug Fixes

- removed unused dependencies from package.json ([0945fed](https://github.com/tinacms/tinacms/commit/0945fed))

# [0.12.0-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.11.3...tinacms@0.12.0-alpha.0) (2020-01-24)

### Features

- **TinaCMS:** configure plugins/apis on instantiation ([eeec343](https://github.com/tinacms/tinacms/commit/eeec343))
- **withTina:** add HOC for <Tina> CMS provider ([b3c44ef](https://github.com/tinacms/tinacms/commit/b3c44ef))

## [0.11.3](https://github.com/tinacms/tinacms/compare/tinacms@0.11.3-alpha.1...tinacms@0.11.3) (2020-01-22)

**Note:** Version bump only for package tinacms

## [0.11.3-alpha.1](https://github.com/tinacms/tinacms/compare/tinacms@0.11.3-alpha.0...tinacms@0.11.3-alpha.1) (2020-01-22)

### Bug Fixes

- FieldPlugins for text have a default to empty string, instead of undefined ([c899ee5](https://github.com/tinacms/tinacms/commit/c899ee5))

## [0.11.3-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.11.2...tinacms@0.11.3-alpha.0) (2020-01-16)

### Bug Fixes

- remove global styles, fix issues from iframe removal ([0b1b836](https://github.com/tinacms/tinacms/commit/0b1b836))
- remove styled frame comopnent ([eb30b25](https://github.com/tinacms/tinacms/commit/eb30b25))
- remove styled frame from modal ([3905ab0](https://github.com/tinacms/tinacms/commit/3905ab0))
- remove styled frame from sidebar container ([e274b7d](https://github.com/tinacms/tinacms/commit/e274b7d))
- remove styled frame from sidebar toggle ([32bffff](https://github.com/tinacms/tinacms/commit/32bffff))
- remove use of frame ([ae4a055](https://github.com/tinacms/tinacms/commit/ae4a055))

## [0.11.2](https://github.com/tinacms/tinacms/compare/tinacms@0.11.1...tinacms@0.11.2) (2020-01-14)

**Note:** Version bump only for package tinacms

## [0.11.1](https://github.com/tinacms/tinacms/compare/tinacms@0.11.1-alpha.1...tinacms@0.11.1) (2020-01-13)

**Note:** Version bump only for package tinacms

## [0.11.1-alpha.1](https://github.com/tinacms/tinacms/compare/tinacms@0.11.1-alpha.0...tinacms@0.11.1-alpha.1) (2020-01-10)

**Note:** Version bump only for package tinacms

# [0.11.0](https://github.com/tinacms/tinacms/compare/tinacms@0.11.0-alpha.0...tinacms@0.11.0) (2019-12-17)

**Note:** Version bump only for package tinacms

# [0.11.0-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.10.1-alpha.0...tinacms@0.11.0-alpha.0) (2019-12-17)

### Features

- allow user to user enter/return key to create new blog entry ([d850cfb](https://github.com/tinacms/tinacms/commit/d850cfb))
- **Blocks:** have a "type" string ([19008ff](https://github.com/tinacms/tinacms/commit/19008ff))

## [0.10.1-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.10.0...tinacms@0.10.1-alpha.0) (2019-12-06)

**Note:** Version bump only for package tinacms

# [0.10.0](https://github.com/tinacms/tinacms/compare/tinacms@0.10.0-alpha.2...tinacms@0.10.0) (2019-12-02)

**Note:** Version bump only for package tinacms

# [0.10.0-alpha.2](https://github.com/tinacms/tinacms/compare/tinacms@0.10.0-alpha.1...tinacms@0.10.0-alpha.2) (2019-12-02)

**Note:** Version bump only for package tinacms

# [0.10.0-alpha.1](https://github.com/tinacms/tinacms/compare/tinacms@0.10.0-alpha.0...tinacms@0.10.0-alpha.1) (2019-11-28)

### Features

- **Blocks:** add Block component ([cfcb618](https://github.com/tinacms/tinacms/commit/cfcb618))
- **useGlobalForm:** add hook for registering global forms ([d450cae](https://github.com/tinacms/tinacms/commit/d450cae))

# [0.10.0-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.9.1...tinacms@0.10.0-alpha.0) (2019-11-25)

### Features

- tinacms re-exports important types from @tinacms/core ([c51e9de](https://github.com/tinacms/tinacms/commit/c51e9de))

## [0.9.1](https://github.com/tinacms/tinacms/compare/tinacms@0.9.1-alpha.1...tinacms@0.9.1) (2019-11-25)

**Note:** Version bump only for package tinacms

## [0.9.1-alpha.1](https://github.com/tinacms/tinacms/compare/tinacms@0.9.1-alpha.0...tinacms@0.9.1-alpha.1) (2019-11-25)

**Note:** Version bump only for package tinacms

## [0.9.1-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.9.0...tinacms@0.9.1-alpha.0) (2019-11-25)

### Bug Fixes

- set form body wrapper height to 100% ([e43d1dc](https://github.com/tinacms/tinacms/commit/e43d1dc))

# [0.9.0](https://github.com/tinacms/tinacms/compare/tinacms@0.9.0-alpha.1...tinacms@0.9.0) (2019-11-18)

**Note:** Version bump only for package tinacms

# [0.9.0-alpha.1](https://github.com/tinacms/tinacms/compare/tinacms@0.8.1...tinacms@0.9.0-alpha.1) (2019-11-18)

### Bug Fixes

- **Blocks:** add placeholder for invalid blocks ([c3c2515](https://github.com/tinacms/tinacms/commit/c3c2515))

### Features

- **FieldMeta:** provide basic field meta component ([fdb058d](https://github.com/tinacms/tinacms/commit/fdb058d))
- add busy state to button, use when saving ([5f9e810](https://github.com/tinacms/tinacms/commit/5f9e810))
- Add loading indicator on saving ([5faaf79](https://github.com/tinacms/tinacms/commit/5faaf79))
- **Global Forms:** global forms can be registerd as plugins ([e94f112](https://github.com/tinacms/tinacms/commit/e94f112))
- adds min-max height on markdown component ([3f7935b](https://github.com/tinacms/tinacms/commit/3f7935b))
- screen plugins accept layout prop ([b14382e](https://github.com/tinacms/tinacms/commit/b14382e))

# [0.9.0-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.8.1...tinacms@0.9.0-alpha.0) (2019-11-18)

### Bug Fixes

- **Blocks:** add placeholder for invalid blocks ([c3c2515](https://github.com/tinacms/tinacms/commit/c3c2515))

### Features

- **FieldMeta:** provide basic field meta component ([fdb058d](https://github.com/tinacms/tinacms/commit/fdb058d))
- add busy state to button, use when saving ([5f9e810](https://github.com/tinacms/tinacms/commit/5f9e810))
- Add loading indicator on saving ([5faaf79](https://github.com/tinacms/tinacms/commit/5faaf79))
- **Global Forms:** global forms can be registerd as plugins ([e94f112](https://github.com/tinacms/tinacms/commit/e94f112))
- adds min-max height on markdown component ([3f7935b](https://github.com/tinacms/tinacms/commit/3f7935b))
- screen plugins accept layout prop ([b14382e](https://github.com/tinacms/tinacms/commit/b14382e))

## [0.8.1](https://github.com/tinacms/tinacms/compare/tinacms@0.8.0...tinacms@0.8.1) (2019-11-14)

### Bug Fixes

- correct react-tinacms version ([e8a4f55](https://github.com/tinacms/tinacms/commit/e8a4f55))

## 0.8.0 (2019-11-12)

### Bug Fixes

- fix block menu not showing all items ([c61829a](https://github.com/tinacms/tinacms/commit/c61829a))
- styled-components is a peerDependency ([baaf3de](https://github.com/tinacms/tinacms/commit/baaf3de))
- **content creator:** subscribe to plugin changes ([565ead9](https://github.com/tinacms/tinacms/commit/565ead9)), closes [#391](https://github.com/tinacms/tinacms/issues/391)
- **create content plugins:** form shape is generic ([4f691ac](https://github.com/tinacms/tinacms/commit/4f691ac))

### Features

- **blocks:** add itemProps function to templates ([5fd0224](https://github.com/tinacms/tinacms/commit/5fd0224))
- **blocks:** defaultItem can be a function ([a7b8ef6](https://github.com/tinacms/tinacms/commit/a7b8ef6))

## 0.6.0 (2019-11-04)

### Bug Fixes

- fix block menu not showing all items ([c61829a](https://github.com/tinacms/tinacms/commit/c61829a))
- styled-components is a peerDependency ([baaf3de](https://github.com/tinacms/tinacms/commit/baaf3de))
- **content creator:** subscribe to plugin changes ([565ead9](https://github.com/tinacms/tinacms/commit/565ead9)), closes [#391](https://github.com/tinacms/tinacms/issues/391)
- **create content plugins:** form shape is generic ([4f691ac](https://github.com/tinacms/tinacms/commit/4f691ac))

### Features

- **blocks:** add itemProps function to templates ([5fd0224](https://github.com/tinacms/tinacms/commit/5fd0224))
- **blocks:** defaultItem can be a function ([a7b8ef6](https://github.com/tinacms/tinacms/commit/a7b8ef6))

## [0.6.0-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.5.0-alpha.0...tinacms@0.6.0-alpha.0) (2019-10-28)

### Bug Fixes

- fix block menu not showing all items ([c61829a](https://github.com/tinacms/tinacms/commit/c61829a))
- styled-components is a peerDependency ([baaf3de](https://github.com/tinacms/tinacms/commit/baaf3de))

### Features

- **blocks:** add itemProps function to templates ([5fd0224](https://github.com/tinacms/tinacms/commit/5fd0224))
- **blocks:** defaultItem can be a function ([a7b8ef6](https://github.com/tinacms/tinacms/commit/a7b8ef6))

## 0.5.0 (2019-10-28)

### Bug Fixes

- fix block menu not showing all items ([e955542](https://github.com/tinacms/tinacms/commit/e955542))
- add fix for body padding ([82a8d9c](https://github.com/tinacms/tinacms/commit/82a8d9c))
- add form list scroll support ([ef7fcf3](https://github.com/tinacms/tinacms/commit/ef7fcf3))
- add format func to datePicker to fix issue where date wouldn't display correctly until clicked by the picker. Hide timeFormat by default ([9eb5978](https://github.com/tinacms/tinacms/commit/9eb5978))
- add import for color helper ([d278397](https://github.com/tinacms/tinacms/commit/d278397))
- add style for link popup ([9feefd3](https://github.com/tinacms/tinacms/commit/9feefd3))
- add temp link for empty states ([cdf7edc](https://github.com/tinacms/tinacms/commit/cdf7edc))
- always activate an only-form ([b58e5fc](https://github.com/tinacms/tinacms/commit/b58e5fc))
- cleaning up other name/id/label bug issues ([f2c15e4](https://github.com/tinacms/tinacms/commit/f2c15e4))
- close Reset Modal after success ([701bd3c](https://github.com/tinacms/tinacms/commit/701bd3c))
- hmr of forms doesn't break the fs connection ([4501df3](https://github.com/tinacms/tinacms/commit/4501df3))
- improve layout, add support for long titles ([1ce0bfb](https://github.com/tinacms/tinacms/commit/1ce0bfb))
- inline wysiwyg keeps focus on first edit ([f209b34](https://github.com/tinacms/tinacms/commit/f209b34))
- Link to docs ([080ccea](https://github.com/tinacms/tinacms/commit/080ccea)), closes [#161](https://github.com/tinacms/tinacms/issues/161)
- maintain order of forms in sidebar ([ccc9839](https://github.com/tinacms/tinacms/commit/ccc9839)), closes [#229](https://github.com/tinacms/tinacms/issues/229)
- no fields/forms placeholder padding ([89f03ba](https://github.com/tinacms/tinacms/commit/89f03ba))
- only render create content button when available ([e540dd8](https://github.com/tinacms/tinacms/commit/e540dd8))
- only render form in panel when open ([72f4f83](https://github.com/tinacms/tinacms/commit/72f4f83))
- pass onClick to CreateContentButton ([273b85a](https://github.com/tinacms/tinacms/commit/273b85a))
- remove console.log() ([5577549](https://github.com/tinacms/tinacms/commit/5577549))
- remove css reset from site wrapper ([9a5821d](https://github.com/tinacms/tinacms/commit/9a5821d))
- remove form header for single forms ([c5b470e](https://github.com/tinacms/tinacms/commit/c5b470e))
- remove reliance on transform/position quirk ([a188e64](https://github.com/tinacms/tinacms/commit/a188e64))
- remove theme ref from wysiwyg ([8dd00a8](https://github.com/tinacms/tinacms/commit/8dd00a8))
- remove z-index from site wrapper, reorder elements ([ff89a95](https://github.com/tinacms/tinacms/commit/ff89a95))
- replace theme with themeOverrides ([54224dc](https://github.com/tinacms/tinacms/commit/54224dc))
- safari form overflow scrolling ([559ce36](https://github.com/tinacms/tinacms/commit/559ce36))
- safari group panel bug ([5bf6853](https://github.com/tinacms/tinacms/commit/5bf6853))
- set fieldWrapper to position relative ([3e9f953](https://github.com/tinacms/tinacms/commit/3e9f953))
- set key on create content button ([68bf64e](https://github.com/tinacms/tinacms/commit/68bf64e))
- SidebarPosition can be displace/overlay ([217d09d](https://github.com/tinacms/tinacms/commit/217d09d)), closes [#302](https://github.com/tinacms/tinacms/issues/302)
- **date field:** write date string to source ([51cbc1a](https://github.com/tinacms/tinacms/commit/51cbc1a))
- **date field:** writes invalid dates to source ([b0fd128](https://github.com/tinacms/tinacms/commit/b0fd128))
- syncing fields for layered group-lists ([c34936e](https://github.com/tinacms/tinacms/commit/c34936e))
- tracks form with id instead of name ([2f12b75](https://github.com/tinacms/tinacms/commit/2f12b75))
- wysiwyg does not blow up on hot-reload ([8915523](https://github.com/tinacms/tinacms/commit/8915523))
- wysiwyg syncs with source content ([31f1fa9](https://github.com/tinacms/tinacms/commit/31f1fa9))
- **prosemirror:** update prosemirror dependencies ([920a3c7](https://github.com/tinacms/tinacms/commit/920a3c7))
- **sidebar:** call isOpen instead of the open ([c89efb6](https://github.com/tinacms/tinacms/commit/c89efb6))
- **wysiwyg:** prevent blow up during live editing ([e033772](https://github.com/tinacms/tinacms/commit/e033772))

### Features

- add better empty state ([6598fed](https://github.com/tinacms/tinacms/commit/6598fed))
- add ChevronUp icon ([e2f4c88](https://github.com/tinacms/tinacms/commit/e2f4c88))
- add field plugin for Group Lists ([41fb5a4](https://github.com/tinacms/tinacms/commit/41fb5a4))
- Add Group field plugin ([b58864c](https://github.com/tinacms/tinacms/commit/b58864c))
- add plus icon ([bb42bd8](https://github.com/tinacms/tinacms/commit/bb42bd8))
- add reorder and drag icons ([0b04468](https://github.com/tinacms/tinacms/commit/0b04468))
- add reset button to form footer ([f2ec90b](https://github.com/tinacms/tinacms/commit/f2ec90b))
- add reset modal ([2667618](https://github.com/tinacms/tinacms/commit/2667618))
- add Tina icon ([6e54f42](https://github.com/tinacms/tinacms/commit/6e54f42))
- add trash icon ([ea9c7ff](https://github.com/tinacms/tinacms/commit/ea9c7ff))
- allow partial theme override ([54bc7e2](https://github.com/tinacms/tinacms/commit/54bc7e2))
- blocks field plugin ([cac4d86](https://github.com/tinacms/tinacms/commit/cac4d86))
- field plugins accept a parse fn ([7d3b655](https://github.com/tinacms/tinacms/commit/7d3b655))
- field.component can be null ([385c137](https://github.com/tinacms/tinacms/commit/385c137))
- fields can have default values ([54c8602](https://github.com/tinacms/tinacms/commit/54c8602))
- **sidebar:** add position & hidden to sidebar context ([ba89f50](https://github.com/tinacms/tinacms/commit/ba89f50))
- group-list accepts itemProps function ([ca9a627](https://github.com/tinacms/tinacms/commit/ca9a627)), closes [#222](https://github.com/tinacms/tinacms/issues/222)
- group-list defaultItem can be a function ([d7b21d2](https://github.com/tinacms/tinacms/commit/d7b21d2))
- **image:** previewSrc is given it's fields props ([d108d1a](https://github.com/tinacms/tinacms/commit/d108d1a)), closes [#273](https://github.com/tinacms/tinacms/issues/273)
- **sidebar:** "hidden" prop hides sidebar ([f448e6d](https://github.com/tinacms/tinacms/commit/f448e6d)), closes [#91](https://github.com/tinacms/tinacms/issues/91)
- **TextFieldPlugin:** accept placeholder ([e40b6ad](https://github.com/tinacms/tinacms/commit/e40b6ad))
- move create buttons to header plus menu ([39f3d80](https://github.com/tinacms/tinacms/commit/39f3d80))
- theme override ([4dd592e](https://github.com/tinacms/tinacms/commit/4dd592e))
- **wysiwyg:** add codeblock support to wysiwyg ([149e411](https://github.com/tinacms/tinacms/commit/149e411))
- **wysiwyg:** support links in wysiwyg ([a84804f](https://github.com/tinacms/tinacms/commit/a84804f))

## 0.4.0 (2019-10-14)

### Bug Fixes

- add fix for body padding ([82a8d9c](https://github.com/tinacms/tinacms/commit/82a8d9c))
- add form list scroll support ([ef7fcf3](https://github.com/tinacms/tinacms/commit/ef7fcf3))
- add import for color helper ([d278397](https://github.com/tinacms/tinacms/commit/d278397))
- add style for link popup ([9feefd3](https://github.com/tinacms/tinacms/commit/9feefd3))
- add temp link for empty states ([cdf7edc](https://github.com/tinacms/tinacms/commit/cdf7edc))
- always activate an only-form ([b58e5fc](https://github.com/tinacms/tinacms/commit/b58e5fc))
- cleaning up other name/id/label bug issues ([f2c15e4](https://github.com/tinacms/tinacms/commit/f2c15e4))
- close Reset Modal after success ([701bd3c](https://github.com/tinacms/tinacms/commit/701bd3c))
- hmr of forms doesn't break the fs connection ([4501df3](https://github.com/tinacms/tinacms/commit/4501df3))
- improve layout, add support for long titles ([1ce0bfb](https://github.com/tinacms/tinacms/commit/1ce0bfb))
- inline wysiwyg keeps focus on first edit ([f209b34](https://github.com/tinacms/tinacms/commit/f209b34))
- Link to docs ([080ccea](https://github.com/tinacms/tinacms/commit/080ccea)), closes [#161](https://github.com/tinacms/tinacms/issues/161)
- maintain order of forms in sidebar ([ccc9839](https://github.com/tinacms/tinacms/commit/ccc9839)), closes [#229](https://github.com/tinacms/tinacms/issues/229)
- no fields/forms placeholder padding ([89f03ba](https://github.com/tinacms/tinacms/commit/89f03ba))
- only render create content button when available ([e540dd8](https://github.com/tinacms/tinacms/commit/e540dd8))
- only render form in panel when open ([72f4f83](https://github.com/tinacms/tinacms/commit/72f4f83))
- pass onClick to CreateContentButton ([273b85a](https://github.com/tinacms/tinacms/commit/273b85a))
- remove console.log() ([5577549](https://github.com/tinacms/tinacms/commit/5577549))
- remove css reset from site wrapper ([9a5821d](https://github.com/tinacms/tinacms/commit/9a5821d))
- remove form header for single forms ([c5b470e](https://github.com/tinacms/tinacms/commit/c5b470e))
- remove reliance on transform/position quirk ([a188e64](https://github.com/tinacms/tinacms/commit/a188e64))
- remove theme ref from wysiwyg ([8dd00a8](https://github.com/tinacms/tinacms/commit/8dd00a8))
- remove z-index from site wrapper, reorder elements ([ff89a95](https://github.com/tinacms/tinacms/commit/ff89a95))
- replace theme with themeOverrides ([54224dc](https://github.com/tinacms/tinacms/commit/54224dc))
- safari form overflow scrolling ([559ce36](https://github.com/tinacms/tinacms/commit/559ce36))
- safari group panel bug ([5bf6853](https://github.com/tinacms/tinacms/commit/5bf6853))
- set fieldWrapper to position relative ([3e9f953](https://github.com/tinacms/tinacms/commit/3e9f953))
- set key on create content button ([68bf64e](https://github.com/tinacms/tinacms/commit/68bf64e))
- **date field:** write date string to source ([51cbc1a](https://github.com/tinacms/tinacms/commit/51cbc1a))
- **date field:** writes invalid dates to source ([b0fd128](https://github.com/tinacms/tinacms/commit/b0fd128))
- syncing fields for layered group-lists ([c34936e](https://github.com/tinacms/tinacms/commit/c34936e))
- tracks form with id instead of name ([2f12b75](https://github.com/tinacms/tinacms/commit/2f12b75))
- wysiwyg does not blow up on hot-reload ([8915523](https://github.com/tinacms/tinacms/commit/8915523))
- wysiwyg syncs with source content ([31f1fa9](https://github.com/tinacms/tinacms/commit/31f1fa9))
- **prosemirror:** update prosemirror dependencies ([920a3c7](https://github.com/tinacms/tinacms/commit/920a3c7))
- **sidebar:** call isOpen instead of the open ([c89efb6](https://github.com/tinacms/tinacms/commit/c89efb6))
- **wysiwyg:** prevent blow up during live editing ([e033772](https://github.com/tinacms/tinacms/commit/e033772))

### Features

- add better empty state ([6598fed](https://github.com/tinacms/tinacms/commit/6598fed))
- add ChevronUp icon ([e2f4c88](https://github.com/tinacms/tinacms/commit/e2f4c88))
- add field plugin for Group Lists ([41fb5a4](https://github.com/tinacms/tinacms/commit/41fb5a4))
- Add Group field plugin ([b58864c](https://github.com/tinacms/tinacms/commit/b58864c))
- add plus icon ([bb42bd8](https://github.com/tinacms/tinacms/commit/bb42bd8))
- add reorder and drag icons ([0b04468](https://github.com/tinacms/tinacms/commit/0b04468))
- add reset button to form footer ([f2ec90b](https://github.com/tinacms/tinacms/commit/f2ec90b))
- add reset modal ([2667618](https://github.com/tinacms/tinacms/commit/2667618))
- add Tina icon ([6e54f42](https://github.com/tinacms/tinacms/commit/6e54f42))
- add trash icon ([ea9c7ff](https://github.com/tinacms/tinacms/commit/ea9c7ff))
- allow partial theme override ([54bc7e2](https://github.com/tinacms/tinacms/commit/54bc7e2))
- blocks field plugin ([cac4d86](https://github.com/tinacms/tinacms/commit/cac4d86))
- field plugins accept a parse fn ([7d3b655](https://github.com/tinacms/tinacms/commit/7d3b655))
- field.component can be null ([385c137](https://github.com/tinacms/tinacms/commit/385c137))
- fields can have default values ([54c8602](https://github.com/tinacms/tinacms/commit/54c8602))
- **sidebar:** add position & hidden to sidebar context ([ba89f50](https://github.com/tinacms/tinacms/commit/ba89f50))
- group-list accepts itemProps function ([ca9a627](https://github.com/tinacms/tinacms/commit/ca9a627)), closes [#222](https://github.com/tinacms/tinacms/issues/222)
- group-list defaultItem can be a function ([d7b21d2](https://github.com/tinacms/tinacms/commit/d7b21d2))
- **image:** previewSrc is given it's fields props ([d108d1a](https://github.com/tinacms/tinacms/commit/d108d1a)), closes [#273](https://github.com/tinacms/tinacms/issues/273)
- **sidebar:** "hidden" prop hides sidebar ([f448e6d](https://github.com/tinacms/tinacms/commit/f448e6d)), closes [#91](https://github.com/tinacms/tinacms/issues/91)
- **TextFieldPlugin:** accept placeholder ([e40b6ad](https://github.com/tinacms/tinacms/commit/e40b6ad))
- move create buttons to header plus menu ([39f3d80](https://github.com/tinacms/tinacms/commit/39f3d80))
- theme override ([4dd592e](https://github.com/tinacms/tinacms/commit/4dd592e))
- **wysiwyg:** add codeblock support to wysiwyg ([149e411](https://github.com/tinacms/tinacms/commit/149e411))
- **wysiwyg:** support links in wysiwyg ([a84804f](https://github.com/tinacms/tinacms/commit/a84804f))

## 0.3.0 (2019-10-14)

### Bug Fixes

- add fix for body padding ([82a8d9c](https://github.com/tinacms/tinacms/commit/82a8d9c))
- add form list scroll support ([ef7fcf3](https://github.com/tinacms/tinacms/commit/ef7fcf3))
- add import for color helper ([d278397](https://github.com/tinacms/tinacms/commit/d278397))
- add style for link popup ([9feefd3](https://github.com/tinacms/tinacms/commit/9feefd3))
- add temp link for empty states ([cdf7edc](https://github.com/tinacms/tinacms/commit/cdf7edc))
- always activate an only-form ([b58e5fc](https://github.com/tinacms/tinacms/commit/b58e5fc))
- cleaning up other name/id/label bug issues ([f2c15e4](https://github.com/tinacms/tinacms/commit/f2c15e4))
- close Reset Modal after success ([701bd3c](https://github.com/tinacms/tinacms/commit/701bd3c))
- hmr of forms doesn't break the fs connection ([4501df3](https://github.com/tinacms/tinacms/commit/4501df3))
- improve layout, add support for long titles ([1ce0bfb](https://github.com/tinacms/tinacms/commit/1ce0bfb))
- inline wysiwyg keeps focus on first edit ([f209b34](https://github.com/tinacms/tinacms/commit/f209b34))
- Link to docs ([080ccea](https://github.com/tinacms/tinacms/commit/080ccea)), closes [#161](https://github.com/tinacms/tinacms/issues/161)
- maintain order of forms in sidebar ([ccc9839](https://github.com/tinacms/tinacms/commit/ccc9839)), closes [#229](https://github.com/tinacms/tinacms/issues/229)
- no fields/forms placeholder padding ([89f03ba](https://github.com/tinacms/tinacms/commit/89f03ba))
- only render create content button when available ([e540dd8](https://github.com/tinacms/tinacms/commit/e540dd8))
- only render form in panel when open ([72f4f83](https://github.com/tinacms/tinacms/commit/72f4f83))
- pass onClick to CreateContentButton ([273b85a](https://github.com/tinacms/tinacms/commit/273b85a))
- remove console.log() ([5577549](https://github.com/tinacms/tinacms/commit/5577549))
- remove css reset from site wrapper ([9a5821d](https://github.com/tinacms/tinacms/commit/9a5821d))
- remove form header for single forms ([c5b470e](https://github.com/tinacms/tinacms/commit/c5b470e))
- remove reliance on transform/position quirk ([a188e64](https://github.com/tinacms/tinacms/commit/a188e64))
- remove theme ref from wysiwyg ([8dd00a8](https://github.com/tinacms/tinacms/commit/8dd00a8))
- remove z-index from site wrapper, reorder elements ([ff89a95](https://github.com/tinacms/tinacms/commit/ff89a95))
- replace theme with themeOverrides ([54224dc](https://github.com/tinacms/tinacms/commit/54224dc))
- safari form overflow scrolling ([559ce36](https://github.com/tinacms/tinacms/commit/559ce36))
- safari group panel bug ([5bf6853](https://github.com/tinacms/tinacms/commit/5bf6853))
- set fieldWrapper to position relative ([3e9f953](https://github.com/tinacms/tinacms/commit/3e9f953))
- set key on create content button ([68bf64e](https://github.com/tinacms/tinacms/commit/68bf64e))
- **date field:** write date string to source ([51cbc1a](https://github.com/tinacms/tinacms/commit/51cbc1a))
- **date field:** writes invalid dates to source ([b0fd128](https://github.com/tinacms/tinacms/commit/b0fd128))
- syncing fields for layered group-lists ([c34936e](https://github.com/tinacms/tinacms/commit/c34936e))
- tracks form with id instead of name ([2f12b75](https://github.com/tinacms/tinacms/commit/2f12b75))
- wysiwyg does not blow up on hot-reload ([8915523](https://github.com/tinacms/tinacms/commit/8915523))
- wysiwyg syncs with source content ([31f1fa9](https://github.com/tinacms/tinacms/commit/31f1fa9))
- **prosemirror:** update prosemirror dependencies ([920a3c7](https://github.com/tinacms/tinacms/commit/920a3c7))
- **sidebar:** call isOpen instead of the open ([c89efb6](https://github.com/tinacms/tinacms/commit/c89efb6))
- **wysiwyg:** prevent blow up during live editing ([e033772](https://github.com/tinacms/tinacms/commit/e033772))

### Features

- add better empty state ([6598fed](https://github.com/tinacms/tinacms/commit/6598fed))
- add ChevronUp icon ([e2f4c88](https://github.com/tinacms/tinacms/commit/e2f4c88))
- add field plugin for Group Lists ([41fb5a4](https://github.com/tinacms/tinacms/commit/41fb5a4))
- Add Group field plugin ([b58864c](https://github.com/tinacms/tinacms/commit/b58864c))
- add plus icon ([bb42bd8](https://github.com/tinacms/tinacms/commit/bb42bd8))
- add reorder and drag icons ([0b04468](https://github.com/tinacms/tinacms/commit/0b04468))
- add reset button to form footer ([f2ec90b](https://github.com/tinacms/tinacms/commit/f2ec90b))
- add reset modal ([2667618](https://github.com/tinacms/tinacms/commit/2667618))
- add Tina icon ([6e54f42](https://github.com/tinacms/tinacms/commit/6e54f42))
- add trash icon ([ea9c7ff](https://github.com/tinacms/tinacms/commit/ea9c7ff))
- allow partial theme override ([54bc7e2](https://github.com/tinacms/tinacms/commit/54bc7e2))
- blocks field plugin ([cac4d86](https://github.com/tinacms/tinacms/commit/cac4d86))
- field plugins accept a parse fn ([7d3b655](https://github.com/tinacms/tinacms/commit/7d3b655))
- field.component can be null ([385c137](https://github.com/tinacms/tinacms/commit/385c137))
- fields can have default values ([54c8602](https://github.com/tinacms/tinacms/commit/54c8602))
- **sidebar:** add position & hidden to sidebar context ([ba89f50](https://github.com/tinacms/tinacms/commit/ba89f50))
- group-list accepts itemProps function ([ca9a627](https://github.com/tinacms/tinacms/commit/ca9a627)), closes [#222](https://github.com/tinacms/tinacms/issues/222)
- group-list defaultItem can be a function ([d7b21d2](https://github.com/tinacms/tinacms/commit/d7b21d2))
- **image:** previewSrc is given it's fields props ([d108d1a](https://github.com/tinacms/tinacms/commit/d108d1a)), closes [#273](https://github.com/tinacms/tinacms/issues/273)
- **sidebar:** "hidden" prop hides sidebar ([f448e6d](https://github.com/tinacms/tinacms/commit/f448e6d)), closes [#91](https://github.com/tinacms/tinacms/issues/91)
- **TextFieldPlugin:** accept placeholder ([e40b6ad](https://github.com/tinacms/tinacms/commit/e40b6ad))
- move create buttons to header plus menu ([39f3d80](https://github.com/tinacms/tinacms/commit/39f3d80))
- theme override ([4dd592e](https://github.com/tinacms/tinacms/commit/4dd592e))
- **wysiwyg:** add codeblock support to wysiwyg ([149e411](https://github.com/tinacms/tinacms/commit/149e411))
- **wysiwyg:** support links in wysiwyg ([a84804f](https://github.com/tinacms/tinacms/commit/a84804f))

## [0.2.0-alpha.4](https://github.com/tinacms/tinacms/compare/tinacms@0.2.0-alpha.3...tinacms@0.2.0-alpha.4) (2019-10-13)

### Bug Fixes

- only render form in panel when open ([72f4f83](https://github.com/tinacms/tinacms/commit/72f4f83))

## [0.2.0-alpha.2](https://github.com/tinacms/tinacms/compare/tinacms@0.2.0-alpha.1...tinacms@0.2.0-alpha.2) (2019-10-11)

### Bug Fixes

- remove form header for single forms ([c5b470e](https://github.com/tinacms/tinacms/commit/c5b470e))
- safari form overflow scrolling ([559ce36](https://github.com/tinacms/tinacms/commit/559ce36))

## [0.2.0-alpha.1](https://github.com/tinacms/tinacms/compare/tinacms@0.1.1...tinacms@0.2.0-alpha.1) (2019-10-10)

### Bug Fixes

- add form list scroll support ([ef7fcf3](https://github.com/tinacms/tinacms/commit/ef7fcf3))
- always activate an only-form ([b58e5fc](https://github.com/tinacms/tinacms/commit/b58e5fc))
- close Reset Modal after success ([701bd3c](https://github.com/tinacms/tinacms/commit/701bd3c))
- hmr of forms doesn't break the fs connection ([4501df3](https://github.com/tinacms/tinacms/commit/4501df3))
- improve layout, add support for long titles ([1ce0bfb](https://github.com/tinacms/tinacms/commit/1ce0bfb))
- inline wysiwyg keeps focus on first edit ([f209b34](https://github.com/tinacms/tinacms/commit/f209b34))
- maintain order of forms in sidebar ([ccc9839](https://github.com/tinacms/tinacms/commit/ccc9839)), closes [#229](https://github.com/tinacms/tinacms/issues/229)
- only render create content button when available ([e540dd8](https://github.com/tinacms/tinacms/commit/e540dd8))
- remove console.log() ([5577549](https://github.com/tinacms/tinacms/commit/5577549))
- remove theme ref from wysiwyg ([8dd00a8](https://github.com/tinacms/tinacms/commit/8dd00a8))
- replace theme with themeOverrides ([54224dc](https://github.com/tinacms/tinacms/commit/54224dc))
- wysiwyg does not blow up on hot-reload ([8915523](https://github.com/tinacms/tinacms/commit/8915523))
- wysiwyg syncs with source content ([31f1fa9](https://github.com/tinacms/tinacms/commit/31f1fa9))

### Features

- add reset button to form footer ([f2ec90b](https://github.com/tinacms/tinacms/commit/f2ec90b))
- add reset modal ([2667618](https://github.com/tinacms/tinacms/commit/2667618))
- add Tina icon ([6e54f42](https://github.com/tinacms/tinacms/commit/6e54f42))
- allow partial theme override ([54bc7e2](https://github.com/tinacms/tinacms/commit/54bc7e2))
- **image:** previewSrc is given it's fields props ([d108d1a](https://github.com/tinacms/tinacms/commit/d108d1a)), closes [#273](https://github.com/tinacms/tinacms/issues/273)
- **sidebar:** add position & hidden to sidebar context ([ba89f50](https://github.com/tinacms/tinacms/commit/ba89f50))
- group-list accepts itemProps function ([ca9a627](https://github.com/tinacms/tinacms/commit/ca9a627)), closes [#222](https://github.com/tinacms/tinacms/issues/222)
- group-list defaultItem can be a function ([d7b21d2](https://github.com/tinacms/tinacms/commit/d7b21d2))

## [0.2.0-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.1.1...tinacms@0.2.0-alpha.0) (2019-10-09)

### Bug Fixes

- add form list scroll support ([ef7fcf3](https://github.com/tinacms/tinacms/commit/ef7fcf3))
- always activate an only-form ([b58e5fc](https://github.com/tinacms/tinacms/commit/b58e5fc))
- close Reset Modal after success ([701bd3c](https://github.com/tinacms/tinacms/commit/701bd3c))
- hmr of forms doesn't break the fs connection ([4501df3](https://github.com/tinacms/tinacms/commit/4501df3))
- improve layout, add support for long titles ([1ce0bfb](https://github.com/tinacms/tinacms/commit/1ce0bfb))
- inline wysiwyg keeps focus on first edit ([f209b34](https://github.com/tinacms/tinacms/commit/f209b34))
- maintain order of forms in sidebar ([ccc9839](https://github.com/tinacms/tinacms/commit/ccc9839)), closes [#229](https://github.com/tinacms/tinacms/issues/229)
- only render create content button when available ([e540dd8](https://github.com/tinacms/tinacms/commit/e540dd8))
- remove console.log() ([5577549](https://github.com/tinacms/tinacms/commit/5577549))
- remove theme ref from wysiwyg ([8dd00a8](https://github.com/tinacms/tinacms/commit/8dd00a8))
- wysiwyg does not blow up on hot-reload ([8915523](https://github.com/tinacms/tinacms/commit/8915523))
- wysiwyg syncs with source content ([31f1fa9](https://github.com/tinacms/tinacms/commit/31f1fa9))

### Features

- add reset modal ([2667618](https://github.com/tinacms/tinacms/commit/2667618))
- group-list accepts itemProps function ([ca9a627](https://github.com/tinacms/tinacms/commit/ca9a627)), closes [#222](https://github.com/tinacms/tinacms/issues/222)
- group-list defaultItem can be a function ([d7b21d2](https://github.com/tinacms/tinacms/commit/d7b21d2))
- **image:** previewSrc is given it's fields props ([d108d1a](https://github.com/tinacms/tinacms/commit/d108d1a)), closes [#273](https://github.com/tinacms/tinacms/issues/273)
- allow partial theme override ([54bc7e2](https://github.com/tinacms/tinacms/commit/54bc7e2))
- **sidebar:** add position & hidden to sidebar context ([ba89f50](https://github.com/tinacms/tinacms/commit/ba89f50))
- add reset button to form footer ([f2ec90b](https://github.com/tinacms/tinacms/commit/f2ec90b))
- add Tina icon ([6e54f42](https://github.com/tinacms/tinacms/commit/6e54f42))

## [0.1.4-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.1.3...tinacms@0.1.4-alpha.0) (2019-10-07)

### Bug Fixes

- always activate an only-form ([b58e5fc](https://github.com/tinacms/tinacms/commit/b58e5fc))

## [0.1.3-alpha.0](https://github.com/tinacms/tinacms/compare/tinacms@0.1.1...tinacms@0.1.3-alpha.0) (2019-10-07)

### Bug Fixes

- add form list scroll support ([ef7fcf3](https://github.com/tinacms/tinacms/commit/ef7fcf3))
- improve layout, add support for long titles ([1ce0bfb](https://github.com/tinacms/tinacms/commit/1ce0bfb))
- maintain order of forms in sidebar ([ccc9839](https://github.com/tinacms/tinacms/commit/ccc9839)), closes [#229](https://github.com/tinacms/tinacms/issues/229)
- only render create content button when available ([e540dd8](https://github.com/tinacms/tinacms/commit/e540dd8))

## 0.1.1 (2019-10-03)

### Bug Fixes

- no fields/forms placeholder padding ([89f03ba](https://github.com/tinacms/tinacms/commit/89f03ba))

## [0.1.0-alpha.20](https://github.com/tinacms/tinacms/compare/tinacms@0.1.0-alpha.19...tinacms@0.1.0-alpha.20) (2019-10-02)

### Bug Fixes

- Link to docs ([080ccea](https://github.com/tinacms/tinacms/commit/080ccea)), closes [#161](https://github.com/tinacms/tinacms/issues/161)
- pass onClick to CreateContentButton ([273b85a](https://github.com/tinacms/tinacms/commit/273b85a))
- remove reliance on transform/position quirk ([a188e64](https://github.com/tinacms/tinacms/commit/a188e64))
- safari group panel bug ([5bf6853](https://github.com/tinacms/tinacms/commit/5bf6853))
- set fieldWrapper to position relative ([3e9f953](https://github.com/tinacms/tinacms/commit/3e9f953))
- set key on create content button ([68bf64e](https://github.com/tinacms/tinacms/commit/68bf64e))
- syncing fields for layered group-lists ([c34936e](https://github.com/tinacms/tinacms/commit/c34936e))

### Features

- add field plugin for Group Lists ([41fb5a4](https://github.com/tinacms/tinacms/commit/41fb5a4))
- Add Group field plugin ([b58864c](https://github.com/tinacms/tinacms/commit/b58864c))
- blocks field plugin ([cac4d86](https://github.com/tinacms/tinacms/commit/cac4d86))
- move create buttons to header plus menu ([39f3d80](https://github.com/tinacms/tinacms/commit/39f3d80))
- theme override ([4dd592e](https://github.com/tinacms/tinacms/commit/4dd592e))

## [0.1.0-alpha.19](https://github.com/tinacms/tinacms/compare/tinacms@0.1.0-alpha.18...tinacms@0.1.0-alpha.19) (2019-09-25)

### Features

- **TextFieldPlugin:** accept placeholder ([e40b6ad](https://github.com/tinacms/tinacms/commit/e40b6ad))

## [0.1.0-alpha.18](https://github.com/tinacms/tinacms/compare/tinacms@0.1.0-alpha.17...tinacms@0.1.0-alpha.18) (2019-09-23)

### Bug Fixes

- **sidebar:** call isOpen instead of the open ([c89efb6](https://github.com/tinacms/tinacms/commit/c89efb6))

## [0.1.0-alpha.17](https://github.com/tinacms/tinacms/compare/tinacms@0.1.0-alpha.16...tinacms@0.1.0-alpha.17) (2019-09-23)

### Bug Fixes

- remove css reset from site wrapper ([9a5821d](https://github.com/tinacms/tinacms/commit/9a5821d))

### Features

- **sidebar:** "hidden" prop hides sidebar ([f448e6d](https://github.com/tinacms/tinacms/commit/f448e6d)), closes [#91](https://github.com/tinacms/tinacms/issues/91)

## [0.1.0-alpha.14](https://github.com/tinacms/tinacms/compare/tinacms@0.1.0-alpha.11...tinacms@0.1.0-alpha.14) (2019-09-20)

### Bug Fixes

- add fix for body padding ([82a8d9c](https://github.com/tinacms/tinacms/commit/82a8d9c))
- add import for color helper ([d278397](https://github.com/tinacms/tinacms/commit/d278397))
- add temp link for empty states ([cdf7edc](https://github.com/tinacms/tinacms/commit/cdf7edc))
- cleaning up other name/id/label bug issues ([f2c15e4](https://github.com/tinacms/tinacms/commit/f2c15e4))
- tracks form with id instead of name ([2f12b75](https://github.com/tinacms/tinacms/commit/2f12b75))
- **date field:** write date string to source ([51cbc1a](https://github.com/tinacms/tinacms/commit/51cbc1a))
- **date field:** writes invalid dates to source ([b0fd128](https://github.com/tinacms/tinacms/commit/b0fd128))

### Features

- add better empty state ([6598fed](https://github.com/tinacms/tinacms/commit/6598fed))

## [0.1.0-alpha.12](https://github.com/tinacms/tinacms/compare/tinacms@0.1.0-alpha.11...tinacms@0.1.0-alpha.12) (2019-09-20)

### Bug Fixes

- add fix for body padding ([82a8d9c](https://github.com/tinacms/tinacms/commit/82a8d9c))
- add import for color helper ([d278397](https://github.com/tinacms/tinacms/commit/d278397))
- cleaning up other name/id/label bug issues ([f2c15e4](https://github.com/tinacms/tinacms/commit/f2c15e4))
- tracks form with id instead of name ([2f12b75](https://github.com/tinacms/tinacms/commit/2f12b75))
- **date field:** write date string to source ([51cbc1a](https://github.com/tinacms/tinacms/commit/51cbc1a))
- **date field:** writes invalid dates to source ([b0fd128](https://github.com/tinacms/tinacms/commit/b0fd128))
