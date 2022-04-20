# Formifying a GraphQL query

To make query data "live", Tina does a few things:

1. "Formify the query" - adds extra metadata to the query at each "node"
2. Record a mapping of the query to where each "node" is (or where one could exist when values change)
3. Generate forms for each node in the query result
4. Listen to `onChange` events and update the appropriate section of the query result.


## Formifying the query

Given this query:

```graphql
query MyQuery($relativePath: String!) {
  getPostDocument(relativePath: $relativePath) {
    data {
      title
    }
  }
}
```

Formifying adds extra metadata before the request is sent to the GraphQL API, the resulting query now looks like this:

```graphql
query MyQuery($relativePath: String!) {
  getPostDocument(relativePath: $relativePath) {
    data {
      title
    }
    form
    values
    _internalSys {
      path
      relativePath
      collection {
        name
      }
    }
  }
}
```

For more complex queries, the formify process will populate every field which is a "node" (ie. a document)

```graphql
query MyQuery($relativePath: String!) {
  getPostDocument(relativePath: $relativePath) {
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
Would have 2 "formified" nodes:

```graphql
query MyQuery($relativePath: String!) {
  getPostDocument(relativePath: $relativePath) {
    data {
      title
      author {
        data {
          title
        }
        form
        values
        _internalSys {
          path
          relativePath
          collection {
            name
          }
        }
      }
    }
    form
    values
    _internalSys {
      path
      relativePath
      collection {
        name
      }
    }
  }
}
```
From the formified query, a mapping is kept in state for each possible node:

## Mapping the query

The core functionality of Tina is essentially a flat list of forms, and since a query is more like a graph, it's necessary
to keep track of where a form is (or might be) on that graph. To do this, the formify process generates a "document blueprint" for each
node it formifies in the query, the above example would have 2 document blueprints, and those won't change throughout the lifecycle of this hook.

It then steps through the resulting data from and reconciles which blueprints actually _have_ data. These are referred to as "formNodes" internally.
In the above example, if the post didn't have an author, we'd only have 1 formNode. But if there was an author we'd have 2. A form node keeps track of where a given
document is being referenced, so when it's value changes the GraphQL data is updated accordingly. A form node can be seen as a "join" between a blueprint
and a form. So a flat list of forms can emit onChange events, and the form nodes can be used to trace their fields back to the "graph" of data that we care about.

> An example of the blueprint graph when author is null

| Blueprint ID                | Document                | Fields   |
|-----------------------------|-------------------------|----------|
| getPostDocument             | content/posts/post1.mdx | [title]  |
| getPostDocument.data.author | null                    | [name]   |

You can see what a mapping looks like in any of the test files in this module, each test has a snaphots/query.unit-test.gql with the blueprint metadata
printed out in the comments section.

## Generating the forms and setting up the subscriptions

When the mapping is complete, we know exactly what forms need to be created, and since the formify process added the necessary metadata, we can find them all
and build them. Once that's done, we listen for `onChange` events. At this stage the setup is complete, and the rest of the time this hook is managing `changeSets`.

## Generating and resolving a changeset

Each time a field's value is changed, we receive an event. If the event is from a field that we've queried, this will result
in a `changeSet`. Changesets are a way of signaling that we have a change at a given path with a new value, but their values
__do not__ represent the actual data in all cases. For the author in the example above, the event's value would be the path to the author
(eg. "content/authors/napolean.md"), but the GraphQL data is actually an object including the author's name. So changesets are
put into a queue and resolved asynchronously. Once a changeset is resolved, the reolved value will then be passed in as the new
value. For reference fields and objects it's important to note that the values are fully resolved before they are set in the
`data` property.

![](https://raw.githubusercontent.com/tinacms/tinacms/use-graphql-froms-refactor-4/packages/tinacms/src/hooks/formify/formify-diagram-2.png)
