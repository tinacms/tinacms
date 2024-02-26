# Change Log

## 1.1.3

### Patch Changes

- a65ca13f2: ## TinaCMS Self hosted Updates

  ### Changes in the database file

  #### Deprecations and Additions

  - **Deprecated**: `onPut`, `onDelete`, and `level` arguments in `createDatabase`.
  - **Added**: `databaseAdapter` to replace `level`.
  - **Added**: `gitProvider` to substitute `onPut` and `onDelete`.
  - **New Package**: `tinacms-gitprovider-github`, exporting the `GitHubProvider` class.
  - **Interface Addition**: `gitProvider` added to `@strivemath/tinacms-graphql`.
  - **Addition**: Generated database client.

  #### Updated `database.ts` Example

  ```typescript
  import {
    createDatabase,
    createLocalDatabase,
  } from '@strivemath/tinacms-datalayer'
  import { MongodbLevel } from 'mongodb-level'
  import { GitHubProvider } from 'tinacms-gitprovider-github'

  const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true'

  export default isLocal
    ? createLocalDatabase()
    : createDatabase({
        gitProvider: new GitHubProvider({
          branch: process.env.GITHUB_BRANCH,
          owner: process.env.GITHUB_OWNER,
          repo: process.env.GITHUB_REPO,
          token: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
        }),
        databaseAdapter: new MongodbLevel<string, Record<string, any>>({
          collectionName: '@strivemath/tinacms',
          dbName: '@strivemath/tinacms',
          mongoUri: process.env.MONGODB_URI,
        }),
        namespace: process.env.GITHUB_BRANCH,
      })
  ```

  ### Migrating `database.ts`

  #### a. Replacing `onPut` and `onDelete` with `gitProvider`

  - **GitHubProvider Usage**: Replace `onPut` and `onDelete` with `gitProvider`, using the provided `GitHubProvider` for GitHub.

  ```typescript
  const gitProvider = new GitHubProvider({
    branch: process.env.GITHUB_BRANCH,
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    token: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
  })
  ```

  - **Custom Git Provider**: Implement the `GitProvider` interface for different git providers.

  If you are not using Github as your git provider, you can implement the `GitProvider` interface to use your own git provider.

  ```typescript
  class CustomGitProvider implements GitProvider
      async onPut(key: string, value: string)
          // ...

      async onDelete(key: string)
          // ...


  const gitProvider = new CustomGitProvider();
  ```

  #### b. Renaming `level` to `databaseAdapter`

  - **Renaming in Code**: Change `level` to `databaseAdapter` for clarity.

  ```diff
  createDatabase({
  -    level: new MongodbLevel<string, Record<string, any>>(...),
  +    databaseAdapter: new MongodbLevel<string, Record<string, any>>(...),
  })
  ```

  #### c. `createLocalDatabase` Function

  - **Usage**: Implement a local database with the `createLocalDatabase` function.

  ```typescript
  import { createLocalDatabase } from '@strivemath/tinacms-datalayer'
  createLocalDatabase(port)
  ```

  #### d. Consolidated Example

  - **Updated `database.{ts,js}` File**:

  ```typescript
  import { createDatabase, createLocalDatabase, GitHubProvider } from '@strivemath/tinacms-datalayer';
  import { MongodbLevel } from 'mongodb-level';
  const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true';
  export default isLocal
    ? createLocalDatabase()
    : createDatabase({
        gitProvider: new GitHubProvider(...),
        databaseAdapter: new MongodbLevel<string, Record<string, any>>(...),
      });
  ```

  ### Summary of Authentication Updates in Config

  #### a. AuthProvider and AbstractAuthProvider

  - **New**: `authProvider` in `defineConfig`.
  - **Class**: `AbstractAuthProvider` for extending new auth providers.
  - **Clerk Auth Provider**: New provider added.
  - **Renaming**: `admin.auth` to `admin.authHooks`.
  - **Deprecation**: `admin.auth`.

  #### b. Auth Provider in Internal Client and Config

  - **Transition**: From auth functions to `authProvider` class.

  #### c. Migration for Authentication

  - **Previous API**:

  ```javascript
  defineConfig({
    admin: {
      auth: {
        login() {},
        logout() {},
        //...
      },
    },
    //...
  })
  ```

  - **New API**:

  ```javascript
  import { AbstractAuthProvider } from '@strivemath/tinacms'
  class CustomAuthProvider extends AbstractAuthProvider {
    login() {}
    logout() {}
    //...
  }
  defineConfig({
    authProvider: new CustomAuthProvider(),
    //...
  })
  ```

  ### TinaCMS Self Hosted backend updates

  - **New:** TinaNodeBackend is exported from `@strivemath/tinacms-datalayer`. This is used to host the TinaCMS backend in a single function.
  - **New:** `LocalBackendAuthProvider` is exported from `@strivemath/tinacms-datalayer`. This is used to host the TinaCMS backend locally.

  - **New:** `AuthJsBackendAuthProvider` is exported from `tinacms-authjs`. This is used to host the TinaCMS backend with AuthJS.

  ### Migrating the TinaCMS backend

  Now, instead of hosting the in /tina/api/gql.ts file, the entire TinaCMS backend (including auth) will be hosted in a single backend function.

  `/api/tina/[...routes].{ts,js}`

  ```typescript
  import {
    TinaNodeBackend,
    LocalBackendAuthProvider,
  } from '@strivemath/tinacms-datalayer'

  import { TinaAuthJSOptions, AuthJsBackendAuthProvider } from 'tinacms-authjs'

  import databaseClient from '../../../tina/__generated__/databaseClient'

  const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true'

  const handler = TinaNodeBackend({
    authProvider: isLocal
      ? LocalBackendAuthProvider()
      : AuthJsBackendAuthProvider({
          authOptions: TinaAuthJSOptions({
            databaseClient: databaseClient,
            secret: process.env.NEXTAUTH_SECRET,
          }),
        }),
    databaseClient,
  })

  export default (req, res) => {
    // Modify the request here if you need to
    return handler(req, res)
  }
  ```

  These changes are put in place to make self hosted TinaCMS easier to use and more flexible.

  Please [check out the docs](https://tina.io/docs/self-hosted/overview) for more information on self hosted TinaCMS.

## 1.1.2

### Patch Changes

- 121bd9fc4: Absorb @tinacms/toolkit into tinacms

  fix: Use clean page-sizes on media manager (to make pagination more obvious)

  Fix issue with uploading media in a folder with tina cloud

## 1.1.1

### Patch Changes

- bc812441b: Use .mjs extension for ES modules

## 1.1.0

### Minor Changes

- 76c984bcc: Use new API endpoint in content api reqests

### Patch Changes

- cbc1fb919: Provide browser-specific version of @strivemath/tinacms-mdx
- 3a1edd50d: Bundle the MDX package with its dependencies so we can avoid awkward import issues related to the remark ecosystem modules

## 1.0.4

### Patch Changes

- b095d06a9: Bump esbuild versions in graphql/scripts

## 1.0.3

### Patch Changes

- be3eac32f: Adds grid view to media manager
- f831dcf4f: security: update some deps

## 1.0.2

### Patch Changes

- efd56e769: Remove license headers

## 1.0.1

### Patch Changes

- b2952a298: Adds meta wrapper for list-type fields that displays errors. Adds optional min/max for list-type fields that controls add/remove UI. Removes duplicate label from group field.

## 1.0.0

### Major Changes

- 958d10c82: Tina 1.0 Release

  Make sure you have updated to th "iframe" path: https://tina.io/blog/upgrading-to-iframe/

## 0.51.3

### Patch Changes

- 03aa3e09e: Remove the use of ESM package, which allowed CJS scripts to run as ES modules. This was initially used for yarn pnp support but is no longer necessary.

## 0.51.2

### Patch Changes

- 2422e505d: Removed styled-components as a dependency in tinacms.
  Removed deprecated react-toolbar in @tinacms/toolkit.

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

**Note:** Version bump only for package @strivemath/tinacms-scripts

# [0.26.0](https://github.com/tinacms/tinacms/compare/v0.25.0...v0.26.0) (2020-08-03)

**Note:** Version bump only for package @strivemath/tinacms-scripts

## [0.1.13](https://github.com/tinacms/tinacms/compare/@strivemath/tinacms-scripts@0.1.13-alpha.0...@strivemath/tinacms-scripts@0.1.13) (2020-03-09)

**Note:** Version bump only for package @strivemath/tinacms-scripts

## [0.1.13-alpha.0](https://github.com/tinacms/tinacms/compare/@strivemath/tinacms-scripts@0.1.12...@strivemath/tinacms-scripts@0.1.13-alpha.0) (2020-03-05)

**Note:** Version bump only for package @strivemath/tinacms-scripts

## [0.1.12](https://github.com/tinacms/tinacms/compare/@strivemath/tinacms-scripts@0.1.12-alpha.0...@strivemath/tinacms-scripts@0.1.12) (2020-02-11)

**Note:** Version bump only for package @strivemath/tinacms-scripts

## [0.1.12-alpha.0](https://github.com/tinacms/tinacms/compare/@strivemath/tinacms-scripts@0.1.11...@strivemath/tinacms-scripts@0.1.12-alpha.0) (2020-02-11)

**Note:** Version bump only for package @strivemath/tinacms-scripts

## [0.1.11](https://github.com/tinacms/tinacms/compare/@strivemath/tinacms-scripts@0.1.11-alpha.1...@strivemath/tinacms-scripts@0.1.11) (2019-11-18)

**Note:** Version bump only for package @strivemath/tinacms-scripts

## [0.1.11-alpha.1](https://github.com/tinacms/tinacms/compare/@strivemath/tinacms-scripts@0.1.10...@strivemath/tinacms-scripts@0.1.11-alpha.1) (2019-11-18)

**Note:** Version bump only for package @strivemath/tinacms-scripts

## [0.1.11-alpha.0](https://github.com/tinacms/tinacms/compare/@strivemath/tinacms-scripts@0.1.10...@strivemath/tinacms-scripts@0.1.11-alpha.0) (2019-11-18)

**Note:** Version bump only for package @strivemath/tinacms-scripts
