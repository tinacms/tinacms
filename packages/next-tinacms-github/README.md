# next-tinacms-github

This package provides helpers for managing the github auth token on the server.
When used with Next.js in the `pages/api` directory, these functions are mapped to `/api/*` endpoints.

# `createCreateAccessTokenFn`
Helper for creating a createCreateAccessToken server function.

## Implementation

```
// pages/api/create-github-access-token.ts

import { createCreateAccessTokenFn } from 'next-tinacms-github'

export default createCreateAccessTokenFn(
  process.env.GITHUB_CLIENT_ID,
  process.env.GITHUB_CLIENT_SECRET
)
```

# `createProxy`
Helper for creating a proxy which attaches this Github access token to the request

## Implementation

```
// pages/api/proxy-github.ts

import { apiProxy } from 'next-tinacms-github'

export default apiProxy
```

# `createPreviewFn`
Helper for creating a preview function which will set the preview data from Github cookies

## Implementation

```
// pages/api/preview.ts

import { previewHandler } from 'next-tinacms-github'

export default previewHandler

```