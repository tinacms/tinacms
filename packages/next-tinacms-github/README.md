# next-tinacms-github

This package provides helpers for managing the github auth token for requests, as well as
providing helpers for loading content from the Github API.

## Installation

```
npm install --save next-tinacms-github
```

or

```
yarn add next-tinacms-github
```

## Getting Started

Any functions in the `pages/api` directory are are mapped to `/api/*` endpoints.


### `createCreateAccessTokenFn`

Helper for creating a `createCreateAccessToken` server function.

```
// pages/api/create-github-access-token.ts

import { createCreateAccessTokenFn } from 'next-tinacms-github'

export default createCreateAccessTokenFn(
  process.env.GITHUB_CLIENT_ID,
  process.env.GITHUB_CLIENT_SECRET
)
```

[See below](#github-oauth-app) for creating a Github Oauth App provides these **Client ID** & **Client Secret** variables.

### `createProxy`

Helper for creating a proxy which attaches the user's Github access token to each request

```
// pages/api/proxy-github.ts

import { createProxy } from 'next-tinacms-github'
import { GITHUB_ACCESS_TOKEN_COOKIE_KEY } from './constants'

export default createProxy(GITHUB_ACCESS_TOKEN_COOKIE_KEY)
```

### `createPreviewFn`

Helper for creating a preview function which will set the Nextjs [preview data](https://nextjs.org/docs/advanced-features/preview-mode) from your cookie data.

```
// pages/api/preview.ts

import { createPreviewFn } from 'next-tinacms-github'

const forkCookieKey = 'fork_full_name'
const headBranchCookieKey =  'head_branch'
const githubAccessTokenCookieKey = 'github_access_token'

export default createPreviewFn(
  forkFullName,
  headBranch,
  githubAccessToken
)
```

### Loading content from Github

This preview data set from calling your [preview function](#createpreviewfn) will be accesible through `getStaticProps` throughout your app.

```ts
//Blog template [slug.ts]

import {
  getMarkdownFile as getGithubMarkdownFile,
} from 'next-tinacms-github'

// ...

export const getStaticProps: GetStaticProps = async function({
  preview,
  previewData,
  ...ctx
}) {
  const { slug } = ctx.params

  let file = {}
  const filePath = `content/blog/${slug}.md`

  const sourceProviderConnection = {
    forkFullName: previewData.fork_full_name,
    headBranch: previewData.head_branch || 'master', 
  }

  if(preview)
  {
    file = await getGithubMarkdownFile(filePath,
      sourceProviderConnection, 
      previewData.accessToken)
  }
  else 
  {
    // Get your production content here
    // when you are not in edit-mode
     file = await readLocalMarkdownFile(filePath)
  }

  return {
    props: {
      sourceProviderConnection
      editMode: !!preview,
      file,
    },
  }
}
```


### Github Oauth App:

In GitHub, within your account Settings, click [Oauth Apps](https://github.com/settings/developers) under Developer Settings.

click "New Oauth App".

For the **Authorization callback URL**, enter the url for the "authorizing" page that you created above (e.g https://your-url/github/authorizing). Fill out the other fields with your custom values.

The generated **Client ID** & **Client Secret** will be consumed by the `createCreateAccessTokenFn` defined above.

## Next steps

Now that we have configured our backend API functions to manage our Github authentication token, we will need to configure the front-end to use these endpoints.
You may want to use the [next-tinacms-github](https://github.com/tinacms/tinacms/tree/master/packages/react-tinacms-github) package.