---
title: Read-only tokens - Query Requests anytime
date: '2022-04-05T07:00:00.000Z'
author: James Perkins
prev: content/blog/data-layer-performant-editing.md
---

Read-only tokens allow you to query data from your project at any point in your application, whether that is on the server or on the client. Prior to Read-only tokens everything Tina did was through `getStaticProps` or `getStaticPaths`. This, for the most part, would handle most cases when using a headless CMS with an SSG. However as we move towards the 1.0 release of TinaCMS we want to be able to support more frameworks including React, Remix, and Gatsby.

## Some use cases for Read-only tokens

Below are some use cases for Read-only tokens

*   Server Side Rendering
*   Client Side fetching
*   Runtime server logic

## How to use Read-only tokens?

Before you start with Read-only tokens you will need to make sure the repository you are using has the data layer enabled. This is required for the read-only tokens to work and also be performant.

### Create a token from the dashboard

Navigate to [Tina Cloud](https://app.tina.io) and click on the project you wish to add a token to, click on the "tokens" tab

![Tina cloud token tab](/img/graphql-docs/token-tab.png "")

Next, click "New Token" and fill out the fields required. The token name is how you can identify the token and "Git branches" is the list of branches separated by commas that the token has access to.

![Creating a new token in Tina Cloud](/img/graphql-docs/create-new-token.png "")

Finally, click "Create Token".

![Successful creation of a token in Tina Cloud](/img/graphql-docs/final-token-page.png "")

### Ready for requests

At this point you are now ready to make requests using the Read-only token. I have put together some examples of different use cases, they include SSR, CSR, SSG with fallback which should satisfy most use cases with Tina.

### SSR - Server Side Rendering content

In most cases your content will be statically generated at build time, but on occasion you might need to use SSR in your Tina-powered app. It could be a page that isn’t powered by Tina but you are using our graphQL layer to power your whole application.

```javascript
const query = `
    getPostDocument(example.md) {
      data {
        title
        body
      }
  }
  `;

export async function getServerSideProps(context) {
	let data
	const res = await fetch(
      'https://content.tinajs.io/content/<CLIENT_ID>/github/<BRANCH>',
      {
        method: 'POST',
        body: JSON.stringify({ query, variables }),
        headers: {
          'X-API-KEY': 'API_KEY',
          'Content-Type': 'application/json',
        },
      }
    );
    const jsonData = await res.json();
    data = jsonData.data;
  return {
    props: {
		data,
		query,
		variables,						
}, // will be passed to the page component as props
  }
}
```

Every time a user returns to this page, they will receive a freshly served page with the latest content from Tina.

### CSR - Client Side Rendering

Client side rendering can be a great way to keep content on the page up to date, every-time someone visits a page. Tina content can be retrieved using your favorite http client such as fetch or axios.

```javascript
import { useState, useEffect } from "react";
import { useTina } from "tinacms/dist/edit-state";
// This is a query you want.
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

As you can see for this example we are using useEffect to fetch the data from Tina using our read-only token. The URL you see is powered by your `clientId` and GitHub branch of choice. We then set the data to use `useTina` and present the data through the UI.

### SSG with Fallback

Up until now most Tina users use  `fallback: blocking` for creating new pages with Tina.

This comes with issues:

1.  You no longer have fallback pages by default (404 pages), any navigation will be served even if it’s a blank page.
2.  You need a way to handle when there is data, no data or no page.

With Read-only tokens this has a lot less developer friction and a better user experience, we can break the getStaticsProps code into  three paths.

1.  Data is returned (this is the code you’ve had before)
2.  Data is not returned, so fetch it using read-only tokens. If it’s there, return it.
3.  Data is not returned, data is not returned using read-only tokens, so return a fallback page.

```javascript
import { staticRequest } from 'tinacms';

const query = `query getPost($relativePath: String!) {
    getPostDocument(relativePath: $relativePath) {
      data {
        title
        body
      }
    }
  }
  `;

export const getStaticProps = async (ctx) => {
  const variables = {
    relativePath: ctx.params.slug + ".md",
  };
  let data;
  let error;
  error = false;

  try {
    // use the local client at build time
    data = await staticRequest({
      query,
      variables,
    });
  } catch (error) {
    // swallow errors related to document creation
  }
  // if there isn't data set the error flag
  if (!data) {
    error = true;
  }
  if (error) {
    // use read-only tokens to get live data
    const res = await fetch(
      'https://content.tinajs.io/content/<CLIENT_ID>/github/<BRANCH>',
      {
        method: 'POST',
        body: JSON.stringify({ query, variables }),
        headers: {
          'X-API-KEY': 'API_KEY',
          'Content-Type': 'application/json',
        },
      }
    );
    const jsonData = await res.json();
    data = jsonData.data;
    // if there is no data set the notFound true (This returns 404
    if (!data) {
      return {
        notFound: true,
      };
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
```

The code above does a lot of different things, so let us break it down into the sections stated previously:

1.  The original request which produces data, will return data, query and variables.
2.  If there is no data returned, we set the error flag to true. If the error flag is true, we attempt to use read-only tokens to retrieve your data and return it to be displayed to the user, or to the content editor.
3.  If there is no data returned and the read-only token returns no data, we return `notFound: true` (this is a special flag for Next.js). This flag will return your 404 error page as well as `404` in the status code.

## How to keep up to date with Tina?

The best way to keep up with Tina is to subscribe to our newsletter, we send out updates every two weeks. Updates include new features, what we have been working on, blog posts you may have missed, and so much more!

You can subscribe by following this link and entering your email: [https://tina.io/community/](https://tina.io/community/)

### Tina Community Discord

Tina has a community [Discord](https://discord.com/invite/zumN63Ybpf) that is full of Jamstack lovers and Tina enthusiasts. When you join you will find a place:

*   To get help with issues
*   Find the latest Tina news and sneak previews
*   Share your project with Tina community, and talk about your experience
*   Chat about the Jamstack

### Tina Twitter

Our Twitter account ([@tina\_cms](https://twitter.com/tina\_cms)) announces the latest features, improvements, and sneak peeks to Tina. We would also be psyched if you tagged us in projects you have built.
