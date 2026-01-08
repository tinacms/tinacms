# @tinacms/auth

## 1.1.2

### Patch Changes

- [#6284](https://github.com/tinacms/tinacms/pull/6284) [`f2dd173`](https://github.com/tinacms/tinacms/commit/f2dd173b830ce2d28ab91c14ce5d4be396e801ad) Thanks [@kulesy](https://github.com/kulesy)! - fix(auth): Add "type": "module" to package.json to fix ES module loading

## 1.1.1

### Patch Changes

- [#6262](https://github.com/tinacms/tinacms/pull/6262) [`3a12a39`](https://github.com/tinacms/tinacms/commit/3a12a392d5a8eb9bba5a5be65d080f24afa08de3) Thanks [@0xharkirat](https://github.com/0xharkirat)! - 🔒 Security: Update Next.js to 14.2.35 to address security vulnerabilities

  - Address CVE-2025-55184 (high): DoS via malicious HTTP request causing server to hang
  - Address CVE-2025-67779 (high): Complete fix for CVE-2025-55184 DoS vulnerability
  - Updated Next.js devDependency from 14.2.10/14.2.24 to 14.2.35
  - See: https://nextjs.org/blog/security-update-2025-12-11

## 1.1.0

### Minor Changes

- [#5744](https://github.com/tinacms/tinacms/pull/5744) [`98a61e2`](https://github.com/tinacms/tinacms/commit/98a61e2d263978a7096cc23ac7e94aa0039981be) Thanks [@Ben0189](https://github.com/Ben0189)! - Upgrade Plate editor to v48 beta, integrating latest features and improvements.

## 1.0.12

### Patch Changes

- [#5602](https://github.com/tinacms/tinacms/pull/5602) [`ab43169`](https://github.com/tinacms/tinacms/commit/ab43169af5a95f31fa27bb0236623a031883a1fd) Thanks [@wicksipedia](https://github.com/wicksipedia)! - fix naming of TinaCloud

## 1.0.11

### Patch Changes

- [#5486](https://github.com/tinacms/tinacms/pull/5486) [`d7c5ec1`](https://github.com/tinacms/tinacms/commit/d7c5ec1b174419dcc6ddba3cfb3684dd469da571) Thanks [@JackDevAU](https://github.com/JackDevAU)! - Update dependencies across packages

## 1.0.10

### Patch Changes

- [#5351](https://github.com/tinacms/tinacms/pull/5351) [`0345852`](https://github.com/tinacms/tinacms/commit/0345852e3a7568b61a1417cd037715ab0d0dca01) Thanks [@JackDevAU](https://github.com/JackDevAU)! - Removes `fetch-ponyfill` dependency and use native fetch (node18+)

## 1.0.9

### Patch Changes

- [#5276](https://github.com/tinacms/tinacms/pull/5276) [`f90ef4d`](https://github.com/tinacms/tinacms/commit/f90ef4d92ae7b21c8c610d14af9510354a3969c6) Thanks [@Ben0189](https://github.com/Ben0189)! - Updates minor and patch dependencies

## 1.0.8

### Patch Changes

- [#4843](https://github.com/tinacms/tinacms/pull/4843) [`4753c9b`](https://github.com/tinacms/tinacms/commit/4753c9b53854d19212229f985bc445b2794fad9a) Thanks [@JackDevAU](https://github.com/JackDevAU)! - ⬆️ Update Minor & Patch Dependencies Versions

## 1.0.7

### Patch Changes

- [#4804](https://github.com/tinacms/tinacms/pull/4804) [`d08053e`](https://github.com/tinacms/tinacms/commit/d08053e758b6910afa8ab8952a40984921cccbc4) Thanks [@dependabot](https://github.com/apps/dependabot)! - ⬆️ Updates Typescript to v5.5, @types/node to v22.x, next.js to latest version 14.x, and removes node-fetch

## 1.0.6

### Patch Changes

- e58b951: update vulnerable packages so npm audit does not complain
- 957fa26: update to React 18
- 9076d09: update next js version from 12 to 14 in tinacms packages

## 1.0.5

### Patch Changes

- 0503072: update ts, remove rimraf, fix types

## 1.0.4

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

## 1.0.3

### Patch Changes

- efd56e769: Remove license headers

## 1.0.2

### Patch Changes

- 4e2edde70: Use a fetch ponyfill in `@tinacms/auth`

## 1.0.1

### Patch Changes

- c1ac4bf10: Added a `onLogin` Callback function that is called when the user logs in.

  EX:

  ```ts
  import { defineConfig } from "tinacms";

  export default defineConfig({
    admin: {
      auth: {
        onLogin: () => {
          console.log("On Log in!");
        },
      },
    },
    /// ...
  });
  ```

## 1.0.0

### Major Changes

- 958d10c82: Tina 1.0 Release

  Make sure you have updated to th "iframe" path: https://tina.io/blog/upgrading-to-iframe/

## 0.50.5

### Patch Changes

- be40bfd71: Remove unnecessary media helper deps

## 0.50.4

### Patch Changes

- b369d7238: Update dependencies to fix vulnerabilities in external packages.

## 0.50.3

### Patch Changes

- 67e291e56: Add support for ES modules

## 0.50.2

### Patch Changes

- 138ceb8c4: Clean up dependencies

## 0.50.1

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

## 0.0.4

### Patch Changes

- Bump packages to reflect new changest capabilities
