---
title: Data Fetching
id: '/docs/features/data-fetching'
next: '/docs/tinacms-context'
---

## Introduction

With Tina, your content is stored in Git along with your codebase. Tina provides an API to query your content through GraphQL, based on your defined content models.

Here's an example of how the data-fetching for a basic "post" ties together with the content modelling (defined in `schema.ts`).

<iframe width="100%" height="450px" src="https://tina-gql-playground.vercel.app/basic" />

Note that `getPostDocument` is not built-in to Tina's API. This is an example of a query based on YOUR defined schema, (where you have a "post" collection defined).

> For more information on writing queries for your specific schema, check out our ["Using the GraphQL API"](/docs/graphql/overview/) docs.

## The Local Filesystem-based Content API

With Tina, your content is all stored in filesystem, within your site's repo. Using file-based content in a site can be limited, so Tina provides a CLI tool that gets run locally next to your site, which allows all of your content to make available through an expressive GraphQL API.

> We'll go over those details of running this CLI script later, but if you want to skip it, you can read about it [here](/docs/graphql/cli/).

## Querying Tina Content in NextJS

In NextJS, content is typically queried statically at build-time, or with SSR.
Tina provides a `staticRequest` helper function, which makes a request to your locally-running GraphQL server at build-time.

### Example: Fetching content through getStaticProps

```tsx
// pages/home.js
import { staticRequest } from 'tinacms'

const getStaticProps = async () => {
  const query = `
      query GetPostDocument($relativePath: String!) {
        getPostDocument(relativePath: $relativePath) {
          data {
            title
          }
        }
      }
    `
  const variables = {
    relativePath: 'hello-world.md',
  }

  let data = {}
  try {
    data = await staticRequest({
      query,
      variables,
    })
  } catch {
    // swallow errors related to document creation
  }

  return {
    props: {
      query,
      variables,
      data,
      //myOtherProp: 'some-other-data',
    },
  }
}
```

### Example: Fetching content through getStaticPaths

You'll likely want to query the Tina data layer for [dynamic routes](https://nextjs.org/docs/basic-features/data-fetching/get-static-paths#getstaticpaths).

```js
export const getStaticPaths = async () => {
  const postsListData = await staticRequest({
    query: gql`
      query GetPostList {
        getPostList {
          edges {
            node {
              sys {
                filename
              }
            }
          }
        }
      }
    `,
  })

  return {
    paths: postsListData.getPostList.edges.map(post => ({
      params: { filename: post.node.sys.filename },
    })),
  }
}
```

> Note: for now, TinaCMS only supports static data fetching, so you must use `getStaticProps` (and `getStaticPaths` for dynamic pages). We'll be opening up more capabilities (like SSR, and client-side data-fetching) in the near future!

### Do I need to use `staticRequest`?

Absolutely not. This is a helper function which emphasizes that static requests should only be made against your _local_ server. The `staticRequest` helper function makes the request against `http://localhost:4001`, which is where `@tinacms/cli` runs its GraphQL server. Feel free to use any HTTP client you'd like.

## Summary

- Tina provides a GraphQL API for querying your git-based content.
- The query used for your requests is based on your defined schema.
- Tina currently only supports static data-fetching (inside getStaticProps / getStaticPaths).
- The `staticRequest` helper function is provided to simplify making requests to the local GraphQL server.
