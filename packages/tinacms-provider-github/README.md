he Github Git Provider handles saving and deleting content to github. It can be used as a prop to the `createDatabase` function.

## Adding the Github Git Provider

```ts
import { GithubProvider } from 'tinacms-provider-github'
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
