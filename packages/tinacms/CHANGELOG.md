# tinacms

## 2.5.1

### Patch Changes

- [#5284](https://github.com/tinacms/tinacms/pull/5284) [`bbfd415`](https://github.com/tinacms/tinacms/commit/bbfd415762a8b2c62b7653b497b94d67aaa8501a) Thanks [@Nopik](https://github.com/Nopik)! - Export MediaStoreClass interface

- [#5325](https://github.com/tinacms/tinacms/pull/5325) [`83a25cf`](https://github.com/tinacms/tinacms/commit/83a25cf61b736e1867d37bee37f7514d349e4427) Thanks [@JackDevAU](https://github.com/JackDevAU)! - Fix descriptions showing [Object, Object]

## 2.5.0

### Minor Changes

- [#5218](https://github.com/tinacms/tinacms/pull/5218) [`03bb823`](https://github.com/tinacms/tinacms/commit/03bb8237df87dab9da503818b839d44209263a48) Thanks [@kldavis4](https://github.com/kldavis4)! - Adds referential integrity for renaming and deleting referenced documents.

  When a document is renamed, any documents which reference the document will be updated with the new document name. When a document is deleted, the user will be warned and any references to the document will be deleted.

### Patch Changes

- [#5262](https://github.com/tinacms/tinacms/pull/5262) [`60fb710`](https://github.com/tinacms/tinacms/commit/60fb710addd539860eb7ba39196e02f3bb5f08c1) Thanks [@JackDevAU](https://github.com/JackDevAU)! - Fixes a styling issue where the delete Block Icon was invisible when using Safari (Browser)

- [#5267](https://github.com/tinacms/tinacms/pull/5267) [`f3aa146`](https://github.com/tinacms/tinacms/commit/f3aa1465423101520bd05939249228c8d8b2a0df) Thanks [@Ben0189](https://github.com/Ben0189)! - update packages jsonpath-plus and happy-dom

- Updated dependencies [[`f90ef4d`](https://github.com/tinacms/tinacms/commit/f90ef4d92ae7b21c8c610d14af9510354a3969c6), [`ac2003f`](https://github.com/tinacms/tinacms/commit/ac2003f87381de36c417d69fdb59485dc96f334a), [`03bb823`](https://github.com/tinacms/tinacms/commit/03bb8237df87dab9da503818b839d44209263a48)]:
  - @tinacms/mdx@1.5.2
  - @tinacms/schema-tools@1.6.8
  - @tinacms/search@1.0.35

## 2.4.0

### Minor Changes

- [#5246](https://github.com/tinacms/tinacms/pull/5246) [`bc59a81`](https://github.com/tinacms/tinacms/commit/bc59a819e1e68e48de027c4fac72551ca109185d) Thanks [@wicksipedia](https://github.com/wicksipedia)! - Adds html formatting support for field descriptions
  Note: wrapFieldWithError has been marked as deprecated

### Patch Changes

- [#5228](https://github.com/tinacms/tinacms/pull/5228) [`9bb408f`](https://github.com/tinacms/tinacms/commit/9bb408f1c45ecb1fd8e39faac652c4b342f74967) Thanks [@JackDevAU](https://github.com/JackDevAU)! - 🐛 fix r.join error when building pages

- [#5216](https://github.com/tinacms/tinacms/pull/5216) [`bbf2f81`](https://github.com/tinacms/tinacms/commit/bbf2f81143eb400faf8aa4dff33b8a58fa5059c8) Thanks [@Ben0189](https://github.com/Ben0189)! - - Adjust Save button position and size on iPad
  - Button size has been reduced as per feedback from @bettybondoc to improve the UI experience
- Updated dependencies [[`0daf0b6`](https://github.com/tinacms/tinacms/commit/0daf0b687b36614a1fdf904b1d5125e4c63e81a9)]:
  - @tinacms/schema-tools@1.6.7
  - @tinacms/search@1.0.34
  - @tinacms/mdx@1.5.1

## 2.3.0

### Minor Changes

- [#5098](https://github.com/tinacms/tinacms/pull/5098) [`c5dad82`](https://github.com/tinacms/tinacms/commit/c5dad82a3f1fc4f7686f1503a7894dfacffa8c36) Thanks [@Jord-Gui](https://github.com/Jord-Gui)! - Add table plugin to rich-text-editor

### Patch Changes

- [#4825](https://github.com/tinacms/tinacms/pull/4825) [`ecea7ac`](https://github.com/tinacms/tinacms/commit/ecea7ac5e1c087954eaaf873df3a563ca08f3e47) Thanks [@JackDevAU](https://github.com/JackDevAU)! - ✨ Add Mermaid Support to Rich Text Field (Plate)
  🐛 Fix tooltip rendering behind TinaCMS app

- [#5205](https://github.com/tinacms/tinacms/pull/5205) [`eb519f2`](https://github.com/tinacms/tinacms/commit/eb519f27a4c0fe1b05c361db2c1fe2337e6c4e12) Thanks [@Jord-Gui](https://github.com/Jord-Gui)! - Add Mermaid to unsupported table cell formats

- [#5204](https://github.com/tinacms/tinacms/pull/5204) [`00f6525`](https://github.com/tinacms/tinacms/commit/00f6525871c7c6bd40091424337df72c7bfcf783) Thanks [@JackDevAU](https://github.com/JackDevAU)! - lock mermaid to 9.4.0 to allow cjs

- Updated dependencies [[`c5dad82`](https://github.com/tinacms/tinacms/commit/c5dad82a3f1fc4f7686f1503a7894dfacffa8c36), [`ecea7ac`](https://github.com/tinacms/tinacms/commit/ecea7ac5e1c087954eaaf873df3a563ca08f3e47)]:
  - @tinacms/mdx@1.5.0
  - @tinacms/schema-tools@1.6.6
  - @tinacms/search@1.0.33

## 2.2.9

### Patch Changes

- [#4780](https://github.com/tinacms/tinacms/pull/4780) [`31513bb`](https://github.com/tinacms/tinacms/commit/31513bb473cd1d349a3711ef7c5075cf9d03f121) Thanks [@Ben0189](https://github.com/Ben0189)! - improve reference field selector filter and simplyfy schema needed to be written by user

- [#4991](https://github.com/tinacms/tinacms/pull/4991) [`3b2aba8`](https://github.com/tinacms/tinacms/commit/3b2aba80ac14a512592f67a04f9e1792667db9dd) Thanks [@ncn-ssw](https://github.com/ncn-ssw)! - - Correct 'window' variable definition test

- Updated dependencies [[`31513bb`](https://github.com/tinacms/tinacms/commit/31513bb473cd1d349a3711ef7c5075cf9d03f121)]:
  - @tinacms/schema-tools@1.6.5
  - @tinacms/mdx@1.4.5
  - @tinacms/search@1.0.32

## 2.2.8

### Patch Changes

- [#4843](https://github.com/tinacms/tinacms/pull/4843) [`4753c9b`](https://github.com/tinacms/tinacms/commit/4753c9b53854d19212229f985bc445b2794fad9a) Thanks [@JackDevAU](https://github.com/JackDevAU)! - ⬆️ Update Minor & Patch Dependencies Versions

- Updated dependencies [[`4753c9b`](https://github.com/tinacms/tinacms/commit/4753c9b53854d19212229f985bc445b2794fad9a)]:
  - @tinacms/mdx@1.4.4
  - @tinacms/schema-tools@1.6.4
  - @tinacms/search@1.0.31

## 2.2.7

### Patch Changes

- [#4840](https://github.com/tinacms/tinacms/pull/4840) [`113f4db`](https://github.com/tinacms/tinacms/commit/113f4db4b5d5b7d4b95d612eca56f815f41b4f8c) Thanks [@JackDevAU](https://github.com/JackDevAU)! - Attempt to fix `fs` not found issue

- [#4826](https://github.com/tinacms/tinacms/pull/4826) [`f0994c8`](https://github.com/tinacms/tinacms/commit/f0994c8f49122cd9d784bf47171715c529d2528f) Thanks [@JackDevAU](https://github.com/JackDevAU)! - ♻️ Add index to key

## 2.2.6

### Patch Changes

- [#4815](https://github.com/tinacms/tinacms/pull/4815) [`b64b046`](https://github.com/tinacms/tinacms/commit/b64b046dc67ae948513057f855b156ce0cf250d8) Thanks [@wicksipedia](https://github.com/wicksipedia)! - Rich text editor | embed dropdown - added filtering and scroll support
  Sidebar - added version number

- [#4832](https://github.com/tinacms/tinacms/pull/4832) [`6cd3596`](https://github.com/tinacms/tinacms/commit/6cd35967ab0d34851be44199bc9821b128fcfc75) Thanks [@wicksipedia](https://github.com/wicksipedia)! - Adds config options to allow users to customize position + description of filename fields

- [#4818](https://github.com/tinacms/tinacms/pull/4818) [`96bdcb7`](https://github.com/tinacms/tinacms/commit/96bdcb79b30e96056c7b19614be260a6c3ef00da) Thanks [@JackDevAU](https://github.com/JackDevAU)! - lock headlessui to version 2.1.8

- [#4803](https://github.com/tinacms/tinacms/pull/4803) [`a6a7735`](https://github.com/tinacms/tinacms/commit/a6a77351b97589c60de69445a9eb2ea57beb4343) Thanks [@kldavis4](https://github.com/kldavis4)! - Fix module not found `tinacms/dist/cache` error at runtime due to broken webpack bundling

- Updated dependencies [[`6cd3596`](https://github.com/tinacms/tinacms/commit/6cd35967ab0d34851be44199bc9821b128fcfc75), [`d08053e`](https://github.com/tinacms/tinacms/commit/d08053e758b6910afa8ab8952a40984921cccbc4)]:
  - @tinacms/schema-tools@1.6.3
  - @tinacms/mdx@1.4.3
  - @tinacms/search@1.0.30

## 2.2.5

### Patch Changes

- cf1530d: Rich text editor - add h6 support
- 2762994: Fix node 22 issues with better-sqlite3. Updates sqlite-level
- ba5f7a3: ⬆️ Update @headlessui/react from v1 to v2
- Updated dependencies [2762994]
- Updated dependencies [ba5f7a3]
  - @tinacms/search@1.0.29

## 2.2.4

### Patch Changes

- 75cf194: enable / in search for reference field selection component
- 198c280: Media Manager: Update Tina media manager to report any errors that occur during asset upload / delete operations

## 2.2.3

### Patch Changes

- 367faed: fix reference field search

## 2.2.2

### Patch Changes

- 6ccda6c: ⚗️ Experimental - added reference field filter
  Note: this will be deprecated in the near future for a more robust soution
- 33eaa81: Minor code refactor in reference field selector
- f59d67b: Media Manager - Make active item disappear on navigation and refresh
- daeeebf: Fix issue where clicking Search in the admin UI resulted in a redirect instead of loading the search results
- 27bfe84: CLI - Adds client caching and cli flag to disable: --no-client-build-cache
- Updated dependencies [6ccda6c]
- Updated dependencies [33eaa81]
  - @tinacms/schema-tools@1.6.2
  - @tinacms/mdx@1.4.2
  - @tinacms/search@1.0.28

## 2.2.1

### Patch Changes

- ae03e8e: Implementation for custom reference field selector
- 4c9f221: Fix alt tags in TinaMarkdown
- Updated dependencies [ae03e8e]
  - @tinacms/schema-tools@1.6.1
  - @tinacms/mdx@1.4.1
  - @tinacms/search@1.0.27

## 2.2.0

### Minor Changes

- 324950a: Updates Plate Editor to latest version 36.

  - Upgrades all remaining packages `Typescript` to version `^5`
  - Adds Shadcn/ui styles/colours to our `tinatailwind` config (`packages/@tinacms/cli/src/next/vite/tailwind.ts`)
  - Replaces some `lodash` deps with either the specific function i.e. `lodash.set` or implements them in a utility file
  - Updates and removes old version of plate (`plate-headless`) for latest version `^36`
  - Starts removing and cleaning up some of the old Plate code.

- ceb0c07: Add infinite scroll to the media manager

### Patch Changes

- f378f11: Add filepath to collection items
- Updated dependencies [324950a]
  - @tinacms/schema-tools@1.6.0
  - @tinacms/mdx@1.4.0
  - @tinacms/search@1.0.26

## 2.1.1

### Patch Changes

- c6e9afb: fix reference field selector styling
- d9b23fc: Improve reference field selector
- 1c69338: fix reference field search and styling
- a1a767d: add icon to reference selector
  - @tinacms/search@1.0.25

## 2.1.0

### Minor Changes

- cb83dc2: add `toolbarOverride` option to `rich-text` fields

### Patch Changes

- 1b3584c: Add cloudinary supported files to the default media upload types
- Updated dependencies [cb83dc2]
  - @tinacms/schema-tools@1.5.0
  - @tinacms/mdx@1.3.29
  - @tinacms/search@1.0.24

## 2.0.0

### Major Changes

- 957fa26: Removed deprecated useTina hook
  This was deprecated as part of the v1 release and shouldn't have been in use by anyone

### Patch Changes

- e58b951: update vulnerable packages so npm audit does not complain
- 957fa26: update to React 18
- 9076d09: update next js version from 12 to 14 in tinacms packages
- Updated dependencies [f567fc8]
- Updated dependencies [e58b951]
- Updated dependencies [957fa26]
- Updated dependencies [9076d09]
  - @tinacms/mdx@1.3.28
  - @tinacms/schema-tools@1.4.19
  - @tinacms/search@1.0.23

## 1.6.7

### Patch Changes

- 82ab066: upgrade vulnerable packages in example project, test project and peer dependency packages

## 1.6.6

### Patch Changes

- a9b461c: updated 'file has changes' indicator ui
- 3034430: Make padding between collection list page and singular pages consistent. Ensure navigation bar padding does not overlap with the burger icon on collection singular pages
- 171f5a5: Fix collections body not working with smaller screens
- fd216f3: updated TinaCloud auth modal text
- d004af2: improve error message by adding emoji
- 20f972a: Fix collections header styling for smaller screens
- 2a36b65: Remove unnecessary usage of @react-hook/window-size
- f26b40d: Allow customization of accepted media types in media manager
- Updated dependencies [f26b40d]
  - @tinacms/schema-tools@1.4.18
  - @tinacms/mdx@1.3.27
  - @tinacms/search@1.0.22

## 1.6.5

### Patch Changes

- 04f0bf3: CMS - Fix broken link in error message of CMS startup. Broken link was replaced by https://tina.io/docs/tina-cloud/overview
- 0503072: update ts, remove rimraf, fix types
- 1104006: Update tailwind to v3.4.4 + fix media manager height overflow on mobile screens
- Updated dependencies [0503072]
- Updated dependencies [dffa355]
  - @tinacms/mdx@1.3.26
  - @tinacms/schema-tools@1.4.17
  - @tinacms/search@1.0.21
  - @tinacms/sharedctx@1.0.3

## 1.6.4

### Patch Changes

- 2e3393ef5: Implement Create folder feature for tinacms.
- Updated dependencies [2e3393ef5]
  - @tinacms/schema-tools@1.4.16
  - @tinacms/mdx@1.3.25
  - @tinacms/search@1.0.20
  - @tinacms/sharedctx@1.0.2

## 1.6.3

### Patch Changes

- 66f7e2074: Cleanup
- b3ad50a62: Fix issue where rich-text nested inside JSX objects wasn't being parsed/stringified properly.
- Updated dependencies [b3ad50a62]
  - @tinacms/mdx@1.3.24
  - @tinacms/search@1.0.19

## 1.6.2

### Patch Changes

- 141e78c04: Fix for issue where content creation UI on mobile is stretched beyond the screen size by changing the style from flex-1 to w-full and then adding dynamic top padding so it doesn't conflict with hamburger menu

## 1.6.1

### Patch Changes

- 216cfff0c: Add fetch options to generated client

## 1.6.0

### Minor Changes

- c8ceba4d8: Fixes an issue where it was impossible to navigate to nested fields (e.g. object fields or list items) when editing the values for a rich-text template when that template was configured to be inline: true

## 1.5.30

### Patch Changes

- 04704e3dc: Fix incorrect call to isAuthenticated

## 1.5.29

### Patch Changes

- @tinacms/search@1.0.18

## 1.5.28

### Patch Changes

- @tinacms/search@1.0.17

## 1.5.27

### Patch Changes

- 4202c1028: Add support link in sidebar
- 64f8fa038: This extends the existing `LoginStrategy` type to include a new `LoginScreen` option. A `getLoginScreen` function can be set on the AuthProvider to display a custom login screen, rather than showing the modal popups and forcing a redirect or displaying the default username and password form. This will hopefully simplify the process of creating custom auth providers and handling user authentication when self-hosting.
- 548fe6d96: Fixes https://github.com/tinacms/tinacms/issues/4356
- 50b20f809: Fix issue where the link form would not render.
- Updated dependencies [64f8fa038]
  - @tinacms/schema-tools@1.4.15
  - @tinacms/search@1.0.16
  - @tinacms/mdx@1.3.23

## 1.5.26

### Patch Changes

- 9e1a22a53: Fix media store auth functions

## 1.5.25

### Patch Changes

- @tinacms/search@1.0.15

## 1.5.24

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
  - @tinacms/search@1.0.14
  - @tinacms/sharedctx@1.0.2

## 1.5.23

### Patch Changes

- 131b4dc55: Fix button styling issue when using Firefox
- 93bfc804a: Fix issue where \_template value was provided when creating a document from the editorial workflow
- 1fc2c4a99: Fix media manager to pass back error when upload_url fails due to existing file
- 693cf5bd6: Improve types for tables, add support for column alignment
- afd1c7c97: Fix issue where Saved Changes indicator is not updated after a successful submit on a form
- a937aabf0: Add support for build.basePath to be an environment variable
- 661239b2a: update final form to fix peer deps issues
- 630ab9436: No longer treat user touch event as pending change for rich-text fields
- Updated dependencies [693cf5bd6]
  - @tinacms/mdx@1.3.21
  - @tinacms/search@1.0.13

## 1.5.22

### Patch Changes

- b6fbab887: Add support for basic markdown tables.

  ### Usage

  ```ts
  // tina/config.ts
  import `tinaTableTemplate` from `tinacms`

  // add it to the rich-text template
    {
      type: 'rich-text',
      label: 'Body',
      name: '_body',
      templates: [
        tinaTableTemplate
      ///
  ```

  Customize the `th` and `td` fields in the `<TinaMarkdown>` component:

  ```tsx
  <TinaMarkdown
    content={props.body}
    components={{
      th: (props) => <th className="bg-gray-100 font-bold" {...props} />,
      td: (props) => <td className="bg-gray-100" {...props} />,
    }}
  />
  ```

  To control the rendering for `

- 4ae43fdde: UX improvements for editor link plugin
- aec44a7dc: Allow backend/client to include partial queries
- Updated dependencies [b6fbab887]
- Updated dependencies [939147364]
- Updated dependencies [6861b5e01]
- Updated dependencies [aec44a7dc]
  - @tinacms/mdx@1.3.20
  - @tinacms/search@1.0.12
  - @tinacms/schema-tools@1.4.13

## 1.5.21

### Patch Changes

- 177002715: Fix/media thumbnail
- e69a3ef81: fix: Fix active form on nested group when value is empty
- c925786ef: Fix issue with undo/redo in rich-text editor
- 9f01550dd: Fix issue where deeply nested mdx fields were not picking up the correct template"
  - @tinacms/search@1.0.11

## 1.5.20

### Patch Changes

- 7e4de0b2a: Improvements to error handling with auth
- 1144af060: Improve error messaging when onPut / onDelete hooks throw errors
- Updated dependencies [7e4de0b2a]
- Updated dependencies [099bf5646]
- Updated dependencies [c92de7b1d]
  - @tinacms/schema-tools@1.4.12
  - @tinacms/search@1.0.10

## 1.5.19

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

- e83ba8855: Update generated client to work in an edge runtime
- Updated dependencies [1563ce5b2]
  - @tinacms/schema-tools@1.4.11
  - @tinacms/search@1.0.9

## 1.5.18

### Patch Changes

- 9c27087fb: Show filter/search inputs on collections with templates instead of fields
- 65d0a701f: Show search input even when collection contains only non-filterable fields
- 133e97d5b: Update the before submit types to not pass the finalForm form since it is contained in the TinaForm
- f02b4368b: Adds a second parameter to the slugify function that passes the current collection and template.
- 37cf8bd40: Updated so a user can add an absolute path to the filename

  Before all files where created reletive to the users current folder and we gave an error if the filename started with a `/`.

  Now we check if the filename starts with a `/` and if it does we use that as the absolute path to the file.

  Demo: https://www.loom.com/share/5256114d1ce648eda69881e33f8f6bd4?sid=3eafb588-c4da-49eb-ace2-d6b02313e14c

- ad22e0950: Consolidate tailwind usage
- 8db979b9f: Add support for "static" setting in Tina media, which preprocesses the available media files and disables uploads and deletions of media from the CMS.
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

- 30c7eac58: Do not show tina cloud link when self hosting
- 121bd9fc4: Absorb @tinacms/toolkit into tinacms

  fix: Use clean page-sizes on media manager (to make pagination more obvious)

  Fix issue with uploading media in a folder with tina cloud

- Updated dependencies [133e97d5b]
- Updated dependencies [f02b4368b]
- Updated dependencies [7991e097e]
  - @tinacms/schema-tools@1.4.10
  - @tinacms/search@1.0.8
  - @tinacms/sharedctx@1.0.2

## 1.5.17

### Patch Changes

- bc812441b: Use .mjs extension for ES modules
- Updated dependencies [bc812441b]
  - @tinacms/schema-tools@1.4.9
  - @tinacms/sharedctx@1.0.2
  - @tinacms/toolkit@1.7.13
  - @tinacms/search@1.0.7

## 1.5.16

### Patch Changes

- 1889422b0: Fix issue where deeply nested rich-text fields weren't selectable
- Updated dependencies [1889422b0]
- Updated dependencies [ad6a166a6]
  - @tinacms/toolkit@1.7.12
  - @tinacms/search@1.0.6

## 1.5.15

### Patch Changes

- Updated dependencies [019920a35]
  - @tinacms/schema-tools@1.4.8
  - @tinacms/search@1.0.5
  - @tinacms/toolkit@1.7.11

## 1.5.14

### Patch Changes

- f1e8828c8: fix: resort prop overrides to allow for style & className merging of list items
- 304e23318: - Update pull request title to include the branch name
  - Slugify brach name when typing in the title
- Updated dependencies [f1e8828c8]
- Updated dependencies [304e23318]
- Updated dependencies [a5d986477]
  - @tinacms/toolkit@1.7.10

## 1.5.13

### Patch Changes

- 495108725: Disable tina cloud specific calls when using custom content api
- b0eba5d49: Upgrade prism react renderer, allow for theming
- Updated dependencies [d73d03f8f]
- Updated dependencies [745e30708]
- Updated dependencies [495108725]
- Updated dependencies [7d6e6ff3d]
- Updated dependencies [808d5cc6c]
  - @tinacms/toolkit@1.7.9
  - @tinacms/search@1.0.4

## 1.5.12

### Patch Changes

- Updated dependencies [f6efd498e]
  - @tinacms/toolkit@1.7.8

## 1.5.11

### Patch Changes

- c7fa6ddc0: Add dev-tools export to make it easy to see Tina data when building a page
- 6e192cc38: Improve type signature for tinaField so potentially null fields don't show a Typescript error
- 5aaae9902: Clear the search state when switching between collections
- Updated dependencies [fe13b4ed9]
- Updated dependencies [812df6ace]
- Updated dependencies [8710dec4b]
  - @tinacms/schema-tools@1.4.7
  - @tinacms/search@1.0.3
  - @tinacms/toolkit@1.7.7

## 1.5.10

### Patch Changes

- Updated dependencies [ee9acb5e5]
- Updated dependencies [a94e123b6]
  - @tinacms/search@1.0.2
  - @tinacms/schema-tools@1.4.6
  - @tinacms/toolkit@1.7.6

## 1.5.9

### Patch Changes

- c385b5615: Initial implementation of search functionality
- d2ddfa5a6: Remove type: module from TinaCMS package
- 9489d5d47: Add `{type: "module"}` to tinacms package
- Updated dependencies [c385b5615]
  - @tinacms/schema-tools@1.4.5
  - @tinacms/toolkit@1.7.5
  - @tinacms/search@1.0.1

## 1.5.8

### Patch Changes

- Updated dependencies [cc621f665]
  - @tinacms/toolkit@1.7.4

## 1.5.7

### Patch Changes

- 385c8a865: Update Media Manager to sync media from Cloud dashboard
- ccd928bc3: Fix to decode the folder name from the url
- Updated dependencies [70c74bb55]
- Updated dependencies [385c8a865]
- Updated dependencies [1aea2c6a4]
  - @tinacms/toolkit@1.7.3

## 1.5.6

### Patch Changes

- 5a6018916: Add support for "quick editing". By adding the `[data-tina-field]` attribute to your elements, editors can click to see the
  correct form and field focused in the sidebar.

  This work closely resembles the ["Active Feild Indicator"](https://tina-io-git-quick-edit-tinacms.vercel.app/docs/editing/active-field-indicator/) feature.
  Which will be phased in out place of this in the future. Note that the attribute name is different, `[data-tinafield]` is the value
  for the "Active Field Indicator" while `[data-tina-field]` is the new attribute.

  The `tinaField` helper function should now only be used with the `[data-tina-field]` attibute.

  Adds experimental support for Vercel previews, the `useVisualEditing` hook from `@tinacms/vercel-previews` can be used
  to activate edit mode and listen for Vercel edit events.

- Updated dependencies [63dd98904]
- Updated dependencies [b3d98d159]
- Updated dependencies [7f95c1ce5]
  - @tinacms/toolkit@1.7.2

## 1.5.5

### Patch Changes

- Updated dependencies [beb179279]
  - @tinacms/schema-tools@1.4.4

## 1.5.4

### Patch Changes

- f6e2ec5e9: fix issue with single document naviation

## 1.5.3

### Patch Changes

- 3532d07f3: fix issue where a user was unable to create a document with templates
- 6d1465fd8: Fix auto navigate logic in GetCollection to only be active for Documents and not Folders

## 1.5.2

### Patch Changes

- e7f4c0a96: Fix issue where sortFields are undefined
- ff8673515: Trim whitespace from readonly token to ignore any accidental whitespace from cut and paste

## 1.5.1

### Patch Changes

- 790b1e1ae: Fix issue where contextual editing was not working for singleton collection
- eba7e5e5e: Simplify formify logic
- Updated dependencies [eba7e5e5e]
  - @tinacms/toolkit@1.7.1

## 1.5.0

### Minor Changes

- eeedcfd30: Adds folder support in the admin. See [this PR](https://github.com/tinacms/tinacms/pull/3750) for more info and a demo.

### Patch Changes

- 675c4cfde: Fixes [this type issue](https://github.com/tinacms/tinacms/issues/3799)
- 40dd5b7ef: Show a simple message to editors to alert them to the fact that sorting by a non-required field can exclude some documents. The message will only appear when an editor actually runs a sort using a non-required field. The original issue issue is visible in this video: https://www.loom.com/share/244853da315e4f959ebf371d662192dd
- 0f90e9520: Fix routing issues with the folder update.
  - Back button goes back to the folder you were in
  - Admin navigation works as expected
- d9d773a24: feat: Add ability to duplicate documents
- 63454fa1e: Fix: do not set Authorization header if token not present
- Updated dependencies [f14f59a96]
- Updated dependencies [eeedcfd30]
- Updated dependencies [804639965]
  - @tinacms/schema-tools@1.4.3
  - @tinacms/toolkit@1.7.0

## 1.4.6

### Patch Changes

- 709b6f2ec: Fix template menu UI, image delete button
- Updated dependencies [709b6f2ec]
  - @tinacms/toolkit@1.6.4

## 1.4.5

### Patch Changes

- 75d5ed359: Add html tag back into rich-text response

## 1.4.4

### Patch Changes

- 7c750e370: Fix the initialization of sort order in collection list when previous desc sort order in local storage
- Updated dependencies [2a32a0b99]
- Updated dependencies [6f491f38c]
  - @tinacms/toolkit@1.6.3

## 1.4.3

### Patch Changes

- 1370ebae6: Update branching refresh logic to not refresh when a new branch is created. Instead it will be added to the list of branches in memory
- Updated dependencies [1370ebae6]
  - @tinacms/toolkit@1.6.2

## 1.4.2

### Patch Changes

- 0626ba381: If you have a collection with

  ```ts
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    }
  },
  ```

  and it only contains one document. Instead of navigating to the collection list page it will navigate to the document edit page.

- Updated dependencies [a70204500]
  - @tinacms/schema-tools@1.4.2

## 1.4.1

### Patch Changes

- 9a8074889: Consolidate payload transform logic
- d0c4801b7: cancel index polling when component is unmounted
- Updated dependencies [9a8074889]
- Updated dependencies [d0c4801b7]
- Updated dependencies [c48326846]
  - @tinacms/schema-tools@1.4.1
  - @tinacms/toolkit@1.6.1

## 1.4.0

### Minor Changes

- 76c984bcc: Use new API endpoint in content api reqests

### Patch Changes

- 202cd714d: Internal updates to the CLI
- Updated dependencies [084a39d2c]
- Updated dependencies [76c984bcc]
- Updated dependencies [5809796cf]
- Updated dependencies [785748400]
- Updated dependencies [54aac9017]
  - @tinacms/toolkit@1.6.0
  - @tinacms/schema-tools@1.4.0
  - @tinacms/sharedctx@1.0.1

## 1.3.3

### Patch Changes

- Updated dependencies [973e83f1f]
- Updated dependencies [d1cf65999]
  - @tinacms/toolkit@1.5.2
  - @tinacms/schema-tools@1.3.4

## 1.3.2

### Patch Changes

- Updated dependencies [f07d8f165]
  - @tinacms/toolkit@1.5.1

## 1.3.1

### Patch Changes

- Updated dependencies [ee4543ea5]
- Updated dependencies [817b10b8a]
- Updated dependencies [743246851]
  - @tinacms/toolkit@1.5.0
  - @tinacms/schema-tools@1.3.3
  - @tinacms/sharedctx@1.0.1

## 1.3.0

### Minor Changes

- 4cd5cd4f7: Refactor: Remove previewSrc from imageAPI

### Patch Changes

- 964a6985b: Remove warning about TinaProvider
- 9c277e179: fix: make rich text errors scrollable
- 8d5c923c7: fix: When current branch doesn't exist, handle error more gracefully
- Updated dependencies [be3eac32f]
- Updated dependencies [4cd5cd4f7]
- Updated dependencies [9cf869d40]
- Updated dependencies [0a5297800]
- Updated dependencies [9c277e179]
- Updated dependencies [7a3e86ba1]
- Updated dependencies [8d5c923c7]
- Updated dependencies [353899de1]
- Updated dependencies [01b858e41]
- Updated dependencies [0b7687424]
  - @tinacms/toolkit@1.4.0
  - @tinacms/schema-tools@1.3.3
  - @tinacms/sharedctx@1.0.1

## 1.2.2

### Patch Changes

- 0e6093a8d: Fixes branch switcher accessed from the branch banner, adds indexing status to branch list, improves UI clarity.
- 9d38f4b78: Only redirect to preview if the user is using a router.

  See [this video](https://www.loom.com/share/69345c21c3f94c57997ac0a19c9768a8) for more details.

- b984f1a7c: Fixes the error when a user clears the date filter input
- 071b8fe59: remove schema info log when schema in up to date
- c97ffc20d: Add schema checks to ensure the local and server schema are the same.
- Updated dependencies [0e6093a8d]
- Updated dependencies [892b4e39e]
- Updated dependencies [c97ffc20d]
  - @tinacms/toolkit@1.3.4
  - @tinacms/schema-tools@1.3.2

## 1.2.1

### Patch Changes

- bb7f00db1: Fix issue where collections would not refresh if you chose the "None" filter after selecting a filter
- 42536f6e2: Groups filter inputs in a form so pressing 'enter' will filter the collection list
- 5d024e4f1: Add branch banner to sidebar and admin
- Updated dependencies [f1f3938d9]
- Updated dependencies [e732906b6]
- Updated dependencies [5d024e4f1]
  - @tinacms/toolkit@1.3.3
  - @tinacms/schema-tools@1.3.1

## 1.2.0

### Minor Changes

- efd56e769: Replace Store with AbstractLevel in Database. Update CLI to allow user to configure Database.

### Patch Changes

- efd56e769: Remove license headers
- 50f86caed: Adds filtering to the admin IU
- Updated dependencies [efd56e769]
- Updated dependencies [efd56e769]
- Updated dependencies [50f86caed]
  - @tinacms/schema-tools@1.3.0
  - @tinacms/sharedctx@1.0.1
  - @tinacms/toolkit@1.3.2

## 1.1.5

### Patch Changes

- Updated dependencies [09e716538]
  - @tinacms/toolkit@1.3.1

## 1.1.4

### Patch Changes

- Updated dependencies [84fe97ca7]
- Updated dependencies [b4facb6ca]
- Updated dependencies [e7c404bcf]
- Updated dependencies [e8776aa59]
- Updated dependencies [e019a200a]
  - @tinacms/schema-tools@1.2.1
  - @tinacms/toolkit@1.3.0

## 1.1.3

### Patch Changes

- Updated dependencies [c627ebe92]
- Updated dependencies [7d41435df]
- Updated dependencies [3165f397d]
- Updated dependencies [ef7c4043a]
- Updated dependencies [b2952a298]
  - @tinacms/toolkit@1.2.1
  - @tinacms/schema-tools@1.2.0
  - @tinacms/sharedctx@1.0.0

## 1.1.2

### Patch Changes

- cd82190fb: Adding warning for billing
- Updated dependencies [7554ea362]
- Updated dependencies [a8c2f674b]
- Updated dependencies [cd82190fb]
- Updated dependencies [4ebc44068]
  - @tinacms/schema-tools@1.1.0
  - @tinacms/toolkit@1.2.0

## 1.1.1

### Patch Changes

- 7495f032b: Added `onLogout` hook function and a logout redirect page in the admin
- 64599e300: Enable custom component for lic in TinaMarkdown
- de693ea17: remove network request for redundant collection fetch
- Updated dependencies [7495f032b]
- Updated dependencies [de37c9eff]
- Updated dependencies [de693ea17]
  - @tinacms/schema-tools@1.0.3
  - @tinacms/toolkit@1.1.1

## 1.1.0

### Minor Changes

- 11b32f712: Enable custom component for text in TinaMarkdown

## 1.0.2

### Patch Changes

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

- Updated dependencies [5a1e6faaf]
- Updated dependencies [c91bc0fc9]
- Updated dependencies [7c1425a82]
- Updated dependencies [c1ac4bf10]
  - @tinacms/toolkit@1.1.0
  - @tinacms/schema-tools@1.0.2

## 1.0.1

### Patch Changes

- 93234705a: Better user experience when the document creation fails due to existing filename
- Updated dependencies [8a92941bb]
- Updated dependencies [08e02ec21]
- Updated dependencies [03d83633b]
- Updated dependencies [93234705a]
- Updated dependencies [55ab9c26c]
  - @tinacms/toolkit@1.0.1
  - @tinacms/schema-tools@1.0.1

## 1.0.0

### Major Changes

- 958d10c82: Tina 1.0 Release

  Make sure you have updated to th "iframe" path: https://tina.io/blog/upgrading-to-iframe/

### Patch Changes

- Updated dependencies [958d10c82]
  - @tinacms/schema-tools@1.0.0
  - @tinacms/sharedctx@1.0.0
  - @tinacms/toolkit@1.0.0

## 0.70.2

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

- Updated dependencies [a5d6722c7]
  - @tinacms/schema-tools@0.2.2

## 0.70.1

### Patch Changes

- 6c93834a2: Update config and schema types
- b12957885: Nest `defaultItem` under UI
- Updated dependencies [6c93834a2]
  - @tinacms/schema-tools@0.2.1

## 0.70.0

### Minor Changes

- 774abcf9c: - `staticConfig` becomes `defineConfig`
  - `defineConfig` becomes `defineLegacyConfig`
  - Deprecate `config` property in the schema

### Patch Changes

- 2e0a98d61: Improve types on TinaMarkdown
- f7d3cf532: Add useEditState hook
- c3f307f46: Add deprecation warnings on pre-iframe apis
- 0ead00fa8: Fix warning about missing "encoding" dependency
- 8f28bfbd5: Fix the option labels
- Updated dependencies [774abcf9c]
- Updated dependencies [245a65dfe]
- Updated dependencies [7dda334e5]
  - @tinacms/schema-tools@0.2.0
  - @tinacms/toolkit@0.58.5

## 0.69.22

### Patch Changes

- Updated dependencies [6ce6085e8]
  - @tinacms/toolkit@0.58.4

## 0.69.21

### Patch Changes

- Updated dependencies [48de42bc0]
  - @tinacms/toolkit@0.58.3

## 0.69.20

### Patch Changes

- 97f0b6472: Add raw editor support for static mode. Use `~` for preview path.
- Updated dependencies [194123d26]
  - @tinacms/toolkit@0.58.2

## 0.69.19

### Patch Changes

- c4f9607ce: Add validation to schema
- Updated dependencies [c4f9607ce]
  - @tinacms/schema-tools@0.1.9

## 0.69.18

### Patch Changes

- 31a2fefed: Fix text truncation in list and modal
- 009fe3180: Re-export helper utilities from @tinacms/schema-tools
- Updated dependencies [31a2fefed]
  - @tinacms/toolkit@0.58.1
  - @tinacms/schema-tools@0.1.8
  - @tinacms/sharedctx@0.1.3

## 0.69.17

### Patch Changes

- 2422e505d: Removed styled-components as a dependency in tinacms.
  Removed deprecated react-toolbar in @tinacms/toolkit.
- Updated dependencies [2422e505d]
- Updated dependencies [431d73980]
  - @tinacms/toolkit@0.58.0
  - @tinacms/schema-tools@0.1.8
  - @tinacms/sharedctx@0.1.3

## 0.69.16

### Patch Changes

- Updated dependencies [005e1d699]
- Updated dependencies [46bc9c4e5]
  - @tinacms/schema-tools@0.1.8
  - @tinacms/toolkit@0.57.12

## 0.69.15

### Patch Changes

- 0c8c571d5: Custom filename field component, fix text field classes
- Updated dependencies [b1a357f60]
- Updated dependencies [0c8c571d5]
  - @tinacms/schema-tools@0.1.7
  - @tinacms/toolkit@0.57.11

## 0.69.14

### Patch Changes

- c6e3bd321: Fix issue where slugify function breaks templates
- Updated dependencies [c6e3bd321]
- Updated dependencies [a60d96862]
  - @tinacms/schema-tools@0.1.6
  - @tinacms/toolkit@0.57.10

## 0.69.13

### Patch Changes

- ea4a8e1b0: Fixed issue where filename would not always update.

## 0.69.12

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

- Updated dependencies [183249b11]
- Updated dependencies [8060d0949]
  - @tinacms/schema-tools@0.1.5
  - @tinacms/toolkit@0.57.9

## 0.69.11

### Patch Changes

- Updated dependencies [eeab510d9]
  - @tinacms/toolkit@0.57.8

## 0.69.10

### Patch Changes

- Updated dependencies [4dc971b95]
  - @tinacms/toolkit@0.57.7

## 0.69.9

### Patch Changes

- Updated dependencies [566386f30]
  - @tinacms/toolkit@0.57.6

## 0.69.8

### Patch Changes

- 0513ae416: Increase defualt file limit from 10 to 50
- 64c40e6fc: change hardcoded content api url to be dynamic
- f3439ea35: Replace loading message and hide forms while loading.
- 48032e2ba: Use tinaio url config override in the client
- 112b7271d: fix vulnerabilities
- 8688dbff9: Add links to Tina Cloud project setting from sidebar
- Updated dependencies [4b9a2252f]
- Updated dependencies [f581f263d]
- Updated dependencies [4e0a609cd]
- Updated dependencies [fd90b7f49]
- Updated dependencies [7ae1b0697]
- Updated dependencies [ee354c708]
- Updated dependencies [f3439ea35]
- Updated dependencies [48032e2ba]
- Updated dependencies [112b7271d]
- Updated dependencies [4efe31214]
- Updated dependencies [8688dbff9]
  - @tinacms/toolkit@0.57.5
  - @tinacms/schema-tools@0.1.4
  - @tinacms/sharedctx@0.1.3

## 0.69.7

### Patch Changes

- 9183157c4: This allows us to use a leaner `define` function for the standalone config. Right now we're balancing a lot on the `defineSchema/defineConfig` types and have a few overlapping things like `client`, which accepts both an optional object with `referenceDepth` config as well as the autogenerated http client.

  One thing it does that's a bit different is it uses the `apiUrl` from the client generation function and sends it through as a global constant to the Vite app, this avoids the need for the generated `client`.

- 4adf12619: Add support for experimental iframe mode
- Updated dependencies [9183157c4]
- Updated dependencies [4adf12619]
- Updated dependencies [f8b89379c]
  - @tinacms/schema-tools@0.1.3
  - @tinacms/toolkit@0.57.4

## 0.69.6

### Patch Changes

- Updated dependencies [777b1e08a]
  - @tinacms/schema-tools@0.1.2

## 0.69.5

### Patch Changes

- bf89a3720: allow boolean fields in admin collection list sort control
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

- e650bc571: User interface for synchronization log event display
- Updated dependencies [59ff1bb10]
- Updated dependencies [232ae6d52]
- Updated dependencies [1dd9d01e2]
- Updated dependencies [fd4d8c8ff]
- Updated dependencies [54dd48115]
- Updated dependencies [e650bc571]
- Updated dependencies [9e5da3103]
  - @tinacms/schema-tools@0.1.1
  - @tinacms/toolkit@0.57.3

## 0.69.4

### Patch Changes

- 5029265ed: Fixes an issue where collections which used `templates` would error on the admin list page due to the recent addition of filters. Filters will only work for collections with `fields` at this time
- 2b60a7bd8: Fix handling of formify for template collections when `...on Document` is used

## 0.69.3

### Patch Changes

- 0ad8075aa: Errors are now blocking modals.
- Updated dependencies [0ad8075aa]
  - @tinacms/toolkit@0.57.2

## 0.69.2

### Patch Changes

- b369d7238: Update dependencies to fix vulnerabilities in external packages.
- 541605aa8: Fix list page breaking for templates on collection
- 2182dc2a6: Allow paths to start with numeric characters
- Updated dependencies [b369d7238]
  - @tinacms/toolkit@0.57.1

## 0.69.1

### Patch Changes

- 9ea28113e: Fixes an issue where `collections` with `templates` weren't generating forms in the sidebar

## 0.69.0

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

- Updated dependencies [7b0dda55e]
- Updated dependencies [8183b638c]
  - @tinacms/schema-tools@0.1.0
  - @tinacms/toolkit@0.57.0
  - @tinacms/sharedctx@0.1.2

## 0.68.15

### Patch Changes

- 028e10686: Adding sorting in the CMS
- Updated dependencies [028e10686]
  - @tinacms/toolkit@0.56.37

## 0.68.14

### Patch Changes

- 329b72e7a: fix types in createClient
- ef94f2b59: BREAKING CHANGE: Deprecate dated defineConfig use:
  - clientId & branch should instead be passed to defineSchema.
  - defineConfig now needs to take in the client.
    See tina.io for upgrade details: https://tina.io/blog/tina-v-0.69.0
- 7334ec5be: Client now throws an error when a non 200 status code is returned.
- Updated dependencies [870a32f18]
- Updated dependencies [090a5b995]
- Updated dependencies [660247b6b]
  - @tinacms/schema-tools@0.0.9
  - @tinacms/toolkit@0.56.36

## 0.68.13

### Patch Changes

- b0dfc6205: Fixed bug where objects where not being copied
- Updated dependencies [b0dfc6205]
  - @tinacms/schema-tools@0.0.8

## 0.68.12

### Patch Changes

- 7d87eb6b7: Add `loadCustomStore` to top schema config
- 67e291e56: Add support for ES modules
- f3c6b0f36: Fix an issue where changes to a field weren't reflected on the page when typing quickly
- 7a45e4e12: Added a media sync button that adds new media to tina-cloud. This button only appears when you are not in local mode and have the new media store enable
- Updated dependencies [7d87eb6b7]
- Updated dependencies [67e291e56]
- Updated dependencies [7a45e4e12]
- Updated dependencies [ae23e9ad6]
- Updated dependencies [489be9cb1]
  - @tinacms/schema-tools@0.0.7
  - @tinacms/sharedctx@0.1.2
  - @tinacms/toolkit@0.56.35

## 0.68.11

### Patch Changes

- 42af73648: Adds more useful error messages from internalClient
- Updated dependencies [ea9c190e8]
  - @tinacms/toolkit@0.56.34

## 0.68.10

### Patch Changes

- d95b73974: Fix collection list page delete modal
- 7b77fe1b5: Add a default TinaMediaStore for repo-based media
- Updated dependencies [2ef5a1f33]
- Updated dependencies [fb73fb355]
- Updated dependencies [7b77fe1b5]
- Updated dependencies [99a13024d]
  - @tinacms/toolkit@0.56.33
  - @tinacms/schema-tools@0.0.6
  - @tinacms/sharedctx@0.1.1

All notable changes to `tinacms/packages/tinacms` will be documented in this file.

Note: For root tinacms changes, please refer to the [CHANGELOG.md](https://github.com/tinacms/tinacms/CHANGELOG.md) specific to root `tinacms`.

## 0.68.9

### Patch Changes

- 1f7d3ca3d: Use custom wrapper class for tailwind type plugin
- cceef726e: Fix login ui issue
- Updated dependencies [1f7d3ca3d]
- Updated dependencies [f6cb634c2]
- Updated dependencies [6c17f0160]
- Updated dependencies [cceef726e]
  - @tinacms/toolkit@0.56.32
  - @tinacms/schema-tools@0.0.5
  - @tinacms/sharedctx@0.1.1

## 0.68.8

### Patch Changes

- 999f0895a: Set font family on heading elements
- 41be5e7fc: Fixes subitem links to use breadcrumbs
- Updated dependencies [999f0895a]
  - @tinacms/toolkit@0.56.31

## 0.68.7

### Patch Changes

- aaaa5bb09: Added pagination to the CMS
- e06dbb3ca: Adds `waitForDB` cmd to cli
- Updated dependencies [aaaa5bb09]
  - @tinacms/toolkit@0.56.30

## 0.68.6

### Patch Changes

- 2cc206b1a: Improve mobile nav behaviour
- 8998df207: fix: update tina client with the current branch from local storage
- Updated dependencies [58a7a00f7]
- Updated dependencies [2cc206b1a]
- Updated dependencies [aaadefd2d]
  - @tinacms/toolkit@0.56.29

## 0.68.5

### Patch Changes

- 646cad8da: Adds support for using the generated client on the frontend
- f857616f6: Rename sdk to queries
- 6e2ed31a2: Added `isTitle` property to the schema that allows the title to be displayed in the CMS
- Updated dependencies [a196198bd]
- Updated dependencies [57a4a3789]
- Updated dependencies [6e2ed31a2]
- Updated dependencies [ba1499029]
  - @tinacms/toolkit@0.56.28
  - @tinacms/schema-tools@0.0.4

## 0.68.4

### Patch Changes

- 7372f90ca: Adds a new client that can be used on the backend and frontend.
- Updated dependencies [d4f98d0fc]
- Updated dependencies [7e2272442]
  - @tinacms/toolkit@0.56.27

## 0.68.3

### Patch Changes

- 8b7ee346a: - Display label instead of name for mdx dropdown af306fa
  - Fix issue where reset triggered chagnes to the wrong rich-text field 03f6191
  - Fix issue where null children in a code block threw an error e454bce
- Updated dependencies [f6f56bcc0]
- Updated dependencies [59d33a74a]
- Updated dependencies [8b7ee346a]
- Updated dependencies [acb38bf9f]
  - @tinacms/toolkit@0.56.26

## 0.68.2

### Patch Changes

- Updated dependencies [e90647da3]
  - @tinacms/toolkit@0.56.25

## 0.68.1

### Patch Changes

- 41d666f9a: Styles list page overflow menu, removes unused prop
- e5a1152f2: Fix issue where pages that didnt use `useTina` would get a loading spinner that hangs
- Updated dependencies [41d666f9a]
  - @tinacms/toolkit@0.56.24

## 0.68.0

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

### Patch Changes

- Updated dependencies [6a6f137ae]
  - @tinacms/toolkit@0.56.23

## 0.67.4

### Patch Changes

- 168f6cc6e: Update delete modal header
- 2a6060138: Fix url parsing issue when a branch name contained a `/`
- 3af3d6787: Fix issues with finding the template for multitemplate collections
- Updated dependencies [bf5fe0074]
  - @tinacms/toolkit@0.56.22

## 0.67.3

### Patch Changes

- Updated dependencies [d37562999]
  - @tinacms/toolkit@0.56.21

## 0.67.2

### Patch Changes

- 40afac061: updated @headlessui/react
- Updated dependencies [40afac061]
  - @tinacms/toolkit@0.56.20

## 0.67.1

### Patch Changes

- 921709a7e: Adds validation to the schema instead of only using typescript types
- 3e2d9e43a: Adds new GraphQL `deleteDocument` mutation and logic
- Updated dependencies [921709a7e]
  - @tinacms/schema-tools@0.0.3

## 0.67.0

### Minor Changes

- 86651039b: Updates to the way forms are generated in contextual editing. This lays the groundwork for
  future updates but doesn't offer new behavior yet. It does come with a small breaking change:

  [BREAKING]: The `id` of forms is now the actual document `path`. Previously this was the name of the GraphQL query node (eg. `getPostDocument`).
  If you're using the [`formifyCallback`](https://tina.io/docs/advanced/customizing-forms/#customizing-a-form) prop to create global forms, you'll probably need to update the callback to check for the appropriate id.

  Eg. `formConfig.id === 'getSiteNavsDocument'` should be something like `formConfig.id === 'content/navs/mynav.md'`

  If you're experiencing any issues with contextual editing, you can disable this flag for now by specifying `cms.flags.set('use-unstable-formify', false)`.

## 0.66.10

### Patch Changes

- 39a8c4f7d: Fix issue with unstableFormify where `Document` interface fields were not being formified properly
- ec28a129b: Update to tina admin to use the frontend schema
- a28b787c5: With the rich-text editor, inserting a soft-break (`shift+enter`), this will now result in a `<br>` tag being inserted. Note that this will save the markdown with a backslash to indicate line break (instead of multiple empty spaces):

  ```markdown
  123 Abc St\
  Charlottetown, PEI
  ```

- 93363dfc2: Prevent error on reset when nested blocks have changed in unstable formify hook
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

- 875779ac6: Don't attempt to formify nodes which don't have data fields (ie. ...on Node)
- e8b0de1f7: Add `parentTypename` to fields to allow us to disambiguate between fields which have the same field names but different types. Example, an event from field name of `blocks.0.title` could belong to a `Cta` block or a `Hero` block, both of which have a `title` field.
- Updated dependencies [429d8e93e]
- Updated dependencies [6c517b5da]
- Updated dependencies [e81cf8867]
- Updated dependencies [abf25c673]
- Updated dependencies [801f39f62]
- Updated dependencies [0e270d878]
- Updated dependencies [e8b0de1f7]
  - @tinacms/sharedctx@0.1.1
  - @tinacms/toolkit@0.56.19
  - @tinacms/schema-tools@0.0.2

## 0.66.9

### Patch Changes

- 91d5a6073: Allow "." in file names
- 11d55f441: Add experimental useGraphQLForms hook
- f41bd62ea: Ensure client-side Tina code only runs on the browser. Without this check, we'd see a server/client mismatch like:

  ```
  warning.js:33 Warning: Expected server HTML to contain a matching <div> in <body>.
  ```

- Updated dependencies [e9a0c82cf]
- Updated dependencies [d4fdeaa9f]
- Updated dependencies [ed85f2594]
- Updated dependencies [d86e515ba]
- Updated dependencies [db0dab1d4]
  - @tinacms/toolkit@0.56.18

## 0.66.8

### Patch Changes

- 4923a2d66: Checks isAuthenticated() before making requests to the GraphQL client
- Updated dependencies [106549814]
- Updated dependencies [4923a2d66]
- Updated dependencies [a07ff39bb]
  - @tinacms/toolkit@0.56.17

## 0.66.7

### Patch Changes

- bfada9a09: Used success messaging when creating/updating a Document in the CMS

## 0.66.6

### Patch Changes

- becff2a0b: Adds define schema to the `tinacms` package (instead of `@tinacms/cli`. This is done in preparation of the extending tina work)
- ae1a5a58f: Sets `tina-admin` to default to `true`
- 3ed4c8727: Add flag for experimental new formify logic
- 5535a9970: Switches to using HashRouter for Admin
- 3ff1de06a: Upgrade to Tailwind 3
- fbdb7be01: Adds a defineConfig function to allow type hints for the tinacms config
- 24f8b057f: Handles errors better in the CMS
- Updated dependencies [ae1a5a58f]
- Updated dependencies [5535a9970]
- Updated dependencies [3ff1de06a]
- Updated dependencies [022ccd389]
- Updated dependencies [24f8b057f]
  - @tinacms/toolkit@0.56.16
  - @tinacms/sharedctx@0.1.0

## 0.66.5

### Patch Changes

- 43c834565: Adds an activity indicator throughout Admin
- 53a4550db: Allows RouteMapping to be dynamically imported
- 731451bee: Adjust the JWT token refresh logic to refresh tokens _before_ they expire.
- e102d7438: Updated auth modal to use toolkit button components
- Updated dependencies [43c834565]
  - @tinacms/toolkit@0.56.15

## 0.66.4

### Patch Changes

- cc5c8431d: Remove console.log
- Updated dependencies [af9f6c2c2]
- Updated dependencies [2e14cda5e]
- Updated dependencies [3d4c52a19]
  - @tinacms/toolkit@0.56.14

## 0.66.3

### Patch Changes

- Updated dependencies [e41b709ce]
  - @tinacms/toolkit@0.56.13

## 0.66.2

### Patch Changes

- 102628c7f: Fixes admin page wrapper scrolling
- 55cb0c5ec: Updates the relativePath field for clarity
- 9e77273d2: use collection name as fallback for label
- Updated dependencies [8c18edd5c]
- Updated dependencies [0773f6486]
- Updated dependencies [d8cd60f65]
- Updated dependencies [9e77273d2]
- Updated dependencies [63a74aece]
  - @tinacms/toolkit@0.56.12

## 0.66.1

### Patch Changes

- 3bba1817d: Integrates Chrome Components with TinaAdmin
- Updated dependencies [3bba1817d]
- Updated dependencies [415c03d25]
  - @tinacms/toolkit@0.56.11
  - @tinacms/sharedctx@0.1.0

## 0.66.0

### Minor Changes

- d6f46a9f9: fix: When passing in queries into the root TinaCMS container, don't overwrite the data prop on an empty query

### Patch Changes

- Updated dependencies [37286858e]
  - @tinacms/toolkit@0.56.10

## 0.65.3

### Patch Changes

- 0c4456c11: fix: Send update to useTina hook on the initial isLoading change

## 0.65.2

### Patch Changes

- a9b385b01: Fix mutation string for document creation

## 0.65.1

### Patch Changes

- 68284198a: fix: use user-specific document creator callback
- ccf4dcbd4: chore: Export low-level data provider from "tinacms", for the playground and other sandboz environments
- f2431c031: Fix type for code_block TinaMarkdown element

## 0.65.0

### Minor Changes

- 792f47251: useTina hook for page-level form registration

### Patch Changes

- 6a50a1368: Updates the look and feel of the Tina Sidebar
- 239382619: Introduces TinaAdminApi and consolidates types
- Updated dependencies [8ad8f03fd]
- Updated dependencies [6a50a1368]
- Updated dependencies [792f47251]
  - @tinacms/toolkit@0.56.9
  - @tinacms/sharedctx@0.1.0

## 0.64.2

### Patch Changes

- Updated dependencies [7006b38ea]
  - @tinacms/toolkit@0.56.8

## 0.64.1

### Patch Changes

- 28010a026: Adds tailwind styles to Admin Layout
- Updated dependencies [e8ca82899]
  - @tinacms/toolkit@0.56.7

## 0.64.0

### Minor Changes

- 4a3990c7e: Cloudinary media store now serves images over `https` by default. This can now be configured though the handler provided.

  To revert to the old behavior:

  ```ts
  export default createMediaHandler(
    {
      // ...
    },
    {
      useHttps: false,
    }
  )
  ```

  The default for `useHttps` is `true`

## 0.63.0

### Minor Changes

- 3897ec5d9: Replace `branch`, `clientId`, `isLocalClient` props with single `apiURL`. When working locally, this should be `http://localhost:4001/graphql`. For Tina Cloud, use `https://content.tinajs.io/content/<my-client-id>/github/<my-branch>`

  ```tsx
  // _app.tsx
  // ...
  <TinaCMS apiURL={process.env.NEXT_PUBLIC_TINA_API_URL} {...pageProps}>
    {(livePageProps) => <Component {...livePageProps} />}
  </TinaCMS>
  ```

  DEPRECATION NOTICE: `branch`, `clientId`, `isLocalClient` props will be deprecated in the future

### Patch Changes

- 96e4a77e2: Fixed types
- b5c22503a: Changes messaging on login page for TinaAdmin when in local-mode
- Updated dependencies [60f939f34]
  - @tinacms/toolkit@0.56.6

## 0.62.0

### Minor Changes

- 70da62fe8: deprecated the use of `getStaticPropsForTina`

### Patch Changes

- 0afa75df1: 2342 - [TinaAdmin] Truncates the `filename` column for the Document List View
- 7dafce89d: Fixed issue where content creator was invalid
- 3de8c6165: Enabled branch creation in branch switcher
- fee183f8f: add "switch to default branch" recover option to error boundary
- 5c070a83f: feat: Add UI banner for when in localMode
- Updated dependencies [ddf81a4fd]
- Updated dependencies [20260a82d]
- Updated dependencies [0370147fb]
- Updated dependencies [3de8c6165]
- Updated dependencies [2eaad97bf]
- Updated dependencies [5c070a83f]
  - @tinacms/toolkit@0.56.5

## 0.61.1

### Patch Changes

- Updated dependencies [2c7718636]
  - @tinacms/toolkit@0.56.4

## 0.61.0

### Minor Changes

- 229feda1d: add .nvmrc file for setting preferred node version

## 0.60.3

### Patch Changes

- 4adaf15af: Fix types which weren't included in previous patch

## 0.60.2

### Patch Changes

- 816271d03: Ensure login/logout pages work when admin flag is disabled

## 0.60.1

### Patch Changes

- Updated dependencies [4700d7ae4]
  - @tinacms/toolkit@0.56.3

## 0.60.0

### Minor Changes

- 75974d0a4: Updates the tina cloud client to do id_token & access_token refreshes when needed

### Patch Changes

- 88c209b45: Throw when Tina Cloud responds with non 200 code
- dcdf1ecf0: Updates `react-router` to `v6` for `TinaAdmin`
- 47d126029: Fix support of objects in a list for MDX templates
- Updated dependencies [bc4699d2b]
  - @tinacms/toolkit@0.56.2

## 0.59.1

### Patch Changes

- ed9d48abc: Swaps starter's old admin for the new one
- f6876d30f: Alter empty sidebar message to be more specific to auto-generating logic
- Updated dependencies [f6876d30f]
- Updated dependencies [92268fc85]
  - @tinacms/toolkit@0.56.1

## 0.59.0

### Minor Changes

- df3030990: Add basic branch switcher

### Patch Changes

- 9ecceb59f: Always include `collection` for TinaAdmin `createDocument()` and `updateDocument()`
- Updated dependencies [df3030990]
  - @tinacms/toolkit@0.56.0

## 0.58.1

### Patch Changes

- e6995cfcb: Adds README for TinaAdmin
- 60729f60c: Adds a `reference` field
- 19e02829f: Add ability to control plugin layout for global plugins from formify
- Updated dependencies [60729f60c]
  - @tinacms/toolkit@0.55.4

## 0.58.0

### Minor Changes

- d1ed404ba: Add support for auto-generated SDK for type-safe data fetching

### Patch Changes

- 138ceb8c4: Clean up dependencies
- 0417e3750: Adds RouteMapperPlugin and FormMetaPlugin
- Updated dependencies [138ceb8c4]
- Updated dependencies [0417e3750]
- Updated dependencies [d9f37ea7e]
  - @tinacms/toolkit@0.55.3

## 0.57.4

### Patch Changes

- 4b7795612: Adds support for collection.templates to TinaAdmin
- a39ddc611: update media store to load only when in edit mode
- 1096fe3e4: Ensure forms unmount properly when `useGraphQLForms` unmounts

## 0.57.3

### Patch Changes

- Updated dependencies [2724c48c0]
  - @tinacms/toolkit@0.55.2

## 0.57.2

### Patch Changes

- 7849c1233: Fix styles on panel

## 0.57.1

### Patch Changes

- 9c0d48e09: Fix console errors for mdx editor
- Updated dependencies [9c0d48e09]
  - @tinacms/toolkit@0.55.1

## 0.57.0

### Minor Changes

- b99baebf1: Add rich-text editor based on mdx, bump React dependency requirement to 16.14

### Patch Changes

- 891623c7c: Adds support for List and Update to TinaAdmin
- d5e3adf37: Adds support for Log In & Log Out to TinaAdmin
- Updated dependencies [b99baebf1]
  - @tinacms/toolkit@0.55.0

## 0.56.3

### Patch Changes

- 67df49220: Allow dashes in filenames for content creator
- Updated dependencies [b961c7417]
  - @tinacms/toolkit@0.54.1

## 0.56.2

### Patch Changes

- 84a86358f: Fix bug which reset the form onChange for GraphQL forms

## 0.56.1

### Patch Changes

- a05aa61bd: Fix issue where forms weren't being removed when the page unmounted
  - @tinacms/toolkit@0.54.0

## 0.56.0

### Minor Changes

- c6e2dd69a: Updated Wrapper component so that it can be build without loading the media store
- 3f9cad860: A warning message is added to warn the user if they are using a staticRequest at run time.

### Patch Changes

- 2908f8176: Fixes an issue where nested reference fields weren't updated properly when their values changed.
- 08ef183a0: Allow tina.io URLs to be supplied as a a prop:

  ```tsx
  <TinaEditProvider
    editMode={
      <TinaCMS
        branch="main"
        clientId={NEXT_PUBLIC_TINA_CLIENT_ID}
        tinaioConfig={{
          baseUrl: "some-base.io"
        }}
        //...
  ```

  Or just the identity/content URLs:

  ```tsx
  <TinaEditProvider
    editMode={
      <TinaCMS
        branch="main"
        clientId={NEXT_PUBLIC_TINA_CLIENT_ID}
        tinaioConfig={{
          identityApiUrl: "https://some-base.io"
          // AND/OR
          contentApiUrl: "https://content.some-base.io"
        }}
        //...
  ```

- Updated dependencies [9213d5608]
- Updated dependencies [b59f23295]
- Updated dependencies [a419056b6]
- Updated dependencies [ded8dfbee]
- Updated dependencies [5df9fe543]
- Updated dependencies [9d68b058f]
- Updated dependencies [91cebe5bc]
  - @tinacms/toolkit@0.54.0

## 0.55.2

### Patch Changes

- Updated dependencies [7b149a4e7]
- Updated dependencies [906d72c50]
  - @tinacms/toolkit@0.53.0

## 0.55.1

### Patch Changes

- 9b27192fe: Build packages with new scripting, which includes preliminary support for ES modules.
- Updated dependencies [9b27192fe]
  - @tinacms/toolkit@0.52.3

## 0.55.0

### Minor Changes

- d0e896561: Provide better error boundary message and visual affordances to user in <ErrorBoundary />.
- 27c1fd382: Adds a close button to the Tina Cloud auth model so a user is not suck in edit mode.

## 0.54.4

### Patch Changes

- Updated dependencies [6b1cbf916]
  - @tinacms/toolkit@0.52.2

## 0.54.3

### Patch Changes

- Updated dependencies [4de977f63]
  - @tinacms/toolkit@0.52.1

## 0.54.2

### Patch Changes

- d1ef2545f: Ensure `undefined` values aren't passed back from getStaticPropsForTina

## 0.54.1

### Patch Changes

- Updated dependencies [b4f5e973f]
  - @tinacms/toolkit@0.52.0

## 0.54.0

### Minor Changes

- 3af2c075c: Loading state now resets in useGraphqlForms
- 515fc3ffd: Don't treat cloud client with missing client-id as local client

### Patch Changes

- Updated dependencies [634524925]
  - @tinacms/toolkit@0.51.0

## 0.53.0

### Minor Changes

- 1b8bb5d0f: fix: don't throw error on missing client id

### Patch Changes

- f863d8be8: Fixes an issue where new documents returned a 404 when on a hosted deployement. Instead, `getStaticPropsForTina` will catch and return an empty object for the data key. This allows us to replace it with real data client-side.

## 0.52.0

### Minor Changes

- 8a20437c: Expose a createGlobalForm function in formifyCallback that creates a screen plugin

### Patch Changes

- d31df43d: Handles situations where `currentFields` is not an Array
- 271a72d7: Use collection label (defined in schema.ts) as form label

## 0.51.0

### Minor Changes

- 6dfbfed0: Added variables to useGraphqlForms dependencies in order to update data when variables change

### Patch Changes

- Updated dependencies [e074d555]
  - @tinacms/toolkit@0.50.1

## 0.50.1

### Patch Changes

- 3f05aad1: Fix race condition where `values` was taking longer to update in React state, making the data syncing run too early
- 76e3a8a7: Properly uses formifyCallback and documentCreatorCallback

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

### Patch Changes

- 434d61d4: Use the default import from 'tinacms' to set up the Tina context:

  ```jsx
  // pages/_app.js
  import TinaCMS from 'tinacms'

  const App = ({ Component, pageProps }) => {
    return (
      <TinaCMS
        // Required: The query from your `getStaticProps` request
        query={pageProps.query}
        // Required: The variables from your `getStaticProps` request
        variables={pageProps.variables} // Variables used in your query
        // Required: The data from your `getStaticProps` request
        data={pageProps.data}
        // Optional: Set to true when working with the local API
        isLocalClient={true}
        // Optional: When using Tina Cloud, specify the git branch
        branch="main"
        // Optional: Your identifier when connecting to Tina Cloud
        clientId="<some-id-from-tina-cloud>"
        // Optional: A callback for altering the CMS object if needed
        cmsCallback={(cms) => {}}
        // Optional: A callback for altering the form generation if needed
        formifyCallback={(args) => {}}
        // Optional: A callback for altering the document creator plugin
        documentCreatorCallback={(args) => {}}
      >
        {(livePageProps) => <Component {...livePageProps} />}
      </TinaCMS>
    )
  }

  export default App
  ```

  To load TinaCMS dynamically, use the EditState context:

  ```jsx
  // pages/_app.js
  import dynamic from 'next/dynamic'
  import { TinaEditProvider } from 'tinacms/dist/edit-state'
  const TinaCMS = dynamic(() => import('tinacms'), { ssr: false })

  const App({ Component, pageProps }) {
    return (
      <>
        <TinaEditProvider
          editMode={
            <TinaCMS {...pageProps}>
              {livePageProps => <Component {...livePageProps} />}
            </TinaCMS>
          }
        >
          <Component {...pageProps} />
        </TinaEditProvider>
      </>
    )
  }

  export default App
  ```

- Updated dependencies [7f3c8c1a]
  - @tinacms/toolkit@0.44.0

## 0.4.0

### Minor Changes

- ab4e388b: Updates where LoadingDots is imported from
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

- d42e2bcf: Adds number, datetime, and boolean fields back into primitive field generators
- 95244e14: Early return for query nodes which can't be formified
- Updated dependencies [7351d92f]
  - tina-graphql-helpers@0.1.2

## 0.3.0

### Minor Changes

- 96ee3eb1: Revisited useDocumentCreatorPlugin to improve the UX

## 0.2.23

### Patch Changes

- Bump packages to reflect new changest capabilities
- Updated dependencies [undefined]
  - tina-graphql-helpers@0.1.1

## 0.2.22

### Patch Changes

- Updated dependencies [undefined]
  - tina-graphql-helpers@0.1.0
