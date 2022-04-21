The _Tina Cloud CLI_ can be used to set up your project with Tina Cloud configuration, and run a local version of the Tina Cloud content-api (using your file system's content). For a real-world example of how this is being used checkout the [Tina Cloud Starter](https://github.com/tinacms/tina-cloud-starter).

## Installation

The CLI can be installed as a dev dependency in your project.

Npm:

```bash
npm install --save-dev @tinacms/cli
```

Yarn:

```bash
yarn add --dev @tinacms/cli
```

## Usage

```
Usage: @tinacms/cli command [options]

Options:
  -V, --version             output the version number
  -h, --help                display help for command
  -v, --verbose             increase verbosity of console output   

Commands:
  server:start [options]    Start Filesystem Graphql Server
  schema:compile [options]  Compile schema into static files for the server
  schema:types [options]    Generate a GraphQL query for your site's schema, (and optionally Typescript types)
  init [options]            Add Tina Cloud to an existing project
  audit [options]           Audit your schema and the files to check for errors
  help [command]            display help for command
```

[See our docs](https://tina.io/docs/cli-overview/) for more information about the commands.

## Getting started

The simplest way to get started is to add a `.tina/schema.ts` file

```
mkdir .tina && touch .tina/schema.ts
```

### `defineSchema`

`defineSchema` tells the CMS how to build your content API.

```ts
// .tina/schema.ts
import { defineSchema } from "@tinacms/cli";

export default defineSchema({
  collections: [
    {
      label: "Blog Posts",
      name: "post",
      path: "content/posts",
      templates: [
        {
          label: "Article",
          name: "article",
          fields: [
            {
              type: "text",
              label: "Title",
              name: "title",
            },
            {
              type: "reference",
              label: "Author",
              name: "author",
              collection: "authors",
            },
          ],
        },
      ],
    },
    {
      label: "Authors",
      name: "author",
      path: "content/authors",
      templates: [
        {
          label: "Author",
          name: "basicAuthor",
          fields: [
            {
              type: "text",
              label: "Name",
              name: "name",
            },
            {
              type: "text",
              label: "Avatar",
              name: "avatar",
            },
          ],
        },
      ],
    },
  ],
});
```

Be sure this is your default export from this file, we'll validate the schema and build out the GraphQL API with it.

Given the example above, we'd end up with the following GraphQL queries available in our GraphQL schema:

```graphql
# global queries, these will be present regardless of the shape of your schema:
getDocument
getCollection
getCollections
# global mutations
addPendingDocument
updateDocument

# schema-specific queries.
getPostDocument
getPostList
getAuthorDocument
getAuthorList
# schema-specific mutations
updatePostDocument
updateAuthorDocument
```

You can find your generated schema at `/.tina/__generated__/schema.gql` for inspection.

### `collections`

The top-level key in the schema is an array of _collections_, a `collection` informs the API about _where_ to save content. You can see from the example that a `posts` document would be stored in `content/posts`, and it can be the shape of any `template` from the `templates` key.

### `templates`

Templates are responsible for defining the shape of your content, you'll see in the schema for [the starter](https://github.com/tinacms/tina-cloud-starter) that we use `templates` for `collections` as well as `blocks`. One important thing to note is that since a `collection` can have multiple `templates`, each file in your collection must store a `_template` key in it's frontmatter:

```markdown
---
title: Vote For Pedro
author: content/authors/napolean.md
_template: article
---

When you use Tina's GraphQL forms, we know about all of the relationships in your content, this allows us to keep your content in-sync with your form state. Try changing the author in the sidebar, notice the author data changes to reflect your new author!
```

### `fields`

For the most part, you can think of `fields` as the backend equivalent to [Tina field plugins](https://tina.io/docs/plugins/fields/). You might notice that we're defining a `type` on each field, rather than a `component`. This is because the backend isn't concerned with `component`s, only the shape of your content. By default we use the built-in Tina fields, to customize your `component` read the [field customization](https://tina.io/docs/tina-cloud/client/#field-customization) instructions.

#### `reference` & `reference-list`

In addition to the core Tina fields, we also have `reference` and `reference-list` fields. These are important concepts, when you _reference_ another collection, you're effectively saying: "this document _belongs to_ that document". In the `article` template above, we're saying `posts` with an `article` template belong to `authors`. This is a powerful way to connect your content, and the `tinacms` client knows how to build forms to reflect these relationships.

When you query across multiple documents, you'll see a `select` field for the related content, and by changing those values you'll see your query data updated automatically.

## Run the local GraphQL server

Let's add some content so we can test out the GraphQL server

#### Add an author

```sh
mkdir content && mkdir content/authors && touch content/authors/napolean.md
```

Now let's add some content to the author

```markdown
---
name: Napolean
avatar: https://images.unsplash.com/photo-1606721977440-13e6c3a3505a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=344&q=80
_template: basicAuthor
---
```

#### Add a post

```sh
mkdir content/posts && touch content/posts/voteForPedro.md
```

Now we add some content to the post

```markdown
---
title: Vote For Pedro
author: content/authors/napolean.md
_template: article
---

When you use Tina's GraphQL forms, we know about all of the relationships in your content, this allows us to keep your content in-sync with your form state. Try changing the author in the sidebar, notice the author data changes to reflect your new author!
```

#### Start the server

```
yarn run tinacms server:start
```

#### Query the content

With a GraphQL client, make the following request:

> Tip: Use a GraphQL client like [Altair](https://altair.sirmuel.design/) when developing locally.

```graphql
getPostsDocument(relativePath: "voteForPedro.md") {
  data {
    __typename
    ... on Article_Doc_Data {
      title
      author {
        data {
          ... on BasicAuthor_Doc_Data {
            name
            avatar
          }
        }
      }
      _body
    }
  }
}
```

To learn how to work with this data on a Tina-enabled site, check out the [client documentation](https://tina.io/docs/tina-cloud/client/)

> This API is currently somewhat limited. Specifically there's no support for filtering and sorting "list" queries. We have plans to tackle that in upcoming cycles


## API Docs

See [our doc page](https://tina.io/docs/cli-overview/) for specific API docs
