# @tinacms/api-git

## Installation

```
yarn add @tinacms/api-git
```

## Example 1: Basic Git API Setup

```js
const express = require('express')
const cors = require('cors')
const gitApi = require('@tinacms/api-git')

const server = express()

server.use(cors())
server.use('/___tina', gitApi.router())

server.listen(port, err => {
  if (err) throw err
  console.log(`> Ready on http://localhost:${port}`)
})
```

### Example 2: Configuring the Git API

```js
const path = require('path')
const REPO_ABSOLUTE_PATH = path.join(process.cwd(), '../..')

const options = {
  pathToRepo: REPO_ABSOLUTE_PATH,
  pathToContent: 'docs',
  defaultCommitMessage: 'Edited with TinaCMS',
  defaultCommitName: 'TinaCMS',
  defaultCommitEmail: 'git@tinacms.org',
  pushOnCommit: false,
}

server.use('/___tina', gitApi.router(options))
```

- `pathToRepo`: The base-path to the repository where the content is stored in. Default: The repository root.
- `pathToContent`: The directory to the root of your app within the repository. Default: The repository root. This can be useful for monorepos, when you have multiple sites within one repository.
- `defaultCommitMessage`: The default commit message. Default: ‘Edited with TinaCMS’
- `defaultCommitName`: The default git user name.
- `defaultCommitEmail`: The default git user email.
- `pushOnCommit`: Indicates if every commit should also be pushed automatically. Default: true.

### Configure env

The following environment variables can be configured:

```
  GIT_REMOTE
  SSH_KEY
```

- `GIT_REMOTE`: Git remote where to push/pull from.
- `SSH_KEY`: Base64-encoded SSH key (with write access).
