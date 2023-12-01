The Github Git Provider handles saving and deleting content to GitHub. It can be used as a prop to the `createDatabase` function.

## Adding the GitHub Git Provider

```ts
import { GithubProvider } from 'tinacms-gitprovider-github'
// database.{ts,js}
//...

export default isLocal ? createLocalDatabase() ? createDatabase({
    gitProvider: new GitHubProvider({
        branch: process.env.GITHUB_BRANCH,
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        token: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
      }),,
    // ...
})
```

## Github Git Provider Options

### Required Options

| Option   | Description                                                                               |
| -------- | ----------------------------------------------------------------------------------------- |
| `branch` | The branch to save content to.                                                            |
| `owner`  | The owner of the repo.                                                                    |
| `repo`   | The repo to save content to.                                                              |
| `token`  | A [Github Personal Access Token](https://github.com/settings/personal-access-tokens/new). |

### Optional Options

| Option           | Description                                                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `commitMessage`  | The commit message to use when saving content. Defaults to `Edited with TinaCMS`.                                           |
| `rootPath`       | This path will be prefixed to all paths (good for monorepos)                                                                |
| `octokitOptions` | Options passed to the [Octokit constructor ](https://github.com/octokit/octokit.js/blob/main/README.md#constructor-options) |

## Using the GitHubBridge

- Designed for use in your `.tina/database.ts` or `tina/database.ts` file.
- **Allows you to use Tina self-hosting in conjunction with separate content repositories**
- One important caveat is that this approach could lead to GitHub rate limiting errors on certain projects, particularly larger sites with lots of pages/files
- The ability to pass `systemFiles` to the `GithubBridge` is intended to allow multi-tenant projects where the content repos do not need to contain any Tina folders or files at all. The code repository can pass the necessary Tina system files to the GitHub bridge at built time, and no Tina files need to be committed or tracked in the content repositories. This is particularly useful when multiple content repositories/sites are built from a central code repository

```ts
import { createDatabase, createLocalDatabase } from '@tinacms/datalayer'
import { RedisLevel } from 'upstash-redis-level'
import {
  GitHubProvider,
  GitHubBridge,
  type SystemFiles,
} from 'tinacms-gitprovider-github'
import { createAppAuth } from '@octokit/auth-app'
// These example imports would be related to your database.ts file
import graphql from './__generated__/_graphql.json'
import lookup from './__generated__/_lookup.json'

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true'

const systemFiles: SystemFiles = {
  _graphql: graphql as SystemFiles['_graphql'],
  _lookup: lookup as SystemFiles['_lookup'],
}

const github = {
  owner: 'your-org-or-username',
  repo: 'your-repo-name',
  branch: 'main',
}

const database = isLocal
  ? createLocalDatabase()
  : createDatabase({
      // You can pass system files to the GitHubBridge on init.
      // It then fetches all other files from the content repo.
      bridge: isLocal
        ? undefined
        : new GithubBridge({
            owner: github.owner,
            repo: github.repo,
            branch: github.branch,
            // The rootPath value is particularly useful for mono repos
            // rootPath: 'packages/some-site',
            systemFiles,
            // Either provide a token or a separate auth strategy like the example below
            // token: 'github-personal-access-token',
            octokitOptions: {
              authStrategy: createAppAuth,
              auth: {
                appId: process.env.GITHUB_APP_ID,
                privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
                installationId: process.env.GITHUB_APP_INSTALLATION_ID,
                // repositoryIds: [], // number[]
                // repositoryNames: [], // string[]
                // permissions: {}, // Permissions
                // refresh: true, // boolean
              },
            },
          }),
      // The contentNamespace for files in your site's Redis DB
      // When left blank it defaults to a value of 'tinacms'
      namespace: 'your-namespace',
      // The tinaDirectory defaults to the 'tina' folder name
      // tinaDirectory: '.tina',
      // databaseAdapter: new RedisLevel<string, Record<string, any>>({
      //   // This sets the name of the Redis hash for your site
      //   namespace: 'my-site',
      //   redis: {
      //     url: process.env.KV_REST_API_URL ?? 'http://localhost:8079',
      //     token: process.env.KV_REST_API_TOKEN ?? '',
      //   },
      //   debug: process.env.DEBUG === 'true' || false,
      // }) as any,
      databaseAdapter: new MongodbLevel<string, Record<string, any>>({
        dbName: 'your-site',
        collectionName: 'branch-name',
        mongoUri: process.env.MONGODB_URI as string,
      }),
      // https://tina.io/docs/reference/self-hosted/git-provider/github/
      gitProvider: new GitHubProvider({
        owner: github.owner,
        repo: github.repo,
        branch: github.branch,
        commitMessage: 'Content update from TinaCMS',
        // The rootPath value is particularly useful for mono repos
        // rootPath: 'packages/some-site',
        // Either provide a token or a separate auth strategy like the example below
        // token: 'github-personal-access-token',
        // https://github.com/octokit/octokit.js/blob/main/README.md#constructor-options
        octokitOptions: {
          authStrategy: createAppAuth,
          auth: {
            appId: process.env.GITHUB_APP_ID,
            privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
            installationId: process.env.GITHUB_APP_INSTALLATION_ID,
            // repositoryIds: [], // number[]
            // repositoryNames: [], // string[]
            // permissions: {}, // Permissions
            // refresh: true, // boolean
          },
        },
      }),
    })

export default database
```

## GitHubBridge options

**Summary:** Supports all Git Provider Options listed above except for `commitMessage`, and also allows for `systemFiles` to be provided (containing a copy of the local `_graphql.json` and `_lookup.json`)

| Option   | Description                                                                               |
| -------- | ----------------------------------------------------------------------------------------- |
| `branch` | The branch to save content to.                                                            |
| `owner`  | The owner of the repo.                                                                    |
| `repo`   | The repo to save content to.                                                              |
| `token`  | A [Github Personal Access Token](https://github.com/settings/personal-access-tokens/new). |

### Optional Options

| Option           | Description                                                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `rootPath`       | This path will be prefixed to all paths (good for monorepos)                                                                |
| `systemFiles`    | Pass the local `_graphql.json` and `_lookup.json` (useful to avoid committing Tina files to content repositories)           |
| `octokitOptions` | Options passed to the [Octokit constructor ](https://github.com/octokit/octokit.js/blob/main/README.md#constructor-options) |
