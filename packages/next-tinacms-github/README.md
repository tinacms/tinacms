# _next-tinacms-github_

This package provides helpers for managing the **GitHub auth token** for requests, as well as
providing helpers for **loading content from the Github API**.

## Installation

```bash
yarn add next-tinacms-github
```

Any functions in the `pages/api` directory are mapped to `/api/*` endpoints. The below helpers tend to be added to the `pages/api` directory in a Next.js project.

### `authHandler`

Helper for creating a `authHandler` server function.

**pages/api/create-github-access-token.ts**

```js
import { createAuthHandler } from 'next-tinacms-github'

export default createAuthHandler(
  process.env.GITHUB_CLIENT_ID,
  process.env.GITHUB_CLIENT_SECRET,
  process.env.SIGNING_KEY
)
```

_See [Next's documentation](https://nextjs.org/docs/api-reference/next.config.js/environment-variables) for adding environment variables_

[See here](https://tinacms.org/guides/nextjs/github-open-authoring/github-oauth-app) for instructions on creating a Github OAuth App to generate these **Client ID** & **Client Secret** variables and setting up the **Signing Key**.

### `apiProxy`

Proxies requests to GitHub, attaching the GitHub access token in the process.

**pages/api/proxy-github.ts**

```ts
import { apiProxy } from 'next-tinacms-github'

export default apiProxy(process.env.SIGNING_KEY)
```

### `previewHandler`

Handles setting the the Nextjs [preview data](https://nextjs.org/docs/advanced-features/preview-mode) from your cookie data.

**pages/api/preview.ts**

```ts
import { previewHandler } from 'next-tinacms-github'

export default previewHandler(process.env.SIGNING_KEY)
```

### Loading content from Github

The `preview` data, which gets set by calling your [preview function](#previewhandler), will be accessible through `getStaticProps` throughout your app.

Below is an example of the conditional data fetching, from the local environment or _Working GitHub Repository_ based on the preview environment:

**/blog/slug.ts**

```ts
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

### _getGithubPreviewProps_

The `getGithubPreviewProps` function accepts this preview data:

```ts
interface PreviewData<Data> {
  github_access_token: string
  working_repo_full_name: string
  head_branch: string
  fileRelativePath: string
  parse(content: string): Data
}
```

It then fetches the content from the _Working GitHub Repository_ and returns a `props` object with this shape:

```js
return {
  props: {
    file,
    repoFullName: workingRepoFullName,
    branch: headBranch,
    preview: true,
    error,
  },
}
```


#### _getGithubFile

In some cases you'll need to load multiple files from Github. For this reason the underlying `getGithubFile` function is exposed, which uses the same interface as `getGithubPreviewProps`.

```ts
import {
  getGithubFile,
  parseJson,
  parseMarkdown,
} from 'next-tinacms-github'

export const getStaticProps: GetStaticProps = async function({
  preview,
  previewData,
  ...ctx
}) {
  const githubOptions = {
    working_repo_full_name: previewData?.working_repo_full_name || 'https://github.com/youre/respository',
    head_branch: previewData?.head_branch || 'master',
    github_access_token: previewData?.github_access_token || '',
  }

  const homeFile = await getGithubFile({
    ...githubOptions,
    fileRelativePath: "content/index.md
    parse: parseMarkdown
  })

  const navigationFile = await getGithubFile({
    ...githubOptions,
    fileRelativePath: "data/navigation.json
    parse: parseJson
  })

  return {
    preview,
    homeFile,
    navigationFile,
  }
}
```

### Parsing Data

`next-tinacms-github` provides two content parsing options available, for Markdown — `parseMarkdown` or JSON — `parseJson`. Or you could pass in a custom parser.

## _NextGithubMediaStore_

`next-tinacms-github` includes a media store for managing media files with GitHub. Based on [GithubMediaStore](https://tinacms.org/packages/react-tinacms-github/#githubmediastore), it includes **logic for serving uploads from the `public/` directory**.

This media store is initialized similar to `GithubMediaStore`:

```ts
import { TinaCMS } from 'tinacms'
import { GithubClient } from 'react-tinacms-github'
import { NextGithubMediaStore } from 'next-tinacms-github'

const githubClient = new GithubClient({
  proxy: '/api/proxy-github',
  authCallbackRoute: '/api/create-github-access-token'
  clientId: process.env.GITHUB_CLIENT_ID,
  baseRepoFullName: process.env.REPO_FULL_NAME
})

const mediaStore = new NextGithubMediaStore(githubClient)

const cms = new TinaCMS({
  apis: {
    github: githubClient // equivalent to cms.registerApi('github', githubClient)
  },
  media: mediaStore
})

```

### _previewSrc_

_NextGithubMediaStore_ handles `previewSrc` so you **shouldn't need to set this** on individual image fields. However, if you do need to override `previewSrc` for a specific field, you need to get the full url to the source GitHub repository. The return value should connect to an actual path in a GitHub repo where the image is hosted. 

```js
// Exmaple image field config
const formOptions = {
  fields: [
    {
      label: 'Hero Image',
      name: 'frontmatter.hero_image',
      component: 'image',
      parse: media => `/${media.filename}`,
      uploadDir: () => '/public/',
      previewSrc: fieldValue => {
        const githubClient = useGithubClient()

        return githubClient.getDownloadUrl(path.join('public', fieldValue))
      },
    },
  ],
  //...
}
```

> The reason why the full GitHub url needs to be provided is that new images are uploaded to the repository on a particular branch. If you are working locally, this can be a bit confusing because the path saved to the source file will be different than this `previewSrc` url. Remember when developing locally with this package that `previewSrc` urls are connecting to GitHub repository and not your local file paths. 

You still need to set uploadDir to 'public' if you want the media manager to open directly from that folder, otherwise it will open from and upload to the repository root. 
