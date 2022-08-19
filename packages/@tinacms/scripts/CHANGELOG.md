# Change Log

## 0.51.1

### Patch Changes

- 9fbb4e557: Fix issue building node packages to non-index.js files

## 0.51.0

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

## 0.50.9

### Patch Changes

- 2ef5a1f33: fix scale isssue, truncate form label to filename

## 0.50.8

### Patch Changes

- 1f7d3ca3d: Use custom wrapper class for tailwind type plugin
- 6c17f0160: fix scale isssue, truncate form label to filename

## 0.50.7

### Patch Changes

- 3ff1de06a: Upgrade to Tailwind 3

## 0.50.6

### Patch Changes

- a05546eb4: Added basic open source telemetry

  See [this discussion](https://github.com/tinacms/tinacms/discussions/2451) for more information and how to opt out.

## 0.50.5

### Patch Changes

- 6a50a1368: Updates the look and feel of the Tina Sidebar

## 0.50.4

### Patch Changes

- 138ceb8c4: Clean up dependencies

## 0.50.3

### Patch Changes

- 667c33e2a: Add support for rich-text field, update build script to work with unified packages, which are ESM-only

## 0.50.2

### Patch Changes

- 9b27192fe: Build packages with new scripting, which includes preliminary support for ES modules.

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

# [0.39.0](https://github.com/tinacms/tinacms/compare/v0.38.0...v0.39.0) (2021-03-30)

### Bug Fixes

- copyright ([e4323c2](https://github.com/tinacms/tinacms/commit/e4323c25b7e893005bffad1827018b523b7f6939)), closes [#1778](https://github.com/tinacms/tinacms/issues/1778)

# [0.29.0](https://github.com/tinacms/tinacms/compare/v0.28.0...v0.29.0) (2020-08-25)

**Note:** Version bump only for package @tinacms/scripts

# [0.26.0](https://github.com/tinacms/tinacms/compare/v0.25.0...v0.26.0) (2020-08-03)

**Note:** Version bump only for package @tinacms/scripts

## [0.1.13](https://github.com/tinacms/tinacms/compare/@tinacms/scripts@0.1.13-alpha.0...@tinacms/scripts@0.1.13) (2020-03-09)

**Note:** Version bump only for package @tinacms/scripts

## [0.1.13-alpha.0](https://github.com/tinacms/tinacms/compare/@tinacms/scripts@0.1.12...@tinacms/scripts@0.1.13-alpha.0) (2020-03-05)

**Note:** Version bump only for package @tinacms/scripts

## [0.1.12](https://github.com/tinacms/tinacms/compare/@tinacms/scripts@0.1.12-alpha.0...@tinacms/scripts@0.1.12) (2020-02-11)

**Note:** Version bump only for package @tinacms/scripts

## [0.1.12-alpha.0](https://github.com/tinacms/tinacms/compare/@tinacms/scripts@0.1.11...@tinacms/scripts@0.1.12-alpha.0) (2020-02-11)

**Note:** Version bump only for package @tinacms/scripts

## [0.1.11](https://github.com/tinacms/tinacms/compare/@tinacms/scripts@0.1.11-alpha.1...@tinacms/scripts@0.1.11) (2019-11-18)

**Note:** Version bump only for package @tinacms/scripts

## [0.1.11-alpha.1](https://github.com/tinacms/tinacms/compare/@tinacms/scripts@0.1.10...@tinacms/scripts@0.1.11-alpha.1) (2019-11-18)

**Note:** Version bump only for package @tinacms/scripts

## [0.1.11-alpha.0](https://github.com/tinacms/tinacms/compare/@tinacms/scripts@0.1.10...@tinacms/scripts@0.1.11-alpha.0) (2019-11-18)

**Note:** Version bump only for package @tinacms/scripts
