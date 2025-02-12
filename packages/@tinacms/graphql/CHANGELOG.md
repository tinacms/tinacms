# tina-graphql

## 1.5.12

### Patch Changes

- [#5481](https://github.com/tinacms/tinacms/pull/5481) [`1d93305`](https://github.com/tinacms/tinacms/commit/1d93305e76c0dd0eee745a7770e01796b166a846) Thanks [@kldavis4](https://github.com/kldavis4)! - Fix indexContentByPaths to delete existing indexes if they exist

## 1.5.11

### Patch Changes

- [#5439](https://github.com/tinacms/tinacms/pull/5439) [`47cfaf6`](https://github.com/tinacms/tinacms/commit/47cfaf63cee139309458fccc49670e3b5cbf430c) Thanks [@kldavis4](https://github.com/kldavis4)! - Test improvements for @tinacms/graphql including switching to vitest and additional tests

## 1.5.10

### Patch Changes

- [#5396](https://github.com/tinacms/tinacms/pull/5396) [`7994046`](https://github.com/tinacms/tinacms/commit/79940467f97355651d86daace044717179a47734) Thanks [@kldavis4](https://github.com/kldavis4)! - Fix issue with deleting files on windows in dev mode

- [#5393](https://github.com/tinacms/tinacms/pull/5393) [`8d24f89`](https://github.com/tinacms/tinacms/commit/8d24f899838b9d5384782f699febd26be65902fd) Thanks [@kldavis4](https://github.com/kldavis4)! - Fix issue with addNamespaceToSchema which caused https://github.com/tinacms/tinacms/issues/5364

- [#5408](https://github.com/tinacms/tinacms/pull/5408) [`877699d`](https://github.com/tinacms/tinacms/commit/877699d08b3e2c2470742a3acf25d02a95e440b3) Thanks [@Ben0189](https://github.com/Ben0189)! - Fixes for React 19 support
  - Change react-use import statements to default import method
  - Fixed deprecated API from headless UI in the experimental example
- Updated dependencies [[`92b683b`](https://github.com/tinacms/tinacms/commit/92b683bd3d73b47271eee5b8ff648ed4dcde51e3), [`82b0039`](https://github.com/tinacms/tinacms/commit/82b00393da8bbcc2cf357fbbb546904f07e8d89c)]:
  - @tinacms/schema-tools@1.7.0
  - @tinacms/mdx@1.5.4

## 1.5.9

### Patch Changes

- Updated dependencies [[`c45ac5d`](https://github.com/tinacms/tinacms/commit/c45ac5d9c7219593cde63e0cc6fbf945480884f7)]:
  - @tinacms/schema-tools@1.6.9
  - @tinacms/mdx@1.5.3

## 1.5.8

### Patch Changes

- [#5276](https://github.com/tinacms/tinacms/pull/5276) [`f90ef4d`](https://github.com/tinacms/tinacms/commit/f90ef4d92ae7b21c8c610d14af9510354a3969c6) Thanks [@Ben0189](https://github.com/Ben0189)! - Updates minor and patch dependencies

- [#5218](https://github.com/tinacms/tinacms/pull/5218) [`03bb823`](https://github.com/tinacms/tinacms/commit/03bb8237df87dab9da503818b839d44209263a48) Thanks [@kldavis4](https://github.com/kldavis4)! - Adds referential integrity for renaming and deleting referenced documents.

  When a document is renamed, any documents which reference the document will be updated with the new document name. When a document is deleted, the user will be warned and any references to the document will be deleted.

- Updated dependencies [[`f90ef4d`](https://github.com/tinacms/tinacms/commit/f90ef4d92ae7b21c8c610d14af9510354a3969c6), [`ac2003f`](https://github.com/tinacms/tinacms/commit/ac2003f87381de36c417d69fdb59485dc96f334a), [`03bb823`](https://github.com/tinacms/tinacms/commit/03bb8237df87dab9da503818b839d44209263a48)]:
  - @tinacms/mdx@1.5.2
  - @tinacms/schema-tools@1.6.8

## 1.5.7

### Patch Changes

- [#5225](https://github.com/tinacms/tinacms/pull/5225) [`0daf0b6`](https://github.com/tinacms/tinacms/commit/0daf0b687b36614a1fdf904b1d5125e4c63e81a9) Thanks [@JackDevAU](https://github.com/JackDevAU)! - ⬆️ Addresses peer dependency issues and applies necessary updates

- Updated dependencies [[`0daf0b6`](https://github.com/tinacms/tinacms/commit/0daf0b687b36614a1fdf904b1d5125e4c63e81a9)]:
  - @tinacms/schema-tools@1.6.7
  - @tinacms/mdx@1.5.1

## 1.5.6

### Patch Changes

- Updated dependencies [[`c5dad82`](https://github.com/tinacms/tinacms/commit/c5dad82a3f1fc4f7686f1503a7894dfacffa8c36), [`ecea7ac`](https://github.com/tinacms/tinacms/commit/ecea7ac5e1c087954eaaf873df3a563ca08f3e47)]:
  - @tinacms/mdx@1.5.0
  - @tinacms/schema-tools@1.6.6

## 1.5.5

### Patch Changes

- Updated dependencies [[`31513bb`](https://github.com/tinacms/tinacms/commit/31513bb473cd1d349a3711ef7c5075cf9d03f121)]:
  - @tinacms/schema-tools@1.6.5
  - @tinacms/mdx@1.4.5

## 1.5.4

### Patch Changes

- [#4843](https://github.com/tinacms/tinacms/pull/4843) [`4753c9b`](https://github.com/tinacms/tinacms/commit/4753c9b53854d19212229f985bc445b2794fad9a) Thanks [@JackDevAU](https://github.com/JackDevAU)! - ⬆️ Update Minor & Patch Dependencies Versions

- Updated dependencies [[`4753c9b`](https://github.com/tinacms/tinacms/commit/4753c9b53854d19212229f985bc445b2794fad9a)]:
  - @tinacms/mdx@1.4.4
  - @tinacms/schema-tools@1.6.4

## 1.5.3

### Patch Changes

- [#4804](https://github.com/tinacms/tinacms/pull/4804) [`d08053e`](https://github.com/tinacms/tinacms/commit/d08053e758b6910afa8ab8952a40984921cccbc4) Thanks [@dependabot](https://github.com/apps/dependabot)! - ⬆️ Updates Typescript to v5.5, @types/node to v22.x, next.js to latest version 14.x, and removes node-fetch

- Updated dependencies [[`6cd3596`](https://github.com/tinacms/tinacms/commit/6cd35967ab0d34851be44199bc9821b128fcfc75), [`d08053e`](https://github.com/tinacms/tinacms/commit/d08053e758b6910afa8ab8952a40984921cccbc4)]:
  - @tinacms/schema-tools@1.6.3
  - @tinacms/mdx@1.4.3

## 1.5.2

### Patch Changes

- f088b97: Fix vulnerable packages - Update Nodemon from version `2.0.19` to `3.1.4`
- Updated dependencies [6ccda6c]
- Updated dependencies [33eaa81]
  - @tinacms/schema-tools@1.6.2
  - @tinacms/mdx@1.4.2

## 1.5.1

### Patch Changes

- Updated dependencies [ae03e8e]
  - @tinacms/schema-tools@1.6.1
  - @tinacms/mdx@1.4.1

## 1.5.0

### Minor Changes

- 324950a: Updates Plate Editor to latest version 36.

  - Upgrades all remaining packages `Typescript` to version `^5`
  - Adds Shadcn/ui styles/colours to our `tinatailwind` config (`packages/@tinacms/cli/src/next/vite/tailwind.ts`)
  - Replaces some `lodash` deps with either the specific function i.e. `lodash.set` or implements them in a utility file
  - Updates and removes old version of plate (`plate-headless`) for latest version `^36`
  - Starts removing and cleaning up some of the old Plate code.

### Patch Changes

- Updated dependencies [324950a]
  - @tinacms/schema-tools@1.6.0
  - @tinacms/mdx@1.4.0

## 1.4.40

### Patch Changes

- d9b23fc: Improve reference field selector
- 613e9c5: Filter .gitkeep.\* files during indexing

## 1.4.39

### Patch Changes

- Updated dependencies [cb83dc2]
  - @tinacms/schema-tools@1.5.0
  - @tinacms/mdx@1.3.29

## 1.4.38

### Patch Changes

- f567fc8: More React 18 upgrades and fixes
- e58b951: update vulnerable packages so npm audit does not complain
- 9076d09: update next js version from 12 to 14 in tinacms packages
- Updated dependencies [f567fc8]
- Updated dependencies [e58b951]
- Updated dependencies [957fa26]
- Updated dependencies [9076d09]
  - @tinacms/mdx@1.3.28
  - @tinacms/schema-tools@1.4.19

## 1.4.37

### Patch Changes

- Updated dependencies [f26b40d]
  - @tinacms/schema-tools@1.4.18
  - @tinacms/mdx@1.3.27

## 1.4.36

### Patch Changes

- 76c1a2e: Fix issue where empty folders were not visible #4566
- 0503072: update ts, remove rimraf, fix types
- dffa355: Remove yarn for pnpm
- Updated dependencies [0503072]
- Updated dependencies [dffa355]
  - @tinacms/mdx@1.3.26
  - @tinacms/schema-tools@1.4.17

## 1.4.35

### Patch Changes

- 2e3393ef5: Implement Create folder feature for tinacms.
- Updated dependencies [2e3393ef5]
  - @tinacms/schema-tools@1.4.16
  - @tinacms/mdx@1.3.25

## 1.4.34

### Patch Changes

- Updated dependencies [b3ad50a62]
  - @tinacms/mdx@1.3.24

## 1.4.33

### Patch Changes

- 67e7a2d82: Make return type optional on getLookup to allow entire file to be retrieved

## 1.4.32

### Patch Changes

- 1e5c94f05: Fix issue where items after an empty list would not be saved.

## 1.4.31

### Patch Changes

- 7779cdbf6: Fix resolveLegacyValues Logic
- 031ce05c2: Clear collectionIndexDefinitions on server restart
- Updated dependencies [64f8fa038]
  - @tinacms/schema-tools@1.4.15
  - @tinacms/mdx@1.3.23

## 1.4.30

### Patch Changes

- 476b9dfbe: Fixes https://github.com/tinacms/tinacms/issues/4355

## 1.4.29

### Patch Changes

- a65ca13f2: ## TinaCMS Self hosted Updates

  ### Changes in the database file

  #### Deprecations and Additions

  - **Deprecated**: `onPut`, `onDelete`, and `level` arguments in `createDatabase`.
  - **Added**: `databaseAdapter` to replace `level`.
  - **Added**: `gitProvider` to substitute `onPut` and `onDelete`.
  - **New Package**: `tinacms-gitprovider-github`, exporting the `GitHubProvider` class.
  - **Interface Addition**: `gitProvider` added to `@tinacms/graphql`.
  - **Addition**: Generated database client.

  #### Updated `database.ts` Example

  ```typescript
  import { createDatabase, createLocalDatabase } from '@tinacms/datalayer'
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
          collectionName: 'tinacms',
          dbName: 'tinacms',
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
  import { createLocalDatabase } from '@tinacms/datalayer'
  createLocalDatabase(port)
  ```

  #### d. Consolidated Example

  - **Updated `database.{ts,js}` File**:

  ```typescript
  import { createDatabase, createLocalDatabase, GitHubProvider } from '@tinacms/datalayer';
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
  import { AbstractAuthProvider } from 'tinacms'
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

  - **New:** TinaNodeBackend is exported from `@tinacms/datalayer`. This is used to host the TinaCMS backend in a single function.
  - **New:** `LocalBackendAuthProvider` is exported from `@tinacms/datalayer`. This is used to host the TinaCMS backend locally.

  - **New:** `AuthJsBackendAuthProvider` is exported from `tinacms-authjs`. This is used to host the TinaCMS backend with AuthJS.

  ### Migrating the TinaCMS backend

  Now, instead of hosting the in /tina/api/gql.ts file, the entire TinaCMS backend (including auth) will be hosted in a single backend function.

  `/api/tina/[...routes].{ts,js}`

  ```typescript
  import { TinaNodeBackend, LocalBackendAuthProvider } from '@tinacms/datalayer'

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

- Updated dependencies [a65ca13f2]
  - @tinacms/schema-tools@1.4.14
  - @tinacms/mdx@1.3.22

## 1.4.28

### Patch Changes

- 8b8a6c96b: add error link
- Updated dependencies [693cf5bd6]
  - @tinacms/mdx@1.3.21

## 1.4.27

### Patch Changes

- 857414612: Don't log "not found" errors to the console from the GraphQL server
- a58c5b12f: Change content parsing logic to unconditionally log parse errors
- aec44a7dc: Allow backend/client to include partial queries
- Updated dependencies [b6fbab887]
- Updated dependencies [6861b5e01]
- Updated dependencies [aec44a7dc]
  - @tinacms/mdx@1.3.20
  - @tinacms/schema-tools@1.4.13

## 1.4.26

### Patch Changes

- c244d963a: Update mutation logic so that existing markdown values aren't overwritten by the Tina form, only if the schema has not defined that field
- 3b214ec6b: Fixes issue when an existing database contains sha metadata for partial reindexing and the sha is missing from the repository
- 8bd85b15e: Add "\_\_typename" to autogenerated fragments for template collections
- Updated dependencies [5040fc7cb]
  - @tinacms/mdx@1.3.19

## 1.4.25

### Patch Changes

- 1144af060: Improve error messaging when onPut / onDelete hooks throw errors
- Updated dependencies [7e4de0b2a]
- Updated dependencies [099bf5646]
- Updated dependencies [c92de7b1d]
  - @tinacms/schema-tools@1.4.12
  - @tinacms/mdx@1.3.18

## 1.4.24

### Patch Changes

- Updated dependencies [1563ce5b2]
- Updated dependencies [0e94b2725]
  - @tinacms/schema-tools@1.4.11
  - @tinacms/mdx@1.3.17

## 1.4.23

### Patch Changes

- Updated dependencies [133e97d5b]
- Updated dependencies [f02b4368b]
- Updated dependencies [8aae69436]
- Updated dependencies [a78c81f14]
- Updated dependencies [7991e097e]
  - @tinacms/schema-tools@1.4.10
  - @tinacms/mdx@1.3.16

## 1.4.22

### Patch Changes

- 0d8a19632: import isValid from 'date-fns/isValid/index.js' instead of date-fns/isValid
- bc812441b: Use .mjs extension for ES modules
- Updated dependencies [bc812441b]
  - @tinacms/schema-tools@1.4.9
  - @tinacms/mdx@1.3.15

## 1.4.21

### Patch Changes

- 94f353822: Fix to not index content where we are unable to load it due to template issues

## 1.4.20

### Patch Changes

- Updated dependencies [019920a35]
  - @tinacms/schema-tools@1.4.8
  - @tinacms/mdx@1.3.14

## 1.4.19

### Patch Changes

- 495108725: Add optional partialReindex flag to build command

## 1.4.18

### Patch Changes

- e5e29ed58: Adds \_sys property to reference fragments in autogenerated SDK
- Updated dependencies [fe13b4ed9]
  - @tinacms/schema-tools@1.4.7
  - @tinacms/mdx@1.3.13

## 1.4.17

### Patch Changes

- Updated dependencies [a94e123b6]
  - @tinacms/schema-tools@1.4.6
  - @tinacms/mdx@1.3.12

## 1.4.16

### Patch Changes

- c385b5615: Initial implementation of search functionality
- 1c78bafc2: Fix scanContentByPaths to not invoke callback when there are no nonCollectionPaths
- Updated dependencies [c385b5615]
  - @tinacms/schema-tools@1.4.5
  - @tinacms/mdx@1.3.11

## 1.4.15

### Patch Changes

- a94bf721b: Catch condition where remote schema does not exist to avoid "Invalid or incomplete introspection error" being thrown during build checks
- 52b1762e2: Prevent unhandled promise rejection when not able to determine collection for file

## 1.4.14

### Patch Changes

- e731ab0c5: Fix error "Cannot return null for non-nullable field" on boolean required fields

## 1.4.13

### Patch Changes

- ca74add40: Fix issue where an empty reference would cause an error in a list query
- 0f5557d23: Fix windows bug in folder support
- ff4c1e0f4: tina folder is default in createDatabase function. If the .tina folder is still being used then `tinaDirectory: '.tina'`, must be added to the createDatabase function.
- 6fefa56b0: Feat: Update database query to support filtering on list fields

## 1.4.12

### Patch Changes

- Updated dependencies [beb179279]
  - @tinacms/schema-tools@1.4.4
  - @tinacms/mdx@1.3.10

## 1.4.11

### Patch Changes

- 83b19fb8d: Update the bridge interface to remove properties that are no longer needed.
- 1c7998b7e: fix hasTinaMediaConfig function

## 1.4.10

### Patch Changes

- a402c8010: Fix root level collection issues including a folder related bug

## 1.4.9

### Patch Changes

- 89dcad9d9: Fix Database.get on folders within collections that have templates
- a0eb72ce0: Fix issue where collection lookup fails with folder having match property

## 1.4.8

### Patch Changes

- f14f59a96: Handle `path: "/"` in a collection
- eeedcfd30: Adds folder support in the admin. See [this PR](https://github.com/tinacms/tinacms/pull/3750) for more info and a demo.
- 7d4be0e51: Fix cyrillic characters in indexes were being incorrectly filtered out
- Updated dependencies [f14f59a96]
- Updated dependencies [eeedcfd30]
  - @tinacms/schema-tools@1.4.3
  - @tinacms/mdx@1.3.9

## 1.4.7

### Patch Changes

- 65d53d5b9: Handle frontmatter format in forestry migration
- 40d15644f: Update indexAllContent to use the passed in schema instead of fetching it from level after writing
- a6786cc73: Export dates as date format in md/mdx

## 1.4.6

### Patch Changes

- 75d5ed359: Add html tag back into rich-text response
- Updated dependencies [75d5ed359]
  - @tinacms/mdx@1.3.8

## 1.4.5

### Patch Changes

- 67c7a48b8: Improve full reindexing to update status to complete as soon as the new version of the index is ready

## 1.4.4

### Patch Changes

- ae3abe927: handle image array in Tina Cloud media transformation

## 1.4.3

### Patch Changes

- 40d908a79: Update error messages in Forestry migration
- 02a555c39: Handle block aliases on forestry migration

## 1.4.2

### Patch Changes

- af5c32eae: Fix issue where datalayer-port option wasn't being used
- 1f9f83718: Handle ambiguous templates from indexing
- a70204500: feat: Configurable template key on blocks
- Updated dependencies [a70204500]
  - @tinacms/schema-tools@1.4.2
  - @tinacms/mdx@1.3.7

## 1.4.1

### Patch Changes

- e9514656c: Don't log warning for image list
- 9a8074889: Consolidate payload transform logic
- 13b809ff5: Improve error message when a \_template property isn't one of the templates in the collection
- Updated dependencies [5fcef561d]
- Updated dependencies [9a8074889]
- Updated dependencies [c48326846]
  - @tinacms/mdx@1.3.6
  - @tinacms/schema-tools@1.4.1

## 1.4.0

### Minor Changes

- 76c984bcc: Use new API endpoint in content api reqests
- 202cd714d: Internal updates to the CLI

### Patch Changes

- 5809796cf: Adds match property to collection
- e3b58c03e: Fix error "input.replace is not a function"
- 0553035f5: Fix regression from Tina client not having referenceDepth provided
- Updated dependencies [9e86312d6]
- Updated dependencies [76c984bcc]
- Updated dependencies [5809796cf]
- Updated dependencies [54aac9017]
- Updated dependencies [5d1e0e406]
- Updated dependencies [cbc1fb919]
  - @tinacms/mdx@1.3.5
  - @tinacms/schema-tools@1.4.0

## 1.3.5

### Patch Changes

- Updated dependencies [973e83f1f]
- Updated dependencies [d1cf65999]
  - @tinacms/mdx@1.3.4
  - @tinacms/schema-tools@1.3.4

## 1.3.4

### Patch Changes

- b095d06a9: Bump esbuild versions in graphql/scripts
- Updated dependencies [290520682]
  - @tinacms/mdx@1.3.3
  - @tinacms/schema-tools@1.3.3

## 1.3.3

### Patch Changes

- 0a5297800: feat: Allow adding aliases in field configs, to export special characters like names with dashes, or fields named "id"
- 5427d03c6: Fix issue where getTemplatesForCollectable was being called with a nullable value
- Updated dependencies [3e97d978c]
- Updated dependencies [0a5297800]
- Updated dependencies [7a3e86ba1]
- Updated dependencies [f831dcf4f]
- Updated dependencies [353899de1]
- Updated dependencies [01b858e41]
  - @tinacms/mdx@1.3.2
  - @tinacms/schema-tools@1.3.3

## 1.3.2

### Patch Changes

- aa0250979: Fix issue where shortcode closing tags were backwards
- Updated dependencies [aa0250979]
- Updated dependencies [892b4e39e]
- Updated dependencies [c97ffc20d]
  - @tinacms/mdx@1.3.1
  - @tinacms/schema-tools@1.3.2

## 1.3.1

### Patch Changes

- 3bbb621cd: Fix handling of level not found to centralize it

## 1.3.0

### Minor Changes

- e15d82c2e: Minor bump MDX package for new parser

### Patch Changes

- a8457798a: Fix LevelDB initialization to throw a GraphQL error that can be handled correctly in Tina Cloud
- 94b8bb6e0: Fix update Database.get to properly handle LEVEL_NOT_FOUND errors
- e732906b6: Support .yml file extension for yaml files
- Updated dependencies [169147490]
- Updated dependencies [e732906b6]
  - @tinacms/mdx@1.3.0
  - @tinacms/schema-tools@1.3.1

## 1.2.0

### Minor Changes

- efd56e769: Replace Store with AbstractLevel in Database. Update CLI to allow user to configure Database.

### Patch Changes

- efd56e769: Remove license headers
- 50f86caed: Adds filtering to the admin IU
- Updated dependencies [efd56e769]
- Updated dependencies [efd56e769]
  - @tinacms/mdx@1.2.0
  - @tinacms/schema-tools@1.3.0

## 1.1.0

### Minor Changes

- e8776aa59: Add new GraphQL endpoint for updating a documents name

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

- b7b05d03f: Add tinaDirectory property to the database, allowing it to be configured
- 4533d5d66: Fix usse where user could not save top level empty array
- Updated dependencies [84fe97ca7]
- Updated dependencies [e7c404bcf]
  - @tinacms/schema-tools@1.2.1
  - @tinacms/datalayer@1.0.1
  - @tinacms/mdx@1.1.1

## 1.0.5

### Patch Changes

- 7d41435df: added ability to use toml in markdown frontmatter
- Updated dependencies [7d41435df]
- Updated dependencies [3165f397d]
- Updated dependencies [a68f1ac27]
- Updated dependencies [7ff63fdd9]
- Updated dependencies [b2952a298]
  - @tinacms/schema-tools@1.2.0
  - @tinacms/mdx@1.1.0
  - @tinacms/datalayer@1.0.0

## 1.0.4

### Patch Changes

- Updated dependencies [7554ea362]
- Updated dependencies [4ebc44068]
  - @tinacms/schema-tools@1.1.0
  - @tinacms/mdx@1.0.4

## 1.0.3

### Patch Changes

- de37c9eff: Content is now merged with existing content. This means if you have a field that is not defined in the schema it will not be overridden.
- Updated dependencies [7495f032b]
- Updated dependencies [de37c9eff]
  - @tinacms/schema-tools@1.0.3
  - @tinacms/mdx@1.0.3

## 1.0.2

### Patch Changes

- Updated dependencies [c91bc0fc9]
- Updated dependencies [c1ac4bf10]
  - @tinacms/schema-tools@1.0.2
  - @tinacms/mdx@1.0.2

## 1.0.1

### Patch Changes

- 94a5da311: Fix generated frags.gql missing body issue
- Updated dependencies [08e02ec21]
  - @tinacms/schema-tools@1.0.1
  - @tinacms/mdx@1.0.1

## 1.0.0

### Major Changes

- 958d10c82: Tina 1.0 Release

  Make sure you have updated to th "iframe" path: https://tina.io/blog/upgrading-to-iframe/

### Patch Changes

- Updated dependencies [958d10c82]
  - @tinacms/datalayer@1.0.0
  - @tinacms/mdx@1.0.0
  - @tinacms/schema-tools@1.0.0

## 0.63.20

### Patch Changes

- Updated dependencies [a5d6722c7]
- Updated dependencies [14c5cdffe]
  - @tinacms/schema-tools@0.2.2
  - @tinacms/mdx@0.61.17

## 0.63.19

### Patch Changes

- Updated dependencies [6c93834a2]
- Updated dependencies [4b174e14b]
  - @tinacms/schema-tools@0.2.1
  - @tinacms/mdx@0.61.16

## 0.63.18

### Patch Changes

- Updated dependencies [774abcf9c]
- Updated dependencies [245a65dfe]
  - @tinacms/schema-tools@0.2.0
  - @tinacms/mdx@0.61.15

## 0.63.17

### Patch Changes

- Updated dependencies [97f0b6472]
  - @tinacms/mdx@0.61.14

## 0.63.16

### Patch Changes

- Updated dependencies [c4f9607ce]
  - @tinacms/schema-tools@0.1.9
  - @tinacms/mdx@0.61.13

## 0.63.15

### Patch Changes

- 2422e505d: Removed styled-components as a dependency in tinacms.
  Removed deprecated react-toolbar in @tinacms/toolkit.
  - @tinacms/datalayer@0.2.4
  - @tinacms/mdx@0.61.12
  - @tinacms/schema-tools@0.1.8

## 0.63.14

### Patch Changes

- ce6c1ccfb: Fix for "callback is not a function" when running tinacms dev
- Updated dependencies [005e1d699]
  - @tinacms/schema-tools@0.1.8
  - @tinacms/mdx@0.61.12

## 0.63.13

### Patch Changes

- Updated dependencies [b1a357f60]
  - @tinacms/schema-tools@0.1.7
  - @tinacms/mdx@0.61.11

## 0.63.12

### Patch Changes

- Updated dependencies [c6e3bd321]
  - @tinacms/schema-tools@0.1.6
  - @tinacms/mdx@0.61.10

## 0.63.11

### Patch Changes

- Updated dependencies [183249b11]
- Updated dependencies [8060d0949]
  - @tinacms/schema-tools@0.1.5
  - @tinacms/mdx@0.61.9

## 0.63.10

### Patch Changes

- 0513ae416: Increase defualt file limit from 10 to 50
- 7ae1b0697: Remove duplicate TinaSchema class
- 6e137ea85: Adds cursor definition to generated queries in the client
- Updated dependencies [f581f263d]
- Updated dependencies [0513ae416]
- Updated dependencies [7ae1b0697]
- Updated dependencies [f3439ea35]
- Updated dependencies [48032e2ba]
- Updated dependencies [112b7271d]
  - @tinacms/schema-tools@0.1.4
  - @tinacms/datalayer@0.2.4
  - @tinacms/mdx@0.61.8

## 0.63.9

### Patch Changes

- f8b89379c: Fixed an issue with windows paths not working.
- Updated dependencies [9183157c4]
- Updated dependencies [4adf12619]
- Updated dependencies [f8b89379c]
  - @tinacms/schema-tools@0.1.3
  - @tinacms/mdx@0.61.7

## 0.63.8

### Patch Changes

- 87369d34c: export functions needed for indexing

## 0.63.7

### Patch Changes

- Updated dependencies [777b1e08a]
  - @tinacms/schema-tools@0.1.2
  - @tinacms/mdx@0.61.6

## 0.63.6

### Patch Changes

- 75b9a1b56: enhancement: Don't build client on tinacms audit
- 59ff1bb10: fix: fix collection fetching when paths overlap
- Updated dependencies [59ff1bb10]
- Updated dependencies [232ae6d52]
- Updated dependencies [fd4d8c8ff]
- Updated dependencies [9e5da3103]
  - @tinacms/schema-tools@0.1.1
  - @tinacms/mdx@0.61.5

## 0.63.5

### Patch Changes

- 2b60a7bd8: Improve audit so that it doesn't throw errors during the file list process. Also adds support for `--verbose` argument during `audit`.
- Updated dependencies [2b60a7bd8]
  - @tinacms/mdx@0.61.4

## 0.63.4

### Patch Changes

- Updated dependencies [1fc0e339e]
  - @tinacms/datalayer@0.2.3

## 0.63.3

### Patch Changes

- b369d7238: Update dependencies to fix vulnerabilities in external packages.
- Updated dependencies [7506a46b9]
- Updated dependencies [5fbdd05be]
  - @tinacms/mdx@0.61.3

## 0.63.2

### Patch Changes

- Updated dependencies [c6726c65b]
  - @tinacms/mdx@0.61.2

## 0.63.1

### Patch Changes

- 067c49efd: Updated generated queries to use pageInfo
- 9ba09bd0c: Fix issue where `rich-text` fields with an empty templates array generated an invalid GraphQL filter
- Updated dependencies [3d36a0e42]
  - @tinacms/mdx@0.61.1

## 0.63.0

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

- Updated dependencies [7b0dda55e]
- Updated dependencies [8183b638c]
  - @tinacms/mdx@0.61.0
  - @tinacms/schema-tools@0.1.0
  - @tinacms/datalayer@0.2.2

## 0.62.1

### Patch Changes

- 028e10686: Adding sorting in the CMS
- e27f5cce7: Update default reference depth to 2 and give warning when a large file is produced.

## 0.62.0

### Minor Changes

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

### Patch Changes

- a7dcb8d44: Generated client now resolves references. The default depth is 5 and can be modified in the `config` section of `defineSchema`.

  EX

  ```ts
  const schema = defineSchema({
    config: {
      client: {
        referenceDepth: 3,
      },
    },
    // ...
  })
  ```

  To get the old behavior set referenceDepth to `1`.

  ```ts
  const schema = defineSchema({
    config: {
      client: {
        referenceDepth: 1,
      },
    },
    // ...
  })
  ```

- Updated dependencies [870a32f18]
- Updated dependencies [dcbc57c86]
- Updated dependencies [ae06f4a96]
- Updated dependencies [660247b6b]
  - @tinacms/schema-tools@0.0.9
  - @tinacms/datalayer@0.2.2

## 0.61.3

### Patch Changes

- 0b5a8e6e7: Whitespace change to bump package

## 0.61.2

### Patch Changes

- Updated dependencies [cf0f531a1]
- Updated dependencies [b0dfc6205]
  - @tinacms/datalayer@0.2.1
  - @tinacms/schema-tools@0.0.8

## 0.61.1

### Patch Changes

- b5b0dfd66: chore: migrate from fs.rmdir -> fs.rm
- Updated dependencies [7d87eb6b7]
- Updated dependencies [67e291e56]
- Updated dependencies [ae23e9ad6]
  - @tinacms/schema-tools@0.0.7

## 0.61.0

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

- 2ef5a1f33: Use media config from the schema in the local media server
- 2ef5a1f33: Uses new `schema.config` when resolving media/asset urls
- b348f8b6b: Experimental isomorphic git bridge implementation
- fb73fb355: Renames syncFolder to a mediaRoot when configuring Repo-Based Media
- Updated dependencies [b348f8b6b]
- Updated dependencies [fb73fb355]
- Updated dependencies [4daf15b36]
  - @tinacms/datalayer@0.2.0
  - @tinacms/schema-tools@0.0.6

## 0.60.8

### Patch Changes

- 3325cd226: Make @tinacms/schema-tools a regular dependency of @tinacms/graphql

## 0.60.7

### Patch Changes

- f6cb634c2: Added an optional config key to the schema that will be used for tina cloud media store
- b1a4290e6: Use media config from the schema in the local media server
- 1955b8842: Uses new `schema.config` when resolving media/asset urls
- 8b81c3cf3: Added more context to error messages to help to user debug issues
  - @tinacms/datalayer@0.1.1

## 0.60.6

### Patch Changes

- e2aafcd93: Add more GraphQL variables to the generated queries.
- a20fed8b7: Resolve Cloud URLs to Relative URLs when saving TinaCloud's media

  Introduces a pair of functions (inside `media-utils.ts`) for handling URLs provided by TinaCloud (`resolveMediaCloudToRelative` and `resolveMediaRelativeToCloud`).

  These are used in conjuction with two pairs of functions:

  - When providing data to the preview: `resolveFieldData` and `parseMDX`
  - When saving data to the document: `buildFieldMutations` and `stringifyMDX`

  I also introduced tests around `media-utils.ts` (`media-utils.test.ts`).

## 0.60.5

### Patch Changes

- 57f09bdd7: Always use the query function when the dataLayer in enabled

## 0.60.4

### Patch Changes

- d103b27ad: Fix issue where new collections would not be added when CLI restarts

## 0.60.3

### Patch Changes

- 79d112d79: Update cli to accept tinaCloudMediaStore flag and add to metadata during schema compilation
- 3f46c6706: Fixed issue where generated SDK would not work with templates
- db9168578: Adds support for an `assetsHost` when resolving `image` fields with `useRelativeMedia`
- 91d6e6758: Fix issues with experimentalData on windows related to path separator inconsistency and interference with the .tina/**generated** folder

## 0.60.2

### Patch Changes

- 08cdb672a: Adds `useRelativeMedia` support to local graphql client
- fdbfe9a16: Fixes issue where on windows documents could not be deleted localy
- 6e2ed31a2: Added `isTitle` property to the schema that allows the title to be displayed in the CMS

## 0.60.1

### Patch Changes

- 3b11ff6ad: Add optional indexing status callback to Database

## 0.60.0

### Minor Changes

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

## 0.59.11

### Patch Changes

- 4da32454b: Modify database to write config json files without whitespace to reduce file sizes
- 921709a7e: Adds validation to the schema instead of only using typescript types
- 558cc4368: Make schema init platform-aware and refactor database put requests
- 06666d39f: Link to MDX documentation when unregistered component error occurs
- 3e2d9e43a: Adds new GraphQL `deleteDocument` mutation and logic
- Updated dependencies [a2906d6fe]
- Updated dependencies [3e2d9e43a]
  - @tinacms/datalayer@0.1.1

## 0.59.10

### Patch Changes

- cf33bcec1: Fix issue where store.clear() was not being awaited causing an invalid state after reindex

## 0.59.9

### Patch Changes

- 82174ff50: Modify Database.indexContentByPaths to not require collection parameter
- a87e1e6fa: Enable query filtering, pagination, sorting
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

- 591640db0: Fixes a bug with `breadcrumbs` to account for subfolders (instead of just the `filename`) and allows Documents to be created and updated within subfolders.

  Before this fix, `breadcrumbs` was only the `basename` of the file minus the `extension`. So `my-folder-a/my-folder-b/my-file.md` would have `breadcrumbs` of `['my-file']`. With this change, `breadcrumbs` will be `['my-folder-a','my-folder-b','my-file']` (leaving out the `content/<collection>`).

- e8b0de1f7: Add `parentTypename` to fields to allow us to disambiguate between fields which have the same field names but different types. Example, an event from field name of `blocks.0.title` could belong to a `Cta` block or a `Hero` block, both of which have a `title` field.
- Updated dependencies [8b3be903f]
- Updated dependencies [a87e1e6fa]
- Updated dependencies [b01f2e382]
  - @tinacms/datalayer@0.1.0

## 0.59.8

### Patch Changes

- e7b27ba3b: Fix issue where un-normalized rich-text fields which send `null` values to the server on save would cause a parsing error
- 11d55f441: Add experimental useGraphQLForms hook

## 0.59.7

### Patch Changes

- c730fa1dd: fix: #1452: update indexDocument to handle adding new docs
- cd0f6f022: Do not resolve all documents in `getCollection` if it is not needed

## 0.59.6

### Patch Changes

- b399c734c: Fixes support for collection.templates in graphql

## 0.59.5

### Patch Changes

- 8ad8f03fd: Select field now validates when required is true.
- 04b7988d5: Some updates to the data layer POC work
  - Don't attempt to put config files on to bridge if it's not supported
  - Split logic for indexing all content vs a subset of files
- e3c41f69d: Fixed type for `required: true` on `type: "object"`
- f5390e841: Don't attempt to put config files on to bridge if it's not supported
- 32082e0b3: GraphQL number type is changed from "Int" to "Float"

## 0.59.4

### Patch Changes

- b66aefde1: Fixed issue where one could not add a title and then a bold text
- 35884152b: Adds and audit command that checks files for errors.
- 4948beec6: Fix issues with mdx code blocks and inline code nodes

## 0.59.3

### Patch Changes

- 34cd3a44a: Fix issue where frontmatter parser would return a Date object which would be cast to epoch format
- b006a5ab9: Added delete button to image field
- a324b9c37: Export utilities for working with the data layer
- 80732bd97: Create a @tinacms/datalayer package which houses the logic for data management for the GraphQL API. This simplifies the @tinacms/graphql package and allows for a clearer separation.
- 0bec208e2: validate the schema for `path` and `matches`
- 5c070a83f: feat: Add UI banner for when in localMode

## 0.59.2

### Patch Changes

- 212685fc3: Allow indexDB to skip building the query and fragment generation files

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
