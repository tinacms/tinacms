## Content Modeling

## Data

## Building the schema

The schema-building process needs to run any time the `.tina/schema.ts` file changes. Its job is to dump out 3 files: `_schema.json`, `_graphql.json`, and `_lookup.json`.

### `_schema.json`

This the serialized and enriched version of `.tina/schema.ts`. For the most part, it's identical to the return object of `defineSchema`, but as part of the build process, we enrich each object in the tree with a `namespace`, so given this:

```ts
export default defineSchema({
  collections: [
    {
      label: 'Blog Posts',
      name: 'posts',
      path: 'content/posts',
      fields: [
        {
          type: 'string',
          label: 'Title',
          name: 'title',
        },
      ],
    },
  ],
})
```

We'd store the `_schema.json` as:

```json
{
  "collections": [
    {
      "label": "Blog Posts",
      "name": "posts",
      "path": "content/posts",
      "fields": [
        {
          "type": "string",
          "label": "Title",
          "name": "title",
          "namespace": ["posts", "title"]
        }
      ],
      "namespace": ["posts"]
    }
  ]
}
```

The `namespace` property is actually the source of truth for naming types throughout the schema. This is because we can use it to guarantee we don't get name collisions.

### `_graphql.json`

The end result of the building process is a GraphQL schema, represented here as an AST (we also dump out a printed version at `.tina/__generated__/schema.gql` for convenience). In order to resolve data, the `graphql` function must have a schema, so this is supplied at resolution-time as part of the payload.

### `_lookup.json`

The lookup file can be seen as the connection between the Tina schema and the GraphQL schema. It tells us _how_ the fields should be resolved. A property in the lookup object indicates the _return type_ of the given field we're resolving, if we come across that field, we'll use the appropriate lookup value to help us resolve our data. The following section will dive deeper into how this works.

### Diagram

<iframe style="border:none" width="800" height="450" src="https://whimsical.com/embed/EYFZ8o3GcZBfZiD15fSiA9@2Ux7TurymMjs6bLwtSqq"></iframe>>



## Resolving data

It's important to understand that GraphQL resolves it's data field-by-field:

```graphql
{
  getPostDocument(relativePath: $relativePath) {
    id
    data {
      title
      author {
        data {
          name
        }
      }
    }
  }
}
```

When this request comes in we'll resolve `getPostDocument`, then `id`, then `data`, then `title`, and so on. Each parent response is populated as the `source` property of the next function call.

When looking at this request, a human would quickly understand that `getPostDocument` should get the document from the `post` collection, joining the `relativePath` with the `path` defined in our `post` collection to build the full path to the document (eg. `content/posts/voteForPedro.md`). But there's no direct way of telling our GraphQL schema that `getPostDocument` maps to the `post` collection. To make that connection, we ask the lookup document for more information. You'll notice a switch statement, that switches on the `resolveType` of the lookup value, there are a few different resolve types which you'll see in the examples below.

````ts
return graphql({
  schema: buildASTSchema(_graphqlJSON), // from the `.tina/__generated__/_graphl.json` file
  source: `{ getPostDocument(relativePath: $relativePath) { ... }}`, // the actual query
  variableValues: variables, // { relativePath: "voteForPedro.md"}
  // `fieldResolver` runs on each field, so `source` is the value returned from the previous call
  fieldResolver: async (
    source, // empty for the first call
    args, // {relativePath: "voteForPedro.md"}
    _context,
    info // { fieldName: 'getPostDocument', returnType: 'PostDocument', ...etc }
  ) => {
    /**
     * The return type for `getPostDocument` is `PostDocument`, so we get the following `lookup`
     * from the `.tina/__generated__/_lookup.json`
     * ```json
     * "PostDocument": {
     *   "resolveType": "collectionDocument",
     *   "collection": "posts"
     * },
     * ```
     */
    const lookup = await getLookup(info.returnType)
    switch (lookup.resolveType) {
      case 'collectionDocument':
        return resolver.resolveDocument({
          value, // null
          args,
          collection: lookup.collection,
        })
    }
  },
})
````

The value returned here is the object representation of our `post` (eg. `{id: "content/posts/voteForPedro.md", data: {...}}`). Remember that GraphQL calls the field resolver on _each_ field, with `source` being the value of the previous call. Now that we've returned the document, let's step down to the next layer to see how the `id` in this request gets resolved:

```ts
async function fieldResolver(
  source, // This is now {id: "content/posts/voteForPedro.md", data: {...}}
  args,
  _context,
  info // { fieldName: 'id', returnType: 'String', ...etc }
) => {
  const lookup = await getLookup(info.returnType)
  // We don't have any lookup information for String return type
  if (!lookup) {
    return source[info.fieldName] // This is: {id: "content/posts/voteForPedro.md"}["id"]
  }
  // ...
}
```

The vast majority of fields go through this pattern, the lookup values are only present when there's not enough information to resolve things on their own.

The next example we'll go through gets a little bit more complex. Recall that we're returning the resolved document for `voteForPedro.md` here. It looks like this:

```json
{
  "id": "content/posts/voteForPedro.md",
  "data": {
    "title": "Vote For Pedro",
    "author": "content/authors/napoleon.md"
  }
}
```

Can you spot the problem? When we resolve `author` it'll just be the string of `"content/authors/napoleon.md"`, but our GraphQL request expects that node to have the author _data_ in it. Again, since the `fieldResolver` runs on _every_ field, we can use the lookup to determine what to do. This time the lookup value tells us to expect a `multiCollectionDocument`. Which is to say that the `author` can be a document from any on of the collections in the schema.

```ts
async function fieldResolver(
  source, // This is { "title": "Vote For Pedro", "author": "content/authors/napoleon.md" }
  args,
  _context,
  info // { fieldName: 'author', returnType: 'PostsAuthorDocument', ...etc }
) => {
  /**
   * {
   *   "resolveType": "multiCollectionDocument"
   * }
   */
  const lookup = await getLookup(info.returnType)
  switch (lookup.resolveType) {
    // ...
    case 'multiCollectionDocument':
     return resolver.getDocument(source[info.fieldName])
  }
}
```

By using the lookup, we were able to determine that `"content/authors/napoleon.md"` should be used as the ID for the `getDocument` request.

There are a few other `resolveType`s we handle, but this is the gist of how the lookup value drives the critical logic in our field resolving process.

### Resolving `form`

When we resolve a document, not only do we supply the `data` key, but we also supply a `form` key. This property is a simple `JSON` value which looks nearly identical to a serialized version of a Tina form config. It has a few extra peices to make the frontend responsibilities easier. Here's what it looks like:

```json
{
  "label": "Blog Posts",
  "name": "voteForPedro.md",
  "fields": [...],
  "mutationInfo": {
    "path": [
      "data",
      "getPostsDocument",
      "form"
    ],
    "string": "\nmutation UpdateDocument($params: PostsMutation!) {\n  updatePostsDocument(relativePath: \"voteForPedro.md\", params: $params) {\n    id\n    form\n  }\n}",
  }
}
```
When we setup forms on the frontend, we'll use the `mutationInfo` information in the `onSubmit` logic. `path` tells us where in the data graph this document should be updated, and `string` is the mutation payload we should send back to the server, notice the `$params` variable, we'll need to supply that from the values in the form from Tina, but otherwise all the other data is already populated. The `string` is just the _mutation_ version of the _query_ we made, so for `getPostDocument`, our mutation will be `updatePostDocument`, with the `relativePath` hard-coded, as this cannot be changed by our frontend logic.

#### Resolving fields

When a request for a document comes through we grab the template that it belongs to (for collections with no templates, the `collection` _is_ the template), and send it's fields down as part of the `form` object. For the most part this is a pretty straightforward process, but there are a couple of extra steps.

- Add the `component` property
- Merge in the `ui` values
- Populate `options` for `reference` fields
- Add `typeMap` information to polymorphic object fields

The last item is sort of a mouthful, but it's role is _relatively_ simple. When you query graphql and run into a `union`, we often ask for the `__typename` to disambiguate:

```grapqhl
{
  getPageDocument(relativePath: $relativePath) {
    data {
      blocks {
        __typename
        ...on HeroBlock {
          title
        }
        ...on CtaBlock {
          header
        }
      }
    }
  }
}
```
And then in our code, a switch statement to split out the logic:
```tsx
const MyBlockRenderer = (block) => {
  switch(block.__typename) {
    case "HeroBlock":
      return <Hero {...block} />
    case "CtaBlock":
      return <Cta {...block} />
    default:
      throw new Error("Unrecognized block")
  }
}
```

But when a _new_ item is added, Tina only knows about the `_template` name, it knows nothing about `__typename`, so new items don't have that field. In this example, the `__typename` would be null, resulting in an error. For this reason, when we add a new block, we lookup it's `typeMap`, which looks something like this:

```json
{
  "_hero": "HeroBlock",
  "_cta": "CtaBlock"
}
```

### Diagram

<iframe style="border:none" width="800" height="450" src="https://whimsical.com/embed/EYFZ8o3GcZBfZiD15fSiA9@2Ux7TurymMTm1HabJBun"></iframe>
