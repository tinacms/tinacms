---
title: From GraphQL Gateway to TinaCMS
---

# Package reorganization

As we've trialed the GraphQL API and how it works with TinaCMS, it's become apparent that this is the primary path we want to carve out for users of Tina. We'll be moving the `tina-graphq-gateway` APIs in to the `tinacms` package to reflect its more central role in the Tina workflow. Other backend integrations will still be available to build out via the new `@tinacms/toolkit` package. You can read more details on those changes [here](https://github.com/tinacms/tinacms/issues/1898).

### `tinacms` is absorbing `tina-graphql-gateway`

As a result, upgrading to the new and improved GraphQL experience will require you to move to `tinacms@0.50.0` and remove the `tina-graphql-gateway` package entirely.

```
yarn add tinacms@latest
yarn remove tina-graphql-gateway
```

```diff
- import { useGraphqlForms } from 'tina-graphql-gateway'
+ import { useGraphqlForms } from 'tinacms'
```

> Heads up, `useGraphqlForms` is now considered a lower-level API. You may want to instead use the default import from `tinacms` to configure things. [Learn more](/docs/tinacms-context)

### `tina-graphql-gateway-cli` is now `@tinacms/cli`

```
yarn add @tinacms/cli
yarn remove tina-graphql-gateway-cli
```

```diff
- import { defineSchema } from 'tina-graphql-gateway-cli'
+ import { defineSchema } from '@tinacms/cli'
```

> Note: the `defineSchema` API has changed, too. Read on for how to upgrade

### `tina-gql` cli command is now `tinacms`

```diff
- yarn tina-gql server:start
+ yarn tinacms server:start
```

---

## The new `defineSchema` API

We're going to be leaning on a more _primitive_ concept of how types are defined with Tina, and in doing so will be introducing some breaking changes to the way schemas are defined. Read the detailed [RFC discussion](https://github.com/tinacms/rfcs/pull/18) for more on this topic, specifically the [latter portions](https://github.com/tinacms/rfcs/pull/18#issuecomment-805400313) of the discussion.

### Collections now accept a `fields` _or_ `templates` property

You can now provide `fields` instead of `templates` for your collection, doing so will result in a more straightforward schema definition:

```js
{
  collections: [
    {
      name: 'post',
      label: 'Post',
      path: 'content/posts',
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'string', // learn more about _type_ changes below
        },
      ],
    },
  ]
}
```

**Why?**

Previously, a collection could define multiple templates, the ambiguity introduced with this feature meant that your documents needed a `_template` field on them so we'd know which one they belonged to. It also mean having to disambiguate your queries in graphql:

```graphql
getPostDocument(relativePage: $relativePath) {
  data {
    ...on Article_Doc_Data {
      title
    }
  }
}
```

Going forward, if you use `fields` on a collection, you can omit the `_template` key and simplify your query:

```graphql
getPostDocument(relativePage: $relativePath) {
  data {
    title
  }
}
```

### `type` changes

Types will look a little bit different, and are meant to reflect the lowest form of the shape they can represent. Moving forward, the `ui` field will represent the UI portion of what you might expect. For a blog post "description" field, you'd define it like this:

```js
{
  type: "string",
  label: "Description",
  name: "description",
}
```

By default `string` will use the `text` field, but you can change that by specifying the `component`:

```js
{
  type: "string",
  label: "Description",
  name: "description",
  ui: {
    component: "textarea"
  }
}
```

For the most part, the UI properties are added to the field and adhere to the existing capabilities of Tina's core [field plugins](/docs/reference/toolkit/fields/). But there's nothing stopping you from providing your own components -- just be sure to register those with the CMS object on the frontend:

```js
{
  type: "string",
  label: "Description",
  name: "description",
  ui: {
    component: "myMapField"
    someAdditionalMapConfig: 'some-value'
  }
}
```

[Register](/docs/fields/custom-fields/#registering-the-plugin) your `myMapField` with Tina:

```js
cms.fields.add({
  name: 'myMapField',
  Component: MapPicker,
})
```

#### One important gotcha

Every property in the `defineSchema` API must be serlializable. Meaning functions will not work. For example, there's no way to define a `validate` or `parse` function at this level. However, you can either use the [formifyCallback](/docs/advanced/customizing-forms/#customizing-a-form) API to get access to the Tina form, or provide your own logic by specifying a plugin of your choice:

```js
{
  type: "string",
  label: "Description",
  name: "description",
  ui: {
    component: "myText"
  }
}
```

And then when you register the plugin, provide your custom logic here:

```js
import { TextFieldPlugin } from 'tinacms'
// ...
cms.fields.add({
  ...TextFieldPlugin, // spread existing text plugin
  name: 'myText',
  validate: value => {
    someValidationLogic(value)
  },
})
```

**Why?**

The reality is that under the hood this has made no difference to the backend, so we're removing it as a point of friction. Instead, `type` is the true definition of the field's _shape_, while `ui` can be used for customizing the look and behavior of the field's UI.
.

## Every `type` can be a list

Previously, we had a `list` field, which allowed you to supply a `field` property. Instead, _every_ primitive type can be represented as a list:

```js
{
  type: "string",
  label: "Categories",
  name: "categories",
  list: true
}
```

Additionally, enumerable lists and selects are inferred from the `options` property. The following example is represented by a `select` field:

```js
{
  type: "string",
  label: "Categories",
  name: "categories",
  options: ["fitness", "movies", "music"]
}
```

While this, is a `checkbox` field

```js
{
  type: "string",
  label: "Categories",
  name: "categories"
  list: true,
  options: ["fitness", "movies", "music"]
}
```

### Introducing the `object` type

Tina currently represents the concept of an _object_ in two ways: a `group` (and `group-list`), which is a uniform collection of fields; and `blocks`, which is a polymporphic collection. Moving forward, we'll be introducing a more comporehensive type, which envelopes the behavior of both `group` and `blocks`, and since _every_ field can be a `list`, this also makes `group-list` redundant.

> Note: we've previously assumed that `blocks` usage would _always_ be as an array. We'll be keeping that assumption with the `blocks` type for compatibility, but `object` will allow for non-array polymorphic objects.

#### Defining an `object` type

An `object` type takes either a `fields` _or_ `templates` property (just like the `collections` definition). If you supply `fields`, you'll end up with what is essentially a `group` item. And if you say `list: true`, you'll have what used to be a `group-list` definition.

Likewise, if you supply a `templates` field and `list: true`, you'll get the same API as `blocks`. However you can also say `list: false` (or omit it entirely), and you'll have a polymorphic object which is _not_ an array.

> Gotcha - `type: object` with `templates: []` and `list: false` is not yet suppored for form generation. You can use it your API but won't be able to edit that field.

This is identical to the current `blocks` definition:

```js
{
  type: "object",
  label: "Page Sections",
  name: "pageSections",
  list: true,
  templates: [{
    label: "Hero",
    name: "hero",
    fields: [{
      label: "Title",
      name: "title",
      type: "string"
    }]
  }]
}
```

And here is one for `group`:

```js
{
  type: "object",
  label: "Hero",
  name: "hero",
  fields: [{
    label: "Title",
    name: "title",
    type: "string"
  }]
}
```

### Introducing the `dataJSON` field

You can now request `dataJSON` for the entire data object as a single query key. This is great for more tedius queries like theme files where including each item in the result is cumbersome.

> Note there is no typescript help for this feature for now

```graphql
getThemeDocument(relativePath: $relativePath) {
  dataJSON
}
```

```json
{
  "getThemeDocument": {
    "dataJSON": {
      "every": "field",
      "in": {
        "the": "document"
      },
      "is": "returned"
    }
  }
}
```

Keep in mind, `dataJSON` does _not_ resolve acrosss multiple documents. Instead, it will return the foreign key for a reference:

```json
{
  "getPostDocument": {
    "data": {
      "title": "Hello, World!",
      "author": "path/to/author.md"
    }
  }
}
```

## Lists queries will now adhere to the GraphQL connection spec

[Read the spec](https://relay.dev/graphql/connections.htm)

Previously, lists would return a simple array of items:

```graphql
{
  getPostList {
    id
  }
}
```

Which would result in:

```json
{
  "data": {
    "getPostList": [
      {
        "id": "content/posts/voteForPedro.md"
      }
    ]
  }
}
```

In the new API, you'll need to step through `edges` & `nodes`:

```graphql
{
  getPostList {
    edges {
      node {
        id
      }
    }
  }
}
```

```json
{
  "data": {
    "getPostList": {
      "edges": [
        {
          "node": {
            "id": "content/posts/voteForPedro.md"
          }
        }
      ]
    }
  }
}
```

**Why?**

The GraphQL connection spec opens up a more future-proof structure, allowing us to put more information in to the _connection_ itself like how many results have been returned, and how to request the next page of data.

Read [a detailed explanation](https://graphql.org/learn/pagination/) of how the connection spec provides a richer set of capabilities.

> Note: sorting and filtering is still not supported for list queries.

### `_body` is no longer included by default

There is instead an `isBody` boolean which can be added to any `string` field

**Why?**

Since markdown files sort of have an implicit "body" to them, we were automatically populating a field which represented the body of your markdown file. This wasn't that useful, and kind of annoying. Instead, just attach `isBody` to the field which you want to represent your markdown "body":

```js
{
  collections: [{
    name: "post",
    label: "Post",
    path: "content/posts",
    fields: [
      {
        name: "title",
        label: "Title",
        type: "string"
      }
      {
        name: "myBody",
        label: "My Body",
        type: "string",
        component: 'textarea',
        isBody: true
      }
    ]
  }]
}
```

This would result in a form field called `My Body` getting saved to the body of your markdown file (if you're using markdown):

```md
---
title: Hello, World!
---

This is the body of the file, it's edited through the "My Body" field in your form.
```

## Other changes

### References now point to more than one collection.

Instead of a `collection` property, you must now define a `collections` field, which is an array:

```js
{
  type: "reference",
  label: "Author",
  name: "author",
  collections: ["author"]
}
```

```graphql
{
  getPostDocument(relativePath: "hello.md") {
    data {
      title
      author {
        ...on Author_Document {
          name
        }
        ...on Post_Document {
          title
        }
      }
    }
  }
```

### The `template` field on polymorphic objects (formerly _blocks_) is now `_template`

**Old API:**

```md
---
myBlocks:
  - template: hero
    title: Hello
---
```

**New API:**

```md
---
myBlocks:
  - _template: hero
    title: Hello
---
```

### `data` `__typename` values have changed

They now include the proper namespace to prevent naming collisions and no longer require `_Doc_Data` suffix. All generated `__typename` properties are going to be slightly different. We weren't fully namespacing fields so it wasn't possible to guarantee that no collisions would occur. The pain felt here will likely be most seen when querying and filtering through blocks. This ensures the stability of this type in the future

```graphql
{
  getPageDocument(relativePath: "home.md") {
    data {
      title
      myBlocks {
        ...on Page_Hero_Data {  # previously this would have been Hero_Data
          # ...
        }
      }
    }
  }
}
```

### Undefined list fields will return `null`

Previously a listable field which wasn't defined in the document was treated as an empty array. Moving forward the API response will result in `null` rather than `[]`:

```md
---
title: 'Hello, World'
categories: []
---
```

The responsee would be `categories: []`. If you omit the field entirely:

```md
---
title: 'Hello, World'
---
```

The response will be `categories: null`. Previously this would have been `[]`, which was incorrect
