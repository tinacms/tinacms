---
'@tinacms/datalayer': minor
'@tinacms/self-hosted-starter': patch
'@tinacms/graphql': patch
'@tinacms/cli': patch
---

## Changes
- deprecate onPut, onDelete and the level args to `createDatabase`
- adds `databaseAdapter` instead of `level`
- adds `gitProvider` instead of onPut and onDelete. 
- adds `GitHubProvider` to  `@tinacms/datalayer`
- adds `gitProvider` to interface to `@tinacms/graphql`
- adds the generated database client


The database.ts file can now look like this.
```ts
import {
  createDatabase,
  createLocalDatabase,
  GitHubProvider,
} from '@tinacms/datalayer'
import { MongodbLevel } from 'mongodb-level'

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
        collectionName: process.env.GITHUB_BRANCH,
        dbName: 'tinacms',
        mongoUri: process.env.MONGODB_URI,
      }),
    })
```


## Migrating Database.ts

### OnPut and OnDelete

We are deprecating onPut and onDelete. You can now use the `gitProvider` to do the same thing. 

We also provide a `GitHubProvider` that you can use (If you are using Github). 

Instead of defining `onPut` and `onDelete` you can now do this:

```ts
// We now provide a GitHubProvider that you can use.
const gitProvider new GitHubProvider({
  branch: process.env.GITHUB_BRANCH,
  owner: process.env.GITHUB_OWNER,
  repo: process.env.GITHUB_REPO,
  token: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
})
```

If you are using a different git provider you can implement the `GitProvider` interface:

```ts
class CustomGitProvider implements GitProvider {
    async onPut(key: string, value: string) {
        // ...
    }
    async onDelete(key: string) {
        // ...
    }
}
const gitProvider = new CustomGitProvider()
```

### Renaming `level` to `databaseAdapter`

In order to clarify the purpose of the `level` property, we are renaming it to `databaseAdapter`.  In most cases you can use a provided implementation:


```diff 
createDatabase({
-      level: new MongodbLevel<string, Record<string, any>>({
-        collectionName: process.env.GITHUB_BRANCH,
-        dbName: 'tinacms',
-        mongoUri: process.env.MONGODB_URI,
-      }),
+      databaseAdapter: new MongodbLevel<string, Record<string, any>>({
+        collectionName: process.env.GITHUB_BRANCH,
+        dbName: 'tinacms',
+        mongoUri: process.env.MONGODB_URI,
+      }),
    })
```

### createLocalDatabase

We now provide a `createLocalDatabase` function that you can use to create a local database. Previously you would have to implement this yourself and pass the correct handlers to `createDatabase`:
```ts
import { createLocalDatabase } from '@tinacms/datalayer'
createLocalDatabase(port)
```

### Putting it all together


```diff
// database.{ts,js}
// ...
- const githubOnPut = async (key, value) => {
-    //...
- }
- const githubOnDelete = async (key) => {
-     //...
- }
- const localOnPut = async (key, value) => {
-    //...
- }
- const localOnDelete = async (key) => {
-    //...
- }


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
        collectionName: process.env.GITHUB_BRANCH,
        dbName: 'tinacms',
        mongoUri: process.env.MONGODB_URI,
      }),
    })
```

The final database.{ts,js} file can now look like this.

```ts
import {
  createDatabase,
  createLocalDatabase,
  GitHubProvider,
} from '@tinacms/datalayer'
import { MongodbLevel } from 'mongodb-level'

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
        collectionName: process.env.GITHUB_BRANCH,
        dbName: 'tinacms',
        mongoUri: process.env.MONGODB_URI,
      }),
    })

```