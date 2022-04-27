---
"@tinacms/toolkit": patch
"tinacms": minor
"@tinacms/graphql": minor
---

# Simplify GraphQL API

## `schema` must be supplied to the `<TinaCMS>` component

Previously the `.tina/schema.ts` was only used by the Tina CLI to generate the GraphQL API. However it's now required as a prop to `<TinaCMS>`. This allows you to provide runtime logic in the `ui` property of field definitions. See the documentation on "Extending Tina" for examples.

## The GraphQL API has been simplified

### `get<collection name>` is now just the collection name

```graphql
# old
{
  getPostDocument(relativePath: $relativePath) { ... }
}

# new
{
  post(relativePath: $relativePath) { ... }
}
```

### `get<collection name>List` is now `<collection name>Connection`

The use of the term `connection` is due to our adherence the the [relay cursor spec](https://relay.dev/graphql/connections.htm). We may offer a simplified list field in a future release

```graphql
# old
{
  getPostList { ... }
}

# new
{
  postConnection { ... }
}
```

### `getCollection` and `getCollections` are now `collection` and `collections`

```graphql
# old
{
  getCollection(collection: "post") {...}
}
{
  getCollections {...}
}

# new
{
  collection(collection: "post") {...}
}
{
  collections {...}
}
```

### No more `data` property

The `data` property was previously where all field definitions could be found. This has been moved on level up:

```graphql
# old
{
  getPostDocument(relativePath: $relativePath) {
    data {
      title
    }
  }
}

# new
{
  post(relativePath: $relativePath) {
    title
  }
}
```

#### The type for documents no longer includes "Document" at the end
```graphql
# old
{
  getPostDocument(relativePath: $relativePath) {
    data {
      author {
        ...on AuthorDocument {
          data {
            name
          }
        }
      }
    }
  }
}

# new
{
  post(relativePath: $relativePath) {
    author {
      ...on Author {
        name
      }
    }
  }
}
```

### Meta fields are now underscored

Aside from `id`, other metadata is now underscored:

```graphql
# old
{
  getPostDocument(relativePath: $relativePath) {
    sys {
      relativePath
    }
    values
  }
}

# new
{
  post(relativePath: $relativePath) {
    _sys {
      relativePath
    }
    _values
  }
}
```

### `dataJSON` is gone

This is identical to `_values`

### `form` is gone

`form` was used internally to generate forms for the given document, however that's now handled by providing your `schema` to `<TinaCMS>`.

### `getDocumentList` is gone

It's no longer possible to query all documents at once, you can query for collection documents via the `collection` query:

```graphql
{
  collection {
    documents {
      edges {
        node {...}
      }
    }
  }
}
```
