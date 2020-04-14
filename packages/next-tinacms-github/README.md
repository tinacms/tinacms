# next-tinacms-github

This package provides helpers for managing the github auth token on the server.
When used with Next.js in the `pages/api` directory, these functions are mapped to `/api/*` endpoints.

# `createAuthHandler`
Helper for creating a handler to authenticate with GitHub.

## Implementation

```
// pages/api/create-github-access-token.ts

import { createAuthHandler } from 'next-tinacms-github'

export default createAuthHandler(
  process.env.GITHUB_CLIENT_ID,
  process.env.GITHUB_CLIENT_SECRET
)
```

# `apiProxy`
Proxies requests to GitHub, attaching the GitHub access token in the process

## Implementation

```
// pages/api/proxy-github.ts

import { apiProxy } from 'next-tinacms-github'

export default apiProxy
```

# `previewHandler`
Handles setting the preview data from Github cookies

## Implementation

```
// pages/api/preview.ts

import { previewHandler } from 'next-tinacms-github'

export default previewHandler

```