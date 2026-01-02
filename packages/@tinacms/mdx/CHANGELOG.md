# @tinacms/mdx

## 2.0.2

### Patch Changes

- Updated dependencies [[`a63401a`](https://github.com/tinacms/tinacms/commit/a63401a3dd8271258bc6bfb4cc22593c19e94c7d)]:
  - @tinacms/schema-tools@2.2.0

## 2.0.1

### Patch Changes

- Updated dependencies [[`a125472`](https://github.com/tinacms/tinacms/commit/a125472d3278c140cb416dba5cd1478fb5dfe320)]:
  - @tinacms/schema-tools@2.1.0

## 2.0.0

### Major Changes

- [#5982](https://github.com/tinacms/tinacms/pull/5982) [`2e1535d`](https://github.com/tinacms/tinacms/commit/2e1535dd5495dc390902f2db6ef1f26afb072396) Thanks [@brookjeynes-ssw](https://github.com/brookjeynes-ssw)! - feat: migrate from commonjs to esm

### Patch Changes

- Updated dependencies [[`2e1535d`](https://github.com/tinacms/tinacms/commit/2e1535dd5495dc390902f2db6ef1f26afb072396), [`ed6025e`](https://github.com/tinacms/tinacms/commit/ed6025ee87ebe051957fc93e987ba8de8b003995)]:
  - @tinacms/schema-tools@2.0.0

## 1.8.3

### Patch Changes

- Updated dependencies [[`a76fdb6`](https://github.com/tinacms/tinacms/commit/a76fdb639b94cfefa169ebbd184f55d62e4a8a76), [`a736baf`](https://github.com/tinacms/tinacms/commit/a736bafe1b20bc1465f8e4a4c0c2281f40dcbf2f)]:
  - @tinacms/schema-tools@1.10.1

## 1.8.2

### Patch Changes

- [#6145](https://github.com/tinacms/tinacms/pull/6145) [`d1bd1a1`](https://github.com/tinacms/tinacms/commit/d1bd1a1312fa910e237ec06608e7c11830c78346) Thanks [@18-th](https://github.com/18-th)! - Remove Lodash and replace usages with either native functions or es-toolkit equivalents
  Removed the following lodash usages:
  - debounce - was not used, removed the reference
  - camelcase - unused, removed the reference
  - upperfirst - unused, removed the reference
  - flatten - replaced by native .flat()
  - get - replaced with an existing implementation from the GraphQL package
  - cloneDeep - replaced with cloneDeep from es-toolkit
  - set - replaced with es-toolkit compat version. That implementation is identical to the one used by lodash
  - uniqBy - replace with es-toolkit version. That implementation is identical to the one used by lodash
- Updated dependencies [[`f2577b9`](https://github.com/tinacms/tinacms/commit/f2577b911a97ecc1c3f53a98ae8218cc33bc9867), [`38920ce`](https://github.com/tinacms/tinacms/commit/38920ce29a9b63c54b04f39537f19beab62d2c86), [`4b824be`](https://github.com/tinacms/tinacms/commit/4b824be53572f9231753ebd3b5f14fd778fd73d6)]:
  - @tinacms/schema-tools@1.10.0

## 1.8.1

### Patch Changes

- Updated dependencies [[`eaa6ed5`](https://github.com/tinacms/tinacms/commit/eaa6ed551c76349c5849cd1e19a8066ecbbe205c)]:
  - @tinacms/schema-tools@1.9.1

## 1.8.0

### Minor Changes

- [#5744](https://github.com/tinacms/tinacms/pull/5744) [`98a61e2`](https://github.com/tinacms/tinacms/commit/98a61e2d263978a7096cc23ac7e94aa0039981be) Thanks [@Ben0189](https://github.com/Ben0189)! - Upgrade Plate editor to v48 beta, integrating latest features and improvements.

### Patch Changes

- Updated dependencies [[`98a61e2`](https://github.com/tinacms/tinacms/commit/98a61e2d263978a7096cc23ac7e94aa0039981be)]:
  - @tinacms/schema-tools@1.9.0

## 1.7.0

### Minor Changes

- [#5750](https://github.com/tinacms/tinacms/pull/5750) [`dbef36f`](https://github.com/tinacms/tinacms/commit/dbef36f594b949024d5525184b6a9e1b9085b759) Thanks [@wicksipedia](https://github.com/wicksipedia)! - Rich text parsers - adds support for slate serialization in json

### Patch Changes

- [#5786](https://github.com/tinacms/tinacms/pull/5786) [`e27c017`](https://github.com/tinacms/tinacms/commit/e27c0172005797af93b908152d51b2966c0cf059) Thanks [@wicksipedia](https://github.com/wicksipedia)! - Modifies SlateJson rich text parser to store non-stringified json objects of the rich text content

- Updated dependencies [[`dbef36f`](https://github.com/tinacms/tinacms/commit/dbef36f594b949024d5525184b6a9e1b9085b759)]:
  - @tinacms/schema-tools@1.8.0

## 1.6.3

### Patch Changes

- Updated dependencies [[`d689189`](https://github.com/tinacms/tinacms/commit/d68918973d39aabbb9e5e4672a913771f8841734)]:
  - @tinacms/schema-tools@1.7.4

## 1.6.2

### Patch Changes

- Updated dependencies [[`ab43169`](https://github.com/tinacms/tinacms/commit/ab43169af5a95f31fa27bb0236623a031883a1fd)]:
  - @tinacms/schema-tools@1.7.3

## 1.6.1

### Patch Changes

- Updated dependencies [[`602b4d0`](https://github.com/tinacms/tinacms/commit/602b4d07f94de4c10d5bb059a5edc49546a2031c)]:
  - @tinacms/schema-tools@1.7.2

## 1.6.0

### Minor Changes

- [#5504](https://github.com/tinacms/tinacms/pull/5504) [`7541614`](https://github.com/tinacms/tinacms/commit/7541614527a02268ea453b23ce84637f978dcf2d) Thanks [@Ben0189](https://github.com/Ben0189)! - Rich text editor - Add strikethrough support

  - Added a strikethrough button in the rich text editor, allowing users to apply strikethrough formatting.
  - Strikethrough syntax (`~~word~~`) correctly applies in Markdown mode.
  - **Known Issue:** In the rich text editor, typing `~~word~~` does not currently auto-convert to strikethrough. A fix will follow in an upcoming patch.

### Patch Changes

- [#5486](https://github.com/tinacms/tinacms/pull/5486) [`d7c5ec1`](https://github.com/tinacms/tinacms/commit/d7c5ec1b174419dcc6ddba3cfb3684dd469da571) Thanks [@JackDevAU](https://github.com/JackDevAU)! - Update dependencies across packages

- Updated dependencies [[`d7c5ec1`](https://github.com/tinacms/tinacms/commit/d7c5ec1b174419dcc6ddba3cfb3684dd469da571)]:
  - @tinacms/schema-tools@1.7.1

## 1.5.4

### Patch Changes

- [#5397](https://github.com/tinacms/tinacms/pull/5397) [`82b0039`](https://github.com/tinacms/tinacms/commit/82b00393da8bbcc2cf357fbbb546904f07e8d89c) Thanks [@kldavis4](https://github.com/kldavis4)! - Rich text editor | hyperlinks - fixed sanitizeUrl to allow querystring parameters

- Updated dependencies [[`92b683b`](https://github.com/tinacms/tinacms/commit/92b683bd3d73b47271eee5b8ff648ed4dcde51e3)]:
  - @tinacms/schema-tools@1.7.0

## 1.5.3

### Patch Changes

- Updated dependencies [[`c45ac5d`](https://github.com/tinacms/tinacms/commit/c45ac5d9c7219593cde63e0cc6fbf945480884f7)]:
  - @tinacms/schema-tools@1.6.9

## 1.5.2

### Patch Changes

- [#5276](https://github.com/tinacms/tinacms/pull/5276) [`f90ef4d`](https://github.com/tinacms/tinacms/commit/f90ef4d92ae7b21c8c610d14af9510354a3969c6) Thanks [@Ben0189](https://github.com/Ben0189)! - Updates minor and patch dependencies

- Updated dependencies [[`f90ef4d`](https://github.com/tinacms/tinacms/commit/f90ef4d92ae7b21c8c610d14af9510354a3969c6), [`ac2003f`](https://github.com/tinacms/tinacms/commit/ac2003f87381de36c417d69fdb59485dc96f334a), [`03bb823`](https://github.com/tinacms/tinacms/commit/03bb8237df87dab9da503818b839d44209263a48)]:
  - @tinacms/schema-tools@1.6.8

## 1.5.1

### Patch Changes

- Updated dependencies [[`0daf0b6`](https://github.com/tinacms/tinacms/commit/0daf0b687b36614a1fdf904b1d5125e4c63e81a9)]:
  - @tinacms/schema-tools@1.6.7

## 1.5.0

### Minor Changes

- [#5098](https://github.com/tinacms/tinacms/pull/5098) [`c5dad82`](https://github.com/tinacms/tinacms/commit/c5dad82a3f1fc4f7686f1503a7894dfacffa8c36) Thanks [@Jord-Gui](https://github.com/Jord-Gui)! - Add table plugin to rich-text-editor

### Patch Changes

- [#4825](https://github.com/tinacms/tinacms/pull/4825) [`ecea7ac`](https://github.com/tinacms/tinacms/commit/ecea7ac5e1c087954eaaf873df3a563ca08f3e47) Thanks [@JackDevAU](https://github.com/JackDevAU)! - ✨ Add Mermaid Support to Rich Text Field (Plate)
  🐛 Fix tooltip rendering behind TinaCMS app
- Updated dependencies [[`ecea7ac`](https://github.com/tinacms/tinacms/commit/ecea7ac5e1c087954eaaf873df3a563ca08f3e47)]:
  - @tinacms/schema-tools@1.6.6

## 1.4.5

### Patch Changes

- Updated dependencies [[`31513bb`](https://github.com/tinacms/tinacms/commit/31513bb473cd1d349a3711ef7c5075cf9d03f121)]:
  - @tinacms/schema-tools@1.6.5

## 1.4.4

### Patch Changes

- [#4843](https://github.com/tinacms/tinacms/pull/4843) [`4753c9b`](https://github.com/tinacms/tinacms/commit/4753c9b53854d19212229f985bc445b2794fad9a) Thanks [@JackDevAU](https://github.com/JackDevAU)! - ⬆️ Update Minor & Patch Dependencies Versions

- Updated dependencies [[`4753c9b`](https://github.com/tinacms/tinacms/commit/4753c9b53854d19212229f985bc445b2794fad9a)]:
  - @tinacms/schema-tools@1.6.4

## 1.4.3

### Patch Changes

- [#4804](https://github.com/tinacms/tinacms/pull/4804) [`d08053e`](https://github.com/tinacms/tinacms/commit/d08053e758b6910afa8ab8952a40984921cccbc4) Thanks [@dependabot](https://github.com/apps/dependabot)! - ⬆️ Updates Typescript to v5.5, @types/node to v22.x, next.js to latest version 14.x, and removes node-fetch

- Updated dependencies [[`6cd3596`](https://github.com/tinacms/tinacms/commit/6cd35967ab0d34851be44199bc9821b128fcfc75), [`d08053e`](https://github.com/tinacms/tinacms/commit/d08053e758b6910afa8ab8952a40984921cccbc4)]:
  - @tinacms/schema-tools@1.6.3

## 1.4.2

### Patch Changes

- Updated dependencies [6ccda6c]
- Updated dependencies [33eaa81]
  - @tinacms/schema-tools@1.6.2

## 1.4.1

### Patch Changes

- Updated dependencies [ae03e8e]
  - @tinacms/schema-tools@1.6.1

## 1.4.0

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

## 1.3.29

### Patch Changes

- Updated dependencies [cb83dc2]
  - @tinacms/schema-tools@1.5.0

## 1.3.28

### Patch Changes

- f567fc8: More React 18 upgrades and fixes
- e58b951: update vulnerable packages so npm audit does not complain
- 9076d09: update next js version from 12 to 14 in tinacms packages
- Updated dependencies [f567fc8]
- Updated dependencies [e58b951]
- Updated dependencies [957fa26]
- Updated dependencies [9076d09]
  - @tinacms/schema-tools@1.4.19

## 1.3.27

### Patch Changes

- Updated dependencies [f26b40d]
  - @tinacms/schema-tools@1.4.18

## 1.3.26

### Patch Changes

- 0503072: update ts, remove rimraf, fix types
- Updated dependencies [0503072]
- Updated dependencies [dffa355]
  - @tinacms/schema-tools@1.4.17

## 1.3.25

### Patch Changes

- Updated dependencies [2e3393ef5]
  - @tinacms/schema-tools@1.4.16

## 1.3.24

### Patch Changes

- b3ad50a62: Fix issue where rich-text nested inside JSX objects wasn't being parsed/stringified properly.

## 1.3.23

### Patch Changes

- Updated dependencies [64f8fa038]
  - @tinacms/schema-tools@1.4.15

## 1.3.22

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
  import { createDatabase, createLocalDatabase } from "@tinacms/datalayer";
  import { MongodbLevel } from "mongodb-level";
  import { GitHubProvider } from "tinacms-gitprovider-github";

  const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === "true";

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
          collectionName: "tinacms",
          dbName: "tinacms",
          mongoUri: process.env.MONGODB_URI,
        }),
        namespace: process.env.GITHUB_BRANCH,
      });
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
  });
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
  import { createLocalDatabase } from "@tinacms/datalayer";
  createLocalDatabase(port);
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
  });
  ```

  - **New API**:

  ```javascript
  import { AbstractAuthProvider } from "tinacms";
  class CustomAuthProvider extends AbstractAuthProvider {
    login() {}
    logout() {}
    //...
  }
  defineConfig({
    authProvider: new CustomAuthProvider(),
    //...
  });
  ```

  ### TinaCMS Self Hosted backend updates

  - **New:** TinaNodeBackend is exported from `@tinacms/datalayer`. This is used to host the TinaCMS backend in a single function.
  - **New:** `LocalBackendAuthProvider` is exported from `@tinacms/datalayer`. This is used to host the TinaCMS backend locally.

  - **New:** `AuthJsBackendAuthProvider` is exported from `tinacms-authjs`. This is used to host the TinaCMS backend with AuthJS.

  ### Migrating the TinaCMS backend

  Now, instead of hosting the in /tina/api/gql.ts file, the entire TinaCMS backend (including auth) will be hosted in a single backend function.

  `/api/tina/[...routes].{ts,js}`

  ```typescript
  import {
    TinaNodeBackend,
    LocalBackendAuthProvider,
  } from "@tinacms/datalayer";

  import { TinaAuthJSOptions, AuthJsBackendAuthProvider } from "tinacms-authjs";

  import databaseClient from "../../../tina/__generated__/databaseClient";

  const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === "true";

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
  });

  export default (req, res) => {
    // Modify the request here if you need to
    return handler(req, res);
  };
  ```

  These changes are put in place to make self hosted TinaCMS easier to use and more flexible.

  Please [check out the docs](https://tina.io/docs/self-hosted/overview) for more information on self hosted TinaCMS.

- Updated dependencies [a65ca13f2]
  - @tinacms/schema-tools@1.4.14

## 1.3.21

### Patch Changes

- 693cf5bd6: Improve types for tables, add support for column alignment

## 1.3.20

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

- Updated dependencies [6861b5e01]
- Updated dependencies [aec44a7dc]
  - @tinacms/schema-tools@1.4.13

## 1.3.19

### Patch Changes

- 5040fc7cb: Add xref support to markdown links

  ```md
  Click [here](xref:some-link "Tester") to join now
  ```

## 1.3.18

### Patch Changes

- Updated dependencies [7e4de0b2a]
- Updated dependencies [099bf5646]
- Updated dependencies [c92de7b1d]
  - @tinacms/schema-tools@1.4.12

## 1.3.17

### Patch Changes

- 0e94b2725: Fix issue where empty nested rich-text fields would throw an error if they'd been marked as dirty during editing
- Updated dependencies [1563ce5b2]
  - @tinacms/schema-tools@1.4.11

## 1.3.16

### Patch Changes

- 8aae69436: Ensure urls are sanitized in a tags for rich-text
- a78c81f14: Fix issue where non-object lists weren't handled properly for rich-text embeds
- Updated dependencies [133e97d5b]
- Updated dependencies [f02b4368b]
- Updated dependencies [7991e097e]
  - @tinacms/schema-tools@1.4.10

## 1.3.15

### Patch Changes

- bc812441b: Use .mjs extension for ES modules
- Updated dependencies [bc812441b]
  - @tinacms/schema-tools@1.4.9

## 1.3.14

### Patch Changes

- Updated dependencies [019920a35]
  - @tinacms/schema-tools@1.4.8

## 1.3.13

### Patch Changes

- Updated dependencies [fe13b4ed9]
  - @tinacms/schema-tools@1.4.7

## 1.3.12

### Patch Changes

- Updated dependencies [a94e123b6]
  - @tinacms/schema-tools@1.4.6

## 1.3.11

### Patch Changes

- Updated dependencies [c385b5615]
  - @tinacms/schema-tools@1.4.5

## 1.3.10

### Patch Changes

- Updated dependencies [beb179279]
  - @tinacms/schema-tools@1.4.4

## 1.3.9

### Patch Changes

- Updated dependencies [f14f59a96]
- Updated dependencies [eeedcfd30]
  - @tinacms/schema-tools@1.4.3

## 1.3.8

### Patch Changes

- 75d5ed359: Add html tag back into rich-text response

## 1.3.7

### Patch Changes

- Updated dependencies [a70204500]
  - @tinacms/schema-tools@1.4.2

## 1.3.6

### Patch Changes

- 5fcef561d: - Pin vite version
  - Adds react plugin so that we no longer get a 404 on react /@react-refresh
  - Adds transform ts and tsx files in build as well as dev
- Updated dependencies [9a8074889]
- Updated dependencies [c48326846]
  - @tinacms/schema-tools@1.4.1

## 1.3.5

### Patch Changes

- 9e86312d6: Skip html tokenization when skipEscaping is enabled.
- 5d1e0e406: Support mdx block elements when children are on the same line. Eg.

  ```
  <Cta>Hello, world</Cta>
  ```

- cbc1fb919: Provide browser-specific version of @tinacms/mdx
- Updated dependencies [76c984bcc]
- Updated dependencies [5809796cf]
- Updated dependencies [54aac9017]
  - @tinacms/schema-tools@1.4.0

## 1.3.4

### Patch Changes

- 973e83f1f: Some fixes around image handling in the rich-text editor

  - Stop treating images as block-level
  - Fix issue where images inside links were being stripped out
  - Fix display of .avif images in the media manager

- Updated dependencies [d1cf65999]
  - @tinacms/schema-tools@1.3.4

## 1.3.3

### Patch Changes

- 290520682: Update handling of top-level images during stringify
  - @tinacms/schema-tools@1.3.3

## 1.3.2

### Patch Changes

- 3e97d978c: Add support for experimental markdown parser. To enable:

  ```js
  {
    name: "body",
    type: "rich-text",
    parser: {
      type: "markdown"
    }
  }
  ```

  For users who want to control the escape behavior, you can specify

  ```js
  {
    name: "body",
    type: "rich-text",
    parser: {
      type: "markdown"
      skipEscaping: "all" // options are "all" | "html"
    }
  }
  ```

  This is helpful for sites rendered by other systems such as Hugo, where escape characters may interfere with
  shortcodes that aren't registered with Tina.

- f831dcf4f: security: update some deps
- Updated dependencies [0a5297800]
- Updated dependencies [7a3e86ba1]
- Updated dependencies [353899de1]
- Updated dependencies [01b858e41]
  - @tinacms/schema-tools@1.3.3

## 1.3.1

### Patch Changes

- aa0250979: Fix issue where shortcode closing tags were backwards
- Updated dependencies [892b4e39e]
- Updated dependencies [c97ffc20d]
  - @tinacms/schema-tools@1.3.2

## 1.3.0

### Minor Changes

- 169147490: When markdown files fail to parse, fallback to the non-MDX parser

### Patch Changes

- Updated dependencies [e732906b6]
  - @tinacms/schema-tools@1.3.1

## 1.2.0

### Minor Changes

- efd56e769: Replace Store with AbstractLevel in Database. Update CLI to allow user to configure Database.

### Patch Changes

- efd56e769: Remove license headers
- Updated dependencies [efd56e769]
- Updated dependencies [efd56e769]
  - @tinacms/schema-tools@1.3.0

## 1.1.1

### Patch Changes

- Updated dependencies [84fe97ca7]
- Updated dependencies [e7c404bcf]
  - @tinacms/schema-tools@1.2.1

## 1.1.0

### Minor Changes

- 3165f397d: fix: Shortcodes need to be specified by name to match with match-start / match-end
- a68f1ac27: fix: Shortcodes need to be specified by name to match with match-start / match-end

### Patch Changes

- 7ff63fdd9: Modify shortcode behavior to treat \_value as a special field name which shows up as an unkeyed string in the shortcode output
- Updated dependencies [7d41435df]
- Updated dependencies [3165f397d]
- Updated dependencies [b2952a298]
  - @tinacms/schema-tools@1.2.0

## 1.0.4

### Patch Changes

- Updated dependencies [7554ea362]
- Updated dependencies [4ebc44068]
  - @tinacms/schema-tools@1.1.0

## 1.0.3

### Patch Changes

- Updated dependencies [7495f032b]
- Updated dependencies [de37c9eff]
  - @tinacms/schema-tools@1.0.3

## 1.0.2

### Patch Changes

- Updated dependencies [c91bc0fc9]
- Updated dependencies [c1ac4bf10]
  - @tinacms/schema-tools@1.0.2

## 1.0.1

### Patch Changes

- Updated dependencies [08e02ec21]
  - @tinacms/schema-tools@1.0.1

## 1.0.0

### Major Changes

- 958d10c82: Tina 1.0 Release

  Make sure you have updated to th "iframe" path: https://tina.io/blog/upgrading-to-iframe/

### Patch Changes

- Updated dependencies [958d10c82]
  - @tinacms/schema-tools@1.0.0

## 0.61.17

### Patch Changes

- 14c5cdffe: Fixes an issue where deeply nested rich-text wasn't being parsed properly
- Updated dependencies [a5d6722c7]
  - @tinacms/schema-tools@0.2.2

## 0.61.16

### Patch Changes

- 4b174e14b: Treat images as block-level when they're isolated in a paragraph.

  Previously all images were nested inside `<p>` elements when coming from the server, but treated as block level by the rich-text editor. This resulted in a scenario where new paragraphs adjacent to images were nested
  in parent `<p>` tags, which caused an error.

- Updated dependencies [6c93834a2]
  - @tinacms/schema-tools@0.2.1

## 0.61.15

### Patch Changes

- Updated dependencies [774abcf9c]
- Updated dependencies [245a65dfe]
  - @tinacms/schema-tools@0.2.0

## 0.61.14

### Patch Changes

- 97f0b6472: Add raw editor support for static mode. Use `~` for preview path.

## 0.61.13

### Patch Changes

- Updated dependencies [c4f9607ce]
  - @tinacms/schema-tools@0.1.9

## 0.61.12

### Patch Changes

- Updated dependencies [005e1d699]
  - @tinacms/schema-tools@0.1.8

## 0.61.11

### Patch Changes

- Updated dependencies [b1a357f60]
  - @tinacms/schema-tools@0.1.7

## 0.61.10

### Patch Changes

- Updated dependencies [c6e3bd321]
  - @tinacms/schema-tools@0.1.6

## 0.61.9

### Patch Changes

- Updated dependencies [183249b11]
- Updated dependencies [8060d0949]
  - @tinacms/schema-tools@0.1.5

## 0.61.8

### Patch Changes

- 112b7271d: fix vulnerabilities
- Updated dependencies [f581f263d]
- Updated dependencies [7ae1b0697]
- Updated dependencies [f3439ea35]
- Updated dependencies [48032e2ba]
  - @tinacms/schema-tools@0.1.4

## 0.61.7

### Patch Changes

- Updated dependencies [9183157c4]
- Updated dependencies [4adf12619]
- Updated dependencies [f8b89379c]
  - @tinacms/schema-tools@0.1.3

## 0.61.6

### Patch Changes

- Updated dependencies [777b1e08a]
  - @tinacms/schema-tools@0.1.2

## 0.61.5

### Patch Changes

- Updated dependencies [59ff1bb10]
- Updated dependencies [232ae6d52]
- Updated dependencies [fd4d8c8ff]
- Updated dependencies [9e5da3103]
  - @tinacms/schema-tools@0.1.1

## 0.61.4

### Patch Changes

- 2b60a7bd8: Improve audit so that it doesn't throw errors during the file list process. Also adds support for `--verbose` argument during `audit`.

## 0.61.3

### Patch Changes

- 7506a46b9: Fix issue where marks within links would throw an error
- 5fbdd05be: Fix stringification of code element nested in link

## 0.61.2

### Patch Changes

- c6726c65b: Fix regression in handling images in rich-text

## 0.61.1

### Patch Changes

- 3d36a0e42: Add null check in markdownToAst to fix error during new doc creation

## 0.61.0

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
  - @tinacms/schema-tools@0.1.0
