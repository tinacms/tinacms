# Experimental Tina Client

> Note: This usage is experimental and although it is likely to maintained / supported, the API may change over time.

## What is the generated client.

This piece of work has two main functionalities,

1. Generates Graphql fragments and queries that are written for you.
2. Generates a Graphql client that can be used server-side (in getStaticProps)

## Using the built-in Graphql Queries

The client comes with several built-in GraphQL queries to allow you to get up and running quickly. There is one caveat it **does not resolve references**. Although we plan to support an API do to this in the future, the built-in generated client queries do not resolve references. To resolve reference you will have to [write your own queries](#writing-your-own-gql-queries).

Firstly, you can import a function to get the client from generated folder located in `.tina/__generated/types`.
```ts
import { ExperimentalGetTinaClient } from "../path/to/tinaFolder/.tina/__generated__/types";
```

Then you can use it in `getStaticProps`.
```ts
const client = ExperimentalGetTinaClient();
const tinaProps = await client.getPostsDocument({relativePath: "test.md"});

//...

return {
    props: {
        ...tinaProps
    }
}
```




## Writing your own GQL Queries

First of all you can import the generated client

```ts
import { ExperimentalGetTinaClient } from "../path/to/tinaFolder/.tina/__generated__/types";
```

Then you can use the typed client. The types are based on your Graphql queries that you have written. The Graphql queries are written in the `.tina/queries/` folder and these will be used to generate the client.

Example of `.tina/queries/example.gql`  
```gql
query getCollections {
  getCollections {
    name
  }
}
```
would generate a client that would allow you to do this.
```ts
const client = ExperimentalGetTinaClient();
const data = await client.getCollections();
console.log(data.getCollections);
```


We can take this further and add this to our `example.gql` file
```gql
query GetAuthorDocument($path: String!) {
  getAuthorsDocument(relativePath: $path) {
    data {
      ...AuthorsParts
    }
  }
}
```

We are using an `AuthorsParts` Fragment. For each collection this fragment is generated and updated when the schema is updated. This means you no longer have to update your Graphql query when you update your schema.ts (assuming you want to query for all the fields)

 

Demo: https://www.loom.com/share/dc09643ac8dd4c238fe06f144a8f3496