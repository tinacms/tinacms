# @tinacms/self-hosted-starter

## 0.1.40

### Patch Changes

- @tinacms/datalayer@1.2.30
- tinacms-authjs@1.0.2
- tinacms-gitprovider-github@1.0.1
- tinacms@1.5.25

## 0.1.39

### Patch Changes

- Updated dependencies [b1604e84d]
  - tinacms-authjs@1.0.1

## 0.1.38

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
  - tinacms-gitprovider-github@1.0.0
  - tinacms-authjs@1.0.0
  - @tinacms/datalayer@1.2.29
  - tinacms@1.5.24

## 0.1.37

### Patch Changes

- Updated dependencies [131b4dc55]
- Updated dependencies [93bfc804a]
- Updated dependencies [1fc2c4a99]
- Updated dependencies [693cf5bd6]
- Updated dependencies [afd1c7c97]
- Updated dependencies [a937aabf0]
- Updated dependencies [661239b2a]
- Updated dependencies [630ab9436]
  - tinacms@1.5.23
  - @tinacms/datalayer@1.2.28

## 0.1.36

### Patch Changes

- Updated dependencies [b6fbab887]
- Updated dependencies [4ae43fdde]
- Updated dependencies [aec44a7dc]
  - tinacms@1.5.22
  - @tinacms/datalayer@1.2.27

## 0.1.35

### Patch Changes

- Updated dependencies [177002715]
- Updated dependencies [e69a3ef81]
- Updated dependencies [c925786ef]
- Updated dependencies [9f01550dd]
  - tinacms@1.5.21
  - @tinacms/datalayer@1.2.26

## 0.1.34

### Patch Changes

- Updated dependencies [7e4de0b2a]
- Updated dependencies [1144af060]
  - tinacms@1.5.20
  - @tinacms/datalayer@1.2.25

## 0.1.33

### Patch Changes

- Updated dependencies [1563ce5b2]
- Updated dependencies [e83ba8855]
  - tinacms@1.5.19
  - @tinacms/datalayer@1.2.24

## 0.1.32

### Patch Changes

- Updated dependencies [9c27087fb]
- Updated dependencies [65d0a701f]
- Updated dependencies [133e97d5b]
- Updated dependencies [f02b4368b]
- Updated dependencies [37cf8bd40]
- Updated dependencies [ad22e0950]
- Updated dependencies [8db979b9f]
- Updated dependencies [7991e097e]
- Updated dependencies [30c7eac58]
- Updated dependencies [121bd9fc4]
  - tinacms@1.5.18
  - @tinacms/datalayer@1.2.23

## 0.1.31

### Patch Changes

- Updated dependencies [bc812441b]
  - @tinacms/datalayer@1.2.22
  - tinacms@1.5.17

## 0.1.30

### Patch Changes

- Updated dependencies [1889422b0]
  - tinacms@1.5.16
  - @tinacms/datalayer@1.2.21

## 0.1.29

### Patch Changes

- tinacms@1.5.15
- @tinacms/datalayer@1.2.20

## 0.1.28

### Patch Changes

- Updated dependencies [f1e8828c8]
- Updated dependencies [304e23318]
  - tinacms@1.5.14

## 0.1.27

### Patch Changes

- Updated dependencies [495108725]
- Updated dependencies [b0eba5d49]
  - tinacms@1.5.13
  - @tinacms/datalayer@1.2.19

## 0.1.26

### Patch Changes

- tinacms@1.5.12

## 0.1.25

### Patch Changes

- Updated dependencies [c7fa6ddc0]
- Updated dependencies [6e192cc38]
- Updated dependencies [5aaae9902]
  - tinacms@1.5.11
  - @tinacms/datalayer@1.2.18

## 0.1.24

### Patch Changes

- tinacms@1.5.10
- @tinacms/datalayer@1.2.17

## 0.1.23

### Patch Changes

- Updated dependencies [c385b5615]
- Updated dependencies [d2ddfa5a6]
- Updated dependencies [9489d5d47]
  - tinacms@1.5.9
  - @tinacms/datalayer@1.2.16

## 0.1.22

### Patch Changes

- tinacms@1.5.8

## 0.1.21

### Patch Changes

- Updated dependencies [385c8a865]
- Updated dependencies [ccd928bc3]
  - tinacms@1.5.7
  - @tinacms/datalayer@1.2.15

## 0.1.20

### Patch Changes

- @tinacms/datalayer@1.2.14

## 0.1.19

### Patch Changes

- Updated dependencies [5a6018916]
  - tinacms@1.5.6
  - @tinacms/datalayer@1.2.13

## 0.1.18

### Patch Changes

- tinacms@1.5.5
- @tinacms/datalayer@1.2.12

## 0.1.17

### Patch Changes

- Updated dependencies [f6e2ec5e9]
  - tinacms@1.5.4
  - @tinacms/datalayer@1.2.11

## 0.1.16

### Patch Changes

- Updated dependencies [3532d07f3]
- Updated dependencies [6d1465fd8]
  - tinacms@1.5.3
  - @tinacms/datalayer@1.2.10

## 0.1.15

### Patch Changes

- Updated dependencies [e7f4c0a96]
- Updated dependencies [ff8673515]
  - tinacms@1.5.2
  - @tinacms/datalayer@1.2.9

## 0.1.14

### Patch Changes

- Updated dependencies [790b1e1ae]
- Updated dependencies [eba7e5e5e]
  - tinacms@1.5.1

## 0.1.13

### Patch Changes

- 40dd5b7ef: Show a simple message to editors to alert them to the fact that sorting by a non-required field can exclude some documents. The message will only appear when an editor actually runs a sort using a non-required field. The original issue issue is visible in this video: https://www.loom.com/share/244853da315e4f959ebf371d662192dd
- Updated dependencies [675c4cfde]
- Updated dependencies [eeedcfd30]
- Updated dependencies [40dd5b7ef]
- Updated dependencies [0f90e9520]
- Updated dependencies [d9d773a24]
- Updated dependencies [63454fa1e]
  - tinacms@1.5.0
  - @tinacms/datalayer@1.2.8

## 0.1.12

### Patch Changes

- Updated dependencies [709b6f2ec]
  - tinacms@1.4.6
  - @tinacms/datalayer@1.2.7

## 0.1.11

### Patch Changes

- Updated dependencies [75d5ed359]
  - tinacms@1.4.5
  - @tinacms/datalayer@1.2.6

## 0.1.10

### Patch Changes

- Updated dependencies [7c750e370]
  - tinacms@1.4.4
  - @tinacms/datalayer@1.2.5

## 0.1.9

### Patch Changes

- @tinacms/datalayer@1.2.4

## 0.1.8

### Patch Changes

- Updated dependencies [1370ebae6]
  - tinacms@1.4.3
  - @tinacms/datalayer@1.2.3

## 0.1.7

### Patch Changes

- Updated dependencies [0626ba381]
  - tinacms@1.4.2
  - @tinacms/datalayer@1.2.2

## 0.1.6

### Patch Changes

- Updated dependencies [9a8074889]
- Updated dependencies [d0c4801b7]
  - tinacms@1.4.1
  - @tinacms/datalayer@1.2.1

## 0.1.5

### Patch Changes

- Updated dependencies [76c984bcc]
- Updated dependencies [202cd714d]
  - @tinacms/datalayer@1.2.0
  - tinacms@1.4.0

## 0.1.4

### Patch Changes

- tinacms@1.3.3
- @tinacms/datalayer@1.1.6

## 0.1.3

### Patch Changes

- tinacms@1.3.2

## 0.1.2

### Patch Changes

- tinacms@1.3.1
- @tinacms/datalayer@1.1.5

## 0.1.1

### Patch Changes

- Updated dependencies [964a6985b]
- Updated dependencies [4cd5cd4f7]
- Updated dependencies [9c277e179]
- Updated dependencies [f831dcf4f]
- Updated dependencies [8d5c923c7]
  - tinacms@1.3.0
  - @tinacms/datalayer@1.1.4
