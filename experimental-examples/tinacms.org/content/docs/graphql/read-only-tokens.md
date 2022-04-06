---
title: Read-only Tokens
last_edited: '2022-02-07T18:00:00.000Z'
---
{{ WarningCallout text="This is an experimental feature and may be slow as we work on performance improvements" }}

Read-only tokens allow data fetching at runtime without the need for the local GraphQL server. Some use cases include the following:


- Runtime server-side logic in `getServerSideProps`, `getStaticProps` (when fallback is not `false`), etc.
- [Incremental Static Site Generation](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration)
- [Server components](https://nextjs.org/docs/advanced-features/react-18/overview#react-server-components-alpha)
- [Next.js middleware](https://nextjs.org/docs/middleware)
- Client-side data-fetching (including `create-react-app`)
- Future support for server-side frameworks like [remix](https://remix.run/)

In all of these use cases we can no longer rely static content but need a way to fetch data in real-time without being authenticated.


Read only tokens can only be used for [GraphQL query requests]() and can not be used for mutations. It can also only be used to get data from the branch in the list of branches specified when the token was made. 

## How to use Read Only Tokens

### Generate them from the dashboard

Navigate to [Tina Cloud](https://app.tina.io) and click on the project you wish to add a token to, click on the "tokens" tab
![Tina cloud token tab](/img/graphql-docs/token-tab.png)

Next, click "New Token" and fill out fields. The token name is how you can identify the token and "Git branches" is the list of branches separated by commas that the token has assess too. 

![Creating a new token in Tina Cloud](/img/graphql-docs/create-new-token.png)


Finally, click "Create Token".

![Successful creation of a token in Tina Cloud](/img/graphql-docs/final-token-page.png)


### Make a fetch request using the API key 

Now you can make a POST request to the content API with the desired GraphQL request.

The endpoint is `https://content.tinajs.io/content/<myClientId>/github/<myBranch>` and the token can be passed by including a `X-API-KEY` with the token as the value.

Here is an example curl request that will query the content API for the list of collections:

#### Curl
```bash
curl --location --request POST 'https://content.tinajs.io/content/<ClientId>/github/main' \
--header 'X-API-KEY: 5f47d1d1c89755aba3b54684dd25f580ec6bb0d3' \
--header 'Content-Type: application/json' \
--data-raw '{"query":"{\n        getCollections{\n            name\n        }\n}","variables":{}}'
```
#### Fetch
```js
var myHeaders = new Headers();
myHeaders.append("X-API-KEY", "5f47d1d1c89755aba3b54684dd25f580ec6bb0d3");
myHeaders.append("Content-Type", "application/json");

var graphql = JSON.stringify({
  query: "{\n        getCollections{\n            name\n        }\n}",
  variables: {}
})
var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: graphql,
  redirect: 'follow'
};

fetch("https://content.tinajs.io/content/<ClientId>/github/main", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
```


## Examples of using read-only tokens

### Fetch data client-side
> In most cases Static site generation is preferred and faster but in some cases you may still want to get data at runtime

```jsx
import { useState, useEffect } from "react";
import { useTina } from "tinacms/dist/edit-state";
// This query can be any query
const query = `
query ContentQuery($relativePath: String!) {
  get<CollectionName>Document(relativePath: $relativePath) {
    data {
      body
      title
    }
  }
}
`;

// Variables used in the GraphQL query;
const variables = {
  relativePath: "HelloWorld.md",
};

function BlogPostPage() {
  const [initalData, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(
      "https://content.tinajs.io/content/<ClientId>/github/<Branch>",
      {
        method: "POST",
        body: JSON.stringify({ query, variables }),
        headers: {
          "X-API-KEY": "<ReadOnlyToken>",
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log({ data });
        setData(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
      });
  }, [query, JSON.stringify(variables)]);

  const { data } = useTina({ query, variables, data: initalData });

  if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>No data</p>;

  return <div>{JSON.stringify(data)}</div>;
}
export default BlogPostPage;
```

### Next.js `fallback: "blocking"`

In Next.js one can specify [`fallback: "blocking"`](https://nextjs.org/docs/api-reference/data-fetching/get-static-paths#fallback-blocking), this allows `getStaticProps` to run server-side at request time when a user goes to a page that was not specified in `getStaticPaths`. 

With read-only tokens we can fetch the list of blog posts. This will allow us to visit pages that have been created but not statically generated.  



#### Example page

`pages/posts/[filename].js`

```js
const BlogPage = (props)=>{
  // (Does not change)
  //...
}

export const getStaticProps = async (ctx) => {
  const query = `query getPost($relativePath: String!) {
    getPostDocument(relativePath: $relativePath) {
      data {
        title
        body
      }
    }
  }
  `;
  const variables = {
    relativePath: ctx.params.slug + ".md",
  };
  let data = {};
  let error = false;
  try {
    // use the local client at build time
    data = await staticRequest({
      query,
      variables,
    });
  } catch (error) {
    // swallow errors related to document creation
    error = true;
  }
  if(error){
    // use read only tokens to get live data
     data = await fetch(
      "https://content.tinajs.io/content/<ClientId>/github/<Branch>",
      {
        method: "POST",
        body: JSON.stringify({ query, variables }),
        headers: {
          "X-API-KEY": "<ReadOnlyToken>",
          "Content-Type": "application/json",
        },
      }
    )
    if(!data){
      return {
        notFound: true,
      }
    }
  }

  return {
    props: {
      data,
      query,
      variables,
    },
  };
};
export const getStaticProps = ()=>{

}

export default BlogPage
```