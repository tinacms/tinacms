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

| Option   | Description                    |
| -------- | ------------------------------ |
| `branch` | The branch to save content to. |
| `owner`  | The owner of the repo.         |
| `repo`   | The repo to save content to.   |

### Optional Options

You must either supply a `token` or an alternative authentication strategy via the `octokitOptions`

| Option           | Description                                                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `commitMessage`  | The commit message to use when saving content. Defaults to `Edited with TinaCMS`.                                           |
| `rootPath`       | This path will be prefixed to all paths (good for monorepos)                                                                |
| `token`          | A [Github Personal Access Token](https://github.com/settings/personal-access-tokens/new).                                   |
| `octokitOptions` | Options passed to the [Octokit constructor ](https://github.com/octokit/octokit.js/blob/main/README.md#constructor-options) |

## Using the GitHubBridge

- Designed for use in your `.tina/database.ts` or `tina/database.ts` file.
- **Allows you to use Tina self-hosting in conjunction with separate content repositories**
- One important caveat is that this approach could lead to GitHub rate limiting errors on certain projects, particularly larger sites with lots of pages/files. This could occur given the GitHubBridge makes requests directly to the GitHub API.
- The ability to pass `tinaFilesConfig` is intended to support multi-tenant projects where the Tina folder lives in the code repository so the content repositories do not need to contain any Tina folders or files at all. In this case the GitHub bridge will defer to the FilesystemBridge to retrieve the auto-generated Tina files, so those files do not need to be committed or tracked in the content repositories. This is particularly useful when multiple content repositories/sites are built from a central code repository.

```ts
import { createDatabase, createLocalDatabase } from '@tinacms/datalayer'
import { RedisLevel } from 'upstash-redis-level'
import { GitHubProvider, GitHubBridge } from 'tinacms-gitprovider-github'
import { createAppAuth } from '@octokit/auth-app'

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true'

const github = {
  owner: 'your-org-or-username',
  repo: 'your-repo-name',
  branch: 'main',
}

const database = isLocal
  ? createLocalDatabase()
  : createDatabase({
      bridge: isLocal
        ? undefined
        : new GithubBridge({
            owner: github.owner,
            repo: github.repo,
            branch: github.branch,
            // The rootPath value is particularly useful for mono repos
            // rootPath: 'packages/some-site',
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
            // Optionally find Tina files in the code repo instead of the content repo
            tinaFilesConfig: {
              useFilesystemBridge: true,
              tinaFolderPath: '',
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

**Summary:** Supports all Git Provider Options listed above except for `commitMessage`, and also allows for a `tinaFilesConfig` option to be provided (in order to configure the GitHubBridge to find the Tina files in the local filesystem of the content repository, rather than looking for those in the code repository)

| Option   | Description                    |
| -------- | ------------------------------ |
| `branch` | The branch to save content to. |
| `owner`  | The owner of the repo.         |
| `repo`   | The repo to save content to.   |

### Optional Options

You must either supply a `token` or an alternative authentication strategy via the `octokitOptions`

| Option            | Description                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `rootPath`        | This path will be prefixed to all paths (good for monorepos)                                                                |
| `token`           | A [Github Personal Access Token](https://github.com/settings/personal-access-tokens/new).                                   |
| `octokitOptions`  | Options passed to the [Octokit constructor ](https://github.com/octokit/octokit.js/blob/main/README.md#constructor-options) |
| `tinaFilesConfig` | Can be used to find Tina files in the code repository (useful to avoid committing Tina files to content repositories)       |

The `tinaFilesConfig` option is an object with 2 keys:

- the `useFilesystemBridge` is a boolean you can set to `true` if you would like to find Tina files in the local filesystem of the code repository, rather than retrieving those files from the content repository
- the `tinaFolderPath` is the path to where the Tina folder resides in the local filesystem of the code repository
