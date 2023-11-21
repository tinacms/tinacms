# tinacms-clerk

## 1.0.1

### Patch Changes

- tinacms@1.5.25

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

### Patch Changes

- Updated dependencies [a65ca13f2]
  - tinacms@1.5.24
