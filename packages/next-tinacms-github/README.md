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

import { createAuthHandler } from 'next-tinacms-github'

export default createAuthHandler(
  process.env.GITHUB_CLIENT_ID,
  process.env.GITHUB_CLIENT_SECRET
)
```

_See [Next's documentation](https://nextjs.org/docs/api-reference/next.config.js/environment-variables) for adding environment variables_

[See below](#github-oauth-app) for instructions on creating a Github OAuth App to generate these **Client ID** & **Client Secret** variables.

### `apiProxy`

Proxies requests to GitHub, attaching the GitHub access token in the process

```
// pages/api/proxy-github.ts

import { apiProxy } from 'next-tinacms-github'

export default apiProxy
```

### `previewHandler`

Handles setting the the Nextjs [preview data](https://nextjs.org/docs/advanced-features/preview-mode) from your cookie data.

```
// pages/api/preview.ts

import { previewHandler } from 'next-tinacms-github'

export default previewHandler
```

### Loading content from Github

The `preview` data, which gets set by calling your [preview function](#previewhandler), will be accesible through `getStaticProps` throughout your app.

```ts
//Blog template [slug].ts

import {
  getGithubPreviewProps
  parseMarkdown,
} from 'next-tinacms-github'

// ...

export const getStaticProps: GetStaticProps = async function({
  preview,
  previewData,
  ...ctx
}) {
  if (preview) {
    return getGithubPreviewProps({
      ...previewData,
      fileRelativePath: 'src/content/home.json',
      parse: parseMarkdown
    });
  }
  return {
    props: {
      sourceProvider: null,
      error: null,
      preview,
      file: {
        fileRelativePath: 'src/content/home.json',
        data: (await import('../content/home.json')).default,
      },
    },
  };
}
```


### Github Oauth App:

In GitHub, within your account Settings, click [Oauth Apps](https://github.com/settings/developers) under Developer Settings.

click "New Oauth App".

For the **Authorization callback URL**, enter the url for the "authorizing" page that you created above (e.g https://your-url/github/authorizing). Fill out the other fields with your custom values.
_Note: If you are testing your app locally, you may need a separate development Github app (with a localhost redirect), and a production Github app._

The generated **Client ID** & **Client Secret** will be consumed by the `createCreateAccessTokenFn` [defined above](#createcreateaccesstokenfn).

## Next steps

Now that we have configured our backend API functions to manage our Github authentication token, we will need to configure the front-end to use these endpoints.
You may want to use the [react-tinacms-github](https://github.com/tinacms/tinacms/tree/master/packages/react-tinacms-github) package.
