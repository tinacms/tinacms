## Getting started

There's a serve and watch command, which are separate for now:

```sh
// terminal 1
cd packages/tina-graphql
yarn watch

// terminal 2
cd packages/tina-graphql
yarn serve
```

You can consume this from the `graphiql` app:

```sh
// terminal 3
cd apps/graphiql
yarn start
```

Note that this app doesn't use anything from the `client` package right now, it's just an interactive tool to see how things move from the graphql server into tina. That process has been improved in this package but will need to be merged back into the `client` package before this is usable.

### Running queries

By default the app will redirect to `project1` and display the default query generated from the `graphql-helpers` library - which consumes the fixtures from the `project1` folder the the `gql` package, any number of fixtures can be used if you want to add your own, just ensure the `server.ts` file knows about them.

When you run the initial query, you should see the result along with the Tina sidebar toggle, this indicates that the Tina form has now been populated with the query values. If you change some values around and hit submit, the `onSubmit` function will populate the GraphiQL editor instead of sending it off to the server, you can play around with the mutation before sending it off if you'd like.

### Tests

The most valuable test right now is the `builder.spec.ts`, it's sort of an integration of all the field-level builders. There are also field-level build tests, but not resolvers ones just yet. If you're making changes to the builder just run `yarn test-watch` and hit `p` to provide a pattern, then type "builder", this will isolate that test and if it's passing you probably didn't break anything.

## Architecture

### Builder

The builder service is responsible for building out the entire GraphQL schema for a given `.tina` config. This service can run at any time (but needs to be re-run on each schema change) and it's output is a GraphQL schema which can be stored in the schema definition language (SDL) as a string in a database record or as a `.graphql` file. At the top of the schema is a `document` query, this query returns the document, which can be one of any number of templates defined in the `.tina` config. From there, each field in the given template is used to build out the rest of the schema, so each template field is built by the `type` in it's definition

#### Field-level builders

Field-level builders take a field definition and produce 4 different GraphQL types:

##### `field`

Builds the type which fits into Tina's field definition shape:

Given:

```yaml
name: Title
label: title
type: text
```

```js
text.build.field({ cache, field });
```

Produces

```graphql
type TextField {
  name: String
  label: String
  component: String
  description: String
}
```

##### `initialValue`

Tina fields need an initial value when editing existing data. This builder is responsible for providing the shape of that value.

For most fields this is the same value as `value` - but if you picture the schema as a "graph" - you can see how the "value" of a document reference (ie. a Post has an Author) is not helpful to Tina. Tina only cares about the stored document value of the reference (in this case `/path/to/author.md`) so it's the `initialValue`'s role to provide what makes sense to Tina, regardless of the schema's relationships.

##### `value`

The value of the field, it's the role of this function to provide the shape of the data we should expect for a fully resolved graph.

For `block` fields, this looks like an array of different shapes, which means it's the `blocks.build.value` function's responsibility to return a `union` array.

##### `input`

When a mutation is made, the shape of this mutation needs to fit the shape create by this function.

### Resolvers

`resolvers` can be thought of as the runtime siblings to `builders`. While it's the job of builders to define the "graph", the resolvers are responsible for taking raw values (like those from a `.md` file) and shaping them so they fit the schema.

#### Field-level resolvers

Again, similar to field-level builders, most of the work for resolving the data is passed on to the appropriate field to handle. So if you have a document like so:

```md
---
title: Hello, World!
author: /authors/homer.md
---
```

It's template definition might look like:

```yaml
label: Post
---
fields:
  - name: title
    label: Title
    type: text
  - name: author
    label: Author
    type: select
    config:
      source:
        type: pages
        section: authors
```

The `text.resolver` object will be responsible for resolving the values related to `title`:

##### `field`

The `field` resolver provides the appropriate values for it's `field` builder counterpart. In the example above the `text.resolve.field` function would return:

```json
{
  "name": "title",
  "label": "Title",
  "component": "text"
}
```

This would then be passed on to Tina for rendering on the client.

##### `initialValue`

In the example above the `text.resolve.initialValue` would return "Hello, World!"

For blocks we need to return the object along with a `_template` key, this is used downstream to disambiguate which template the value comes from.

##### `value`

In the example above the `text.resolve.value` would return "Hello, World!", and again, for document references this would return the entire document being referenced, which may or may not be used depending on the graph fields requested

##### `input`

Input resolvers don't do much (except in the case of blocks described later), since the GraphQL mutataion payload has all the necessary information, we just pass the value into these resolvers as a runtime type-check. In the future, this is where field-level validations can take place.

**Caveats with `blocks`**: `blocks` values are an array of unlike objects, meaning in order to enforce type-safe requests coming into the server, we need to use a somewhat awkward pattern ([read more about the trade-offs here](https://github.com/graphql/graphql-spec/blob/master/rfcs/InputUnion.md#-5-one-of-tagged-union)) which we sort of need to rearrange once it hits the server.

## Architecture Diagram

<iframe style="border:none" width="700" height="350" src="https://whimsical.com/embed/Kh28ULaAYKPRpeCLm3VG63@2Ux7TurymMtzhxz2sLxX"></iframe>

## Caveats

### Why do we use `GraphQLUnion` instead of `GraphQLInterface` for fields?

Since `component`, `label`, & `name` are common across all fields, we'd only use a fragment to gather what's unique to that field type, so field definitions using an interface would allow our queries to look like this:

```graphql
fields {
  component
  label
  name
  ...on SelectField {
    options
  }
}
```

Instead, we use a union - which requires us to load each key inside it's respective fragment:

```graphql
fields {
  ... on TextareaField {
    name
    label
    component
  }
  ... on SelectField {
    name
    label
    component
    options
  }
}
```

A GraphQL interface allows you to define a heterogeneous set of types, which have some fields in common. This is a textbook usecase for interfaces, and it's something that could change in the future. But the current reason we're using unions is because unions are exhaustive, and they allow us to scope down the possible field types for a given set of fields.

An interface would be too broad for our needs, a collection of fields should only contain the types which are possible for that given template config. So while an `interface` would allow us to present **all** possible field types, a `union` gives us the ability to scope down the field list to only allow what the template defines. Using `unions` forces us to be explicit about that in a way that's clear (note: it may be possible to do this with interfaces but there would end up being an interface for each collection of possible fields - making the `interface` term somewhat misleading). Using unions also allows our auto-querybuilder to know that they have populated all possible types of a field, something that seems like it might be more difficult with interfaces.
