# _gatsby-tinacms-git_

A Gatsby/Tina plugin for **editing content/data files stored in git**.

## Installation

```sh
yarn add gatsby-plugin-tinacms gatsby-tinacms-git
```

## Setup

Include `gatsby-plugin-tinacms` and `gatsby-tinacms-git`in your config:

_gatsby-config.js_

```javascript
module.exports = {
  // ...
  plugins: [
    // ...
    {
      resolve: 'gatsby-plugin-tinacms',
      options: {
        plugins: ['gatsby-tinacms-git'],
      },
    },
  ],
}
```

## Options

```ts
// reference @tinacms/api-git

interface GitServerConfig extends GitRouterConfig {
  pathToRepo: string
  pathToContent: string
  gitRemote?: string
  sshKey?: string
}

interface GitRouterConfig {
  defaultCommitMessage: string
  defaultCommitName: string
  defaultCommitEmail: string
  pushOnCommit: boolean
}

const DEFAULT_OPTIONS: GitRouterConfig = {
  defaultCommitMessage: 'Edited with TinaCMS',
  defaultCommitName: 'TinaCMS',
  defaultCommitEmail: 'git@tinacms.org',
  pushOnCommit: true,
}
```

| Option                     | Description                                    |
| -------------------------- | ---------------------------------------------- |
| `pathToRepo`            |  The base-path to the repository where the content is stored in. Default: The repository root.                      |
| `pathToContent`          | The directory to the root of your app within the repository. Default: The repository root. This can be useful for monorepos, when you have multiple sites within one repository.                   |
| `defaultCommitMessage`        |  The default commit message. Default: 'Edited with TinaCMS'                 |
| `defaultCommitName`        | The default Git user name.                |
| `defaultCommitEmail`  | The default Git user email.|
| `pushOnCommit`| Indicates if every commit should also be pushed automatically. _Default_: `true`.|
| `gitRemote`|  Git SSH remote url for the repository. Default: `undefined`.|
| `sshKey`|  Base64 encoded SSH private key that has access to the repository. **This should not be committed to your repository.** This value should be `undefined` or load the key from an environment variable (ie. `process.env.SSH_KEY`). _Default_: `undefined`.|

> ### Configuring the File Writing Debounce
>
> The `TINA_GIT_DEBOUNCE_MS` environment variable can be used to change
> the debounce rate for file writing. This value defaults to `1000`
> milliseconds.
>
> ```
> TINA_GIT_DEBOUNCE_MS=3000 gatsby develop
> ```
>
> This is useful when running in your site in cloud editing environment
> i.e. [Gatsby Cloud](https://tinacms.org/blog/using-tinacms-on-gatsby-cloud) or
> Heroku.
