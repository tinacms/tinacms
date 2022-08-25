---
title: Querying Tina Content in NextJS
last_edited: '2022-04-08T10:00:00.000Z'
---

## Querying Tina Content in NextJS

In NextJS, content can be queried statically at build-time or dynamically at runtime (using [SSR](https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props), or [CSR](https://nextjs.org/docs/basic-features/data-fetching/client-side)).

### Example: Fetching content through getStaticProps

```tsx
// pages/home.js
import { client } from '../[pathToTina]/.tina/__generated__/client'

const getStaticProps = async () => {
  let postResponse = {}
  try {
    postResponse = await client.queries.post({ relativePath: 'HelloWorld.md' })
  } catch {
    // swallow errors related to document creation
  }

  return {
    props: {
      data: postResponse.data,
      query: postResponse.query,
      variables: postResponse.variables,
    },
  }
}
```

### Example: Fetching content through getStaticPaths

You'll likely want to query the Tina's Content API for [dynamic routes](https://nextjs.org/docs/basic-features/data-fetching/get-static-paths#getstaticpaths).

```js
export const getStaticPaths = async () => {
  const postListResponse = await client.queries.postConnection()
  return {
    paths: postListResponse.data.postConnection.edges.map(page => ({
      params: { filename: page.node._sys.filename },
    })),
    fallback: 'blocking',
  }
}
```

### Next.js `fallback: "blocking"`

In Next.js one can specify [`fallback: "blocking"`](https://nextjs.org/docs/api-reference/data-fetching/get-static-paths#fallback-blocking), this allows `getStaticProps` to run server-side at request time when a user goes to a page that was not specified in `getStaticPaths`. This allows document-creation to work with Tina, as well as advanced NextJS features like ISR.

For a full working example of Tina + NextJS, [check out our "Barebones Starter"](https://github.com/tinacms/tina-barebones-starter).
