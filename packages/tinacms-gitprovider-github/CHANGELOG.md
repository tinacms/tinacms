# tinacms-gitprovider-github

## 2.0.17

### Patch Changes

- Updated dependencies []:
  - @tinacms/datalayer@1.3.17

## 2.0.16

### Patch Changes

- Updated dependencies [[`ab43169`](https://github.com/tinacms/tinacms/commit/ab43169af5a95f31fa27bb0236623a031883a1fd)]:
  - @tinacms/datalayer@1.3.16

## 2.0.14

### Patch Changes

- Updated dependencies []:
  - @tinacms/datalayer@1.3.14

## 2.0.13

### Patch Changes

- [#5486](https://github.com/tinacms/tinacms/pull/5486) [`d7c5ec1`](https://github.com/tinacms/tinacms/commit/d7c5ec1b174419dcc6ddba3cfb3684dd469da571) Thanks [@JackDevAU](https://github.com/JackDevAU)! - Update dependencies across packages

- Updated dependencies [[`d7c5ec1`](https://github.com/tinacms/tinacms/commit/d7c5ec1b174419dcc6ddba3cfb3684dd469da571)]:
  - @tinacms/datalayer@1.3.13

## 2.0.12

### Patch Changes

- Updated dependencies []:
  - @tinacms/datalayer@1.3.12

## 2.0.11

### Patch Changes

- Updated dependencies []:
  - @tinacms/datalayer@1.3.11

## 2.0.10

### Patch Changes

- Updated dependencies []:
  - @tinacms/datalayer@1.3.10

## 2.0.9

### Patch Changes

- Updated dependencies []:
  - @tinacms/datalayer@1.3.9

## 2.0.8

### Patch Changes

- [#5276](https://github.com/tinacms/tinacms/pull/5276) [`f90ef4d`](https://github.com/tinacms/tinacms/commit/f90ef4d92ae7b21c8c610d14af9510354a3969c6) Thanks [@Ben0189](https://github.com/Ben0189)! - Updates minor and patch dependencies

- Updated dependencies [[`f90ef4d`](https://github.com/tinacms/tinacms/commit/f90ef4d92ae7b21c8c610d14af9510354a3969c6)]:
  - @tinacms/datalayer@1.3.8

## 2.0.7

### Patch Changes

- Updated dependencies []:
  - @tinacms/datalayer@1.3.7

## 2.0.6

### Patch Changes

- Updated dependencies []:
  - @tinacms/datalayer@1.3.6

## 2.0.5

### Patch Changes

- Updated dependencies []:
  - @tinacms/datalayer@1.3.5

## 2.0.4

### Patch Changes

- [#4843](https://github.com/tinacms/tinacms/pull/4843) [`4753c9b`](https://github.com/tinacms/tinacms/commit/4753c9b53854d19212229f985bc445b2794fad9a) Thanks [@JackDevAU](https://github.com/JackDevAU)! - ⬆️ Update Minor & Patch Dependencies Versions

- Updated dependencies [[`4753c9b`](https://github.com/tinacms/tinacms/commit/4753c9b53854d19212229f985bc445b2794fad9a)]:
  - @tinacms/datalayer@1.3.4

## 2.0.3

### Patch Changes

- [#4804](https://github.com/tinacms/tinacms/pull/4804) [`d08053e`](https://github.com/tinacms/tinacms/commit/d08053e758b6910afa8ab8952a40984921cccbc4) Thanks [@dependabot](https://github.com/apps/dependabot)! - ⬆️ Updates Typescript to v5.5, @types/node to v22.x, next.js to latest version 14.x, and removes node-fetch

- Updated dependencies [[`d08053e`](https://github.com/tinacms/tinacms/commit/d08053e758b6910afa8ab8952a40984921cccbc4)]:
  - @tinacms/datalayer@1.3.3

## 2.0.2

### Patch Changes

- @tinacms/datalayer@1.3.2

## 2.0.1

### Patch Changes

- @tinacms/datalayer@1.3.1

## 2.0.0

### Patch Changes

- Updated dependencies [324950a]
  - @tinacms/datalayer@1.3.0

## 1.0.11

### Patch Changes

- d9b23fc: Improve reference field selector
- Updated dependencies [d9b23fc]
  - @tinacms/datalayer@1.2.40

## 1.0.10

### Patch Changes

- @tinacms/datalayer@1.2.39

## 1.0.9

### Patch Changes

- e58b951: update vulnerable packages so npm audit does not complain
- 9076d09: update next js version from 12 to 14 in tinacms packages
- Updated dependencies [e58b951]
- Updated dependencies [9076d09]
  - @tinacms/datalayer@1.2.38

## 1.0.8

### Patch Changes

- @tinacms/datalayer@1.2.37

## 1.0.7

### Patch Changes

- 0503072: update ts, remove rimraf, fix types
- Updated dependencies [0503072]
  - @tinacms/datalayer@1.2.36

## 1.0.6

### Patch Changes

- @tinacms/datalayer@1.2.35

## 1.0.5

### Patch Changes

- @tinacms/datalayer@1.2.34

## 1.0.4

### Patch Changes

- @tinacms/datalayer@1.2.33

## 1.0.3

### Patch Changes

- @tinacms/datalayer@1.2.32

## 1.0.2

### Patch Changes

- @tinacms/datalayer@1.2.31

## 1.0.1

### Patch Changes

- @tinacms/datalayer@1.2.30

## 1.0.0

### Major Changes

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

### Patch Changes

- Updated dependencies [a65ca13f2]
  - @tinacms/datalayer@1.2.29
