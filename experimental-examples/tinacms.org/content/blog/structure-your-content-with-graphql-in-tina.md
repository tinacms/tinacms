---
title: Structure your content with GraphQL in Tina
date: '2021-06-25T18:34:12+02:00'
author: Frank Taillandier
last_edited: '2021-06-25T20:42:18.533Z'
---

Tina adopts a developer-centric approach to structure content, which means you can model your content locally in your favourite editor. Thanks to a [GraphQL layer on top of the files](/blog/using-graphql-with-the-filesystem/) stored in your repository, Tina makes it more straightforward to query content all across your files. Let's see how this feels.

When we refer to Git-based, it means your content is stored in Markdown and JSON files and modelled with front matter; on top of that [Tina Cloud](/cloud) aims to let you leverage the power of [GraphQL](https://graphql.org/).

We open-sourced the [tina-graphql-gateway package](https://github.com/tinacms/tina-graphql-gateway) so that you can see how it works under the hood. It contains different tools for developers to work with Tina and GraphQL:

- a GraphQL schema compiler,
- a GraphQL Server,
- a GraphQL Client (Altair),
- a command-line interface to compile the schema and launch a local server,
- Next.js helpers for Tina,
- and more…

The typical developer workflow when working on your structured content is to run Tina local GraphQL server, edit your schema, create and test queries to use those in your Next.js pages.

## The GraphQL schema is the single source of truth

The GraphQL [schema](/docs/tina-cloud/cli/#defineschema) allows you to describe your content types or **collections** as we call them. At the root of the schema, you can list all your collections.

A collection points to a folder in your repository where you store a content type, like a blog post, a recipe, a book, a product, etc.

Each collection needs:

- a `label` that will be displayed in the generated TinaCMS form,
- a `name` that will be used in the GraphQL API.
- An optional `description` to display a help text above the form field in TinaCMS
- An optional `format` (`json` for JSON files, `md` for Markdown files).

Let’s take a very basic example, where we declare a Blog Posts collection that points to `content/posts` and we simply name our collection `posts`.

To describe the shape of this content type, we need to provide a **template**. For our basic blog post, we’ll start by saying an _article_ has the following front matter fields:

- `title` (text),
- `author` (a reference to the author collection).

We also need to define a collection for the authors, as well as a basic template for an author which has:

- a `name` (text),
- an `avatar` (URL so text).

> 💡 To get type autocompletion when you edit the schema install the [VSCode GraphQL extension](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql).

The corresponding schema stored in `.tina/schema.ts` lools like this:

```js
import { defineSchema } from 'tina-graphql-gateway-cli'

export default defineSchema({
  collections: [
    {
      label: 'Blog Posts',
      name: 'post',
      path: 'content/posts',
      templates: [
        {
          label: 'Article',
          name: 'article',
          fields: [
            {
              type: 'text',
              label: 'Title',
              name: 'title',
            },
            {
              type: 'reference',
              label: 'Author',
              name: 'author',
              collection: 'author',
            },
          ],
        },
      ],
    },
    {
      label: 'Authors',
      name: 'author',
      path: 'content/authors',
      templates: [
        {
          label: 'Author',
          name: 'author',
          fields: [
            {
              type: 'text',
              label: 'Name',
              name: 'name',
            },
            {
              type: 'text',
              label: 'Avatar',
              name: 'avatar',
            },
          ],
        },
      ],
    },
  ],
})
```

> ### What type can I use?
>
> You can use any [field type available in TinaCMS](/docs/fields/#default-field-plugins): text, textarea, datetime, list, group, select, blocks, etc. ([source](https://github.com/tinacms/tina-graphql-gateway/blob/5128b85fb2b3b69999c18eb5708eaf7e1fff4786/packages/tina-graphql-gateway-cli/src/cmds/compile/index.ts#L687))
>
> `Image` type is under development with [Cloudinary](https://cloudinary.com/) support as a media provider with Tina Cloud.

<Youtube embedSrc={"https://www.youtube.com/embed/EwewKEHHkd4"} />

## Query your content with GraphQL

The Tina CLI provides a command to run a local GraphQL server to watch for changes in our schema and compiles it when edited; it runs alongside Next.js in development mode. We make it our default `dev` npm script in the `package.json`, so that when we run `yarn dev`, we have access to a GraphQL playground:

    yarn dev
    yarn tina-gql server:start -c "next dev"

    Started Filesystem GraphQL server on port: 4001
    Visit the playground at http://localhost:4001/altair/
    …

When opening `http://localhost:4001/altair`, the [Altair GraphQL client](https://altair.sirmuel.design/) lets you build queries and browse the API documentation.

![A Blog query returning our data in Altair GraphQL Client](/img/blog/altair-client-tina.png)

We can query a blog post by passing its relative path to the collection defined in `content/posts` and get data from our fields like so:

```graphql
query BlogPost {
  getPostDocument(relativePath: "myBlogPost.md") {
    data {
      __typename
      ... on Article_Doc_Data {
        title
        author {
          data {
            ... on Author_Doc_Data {
              name
              avatar
            }
          }
        }
        _body
      }
    }
  }
}
```

Now that we know how to query data from our files, we still need to use that query in our Next.js application, request it from the client and ask Tina to generate the corresponding form so that our contributors are able to edit it visually. We'll detail the remaining steps in a follow-up post, stay tuned!

[_Join our Discord_](https://discord.com/invite/zumN63Ybpf)_, if you have any question regarding how to work with Tina and Next.js._
