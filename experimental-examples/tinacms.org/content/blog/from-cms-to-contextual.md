---
title: From CMS To Contextual Editing 
date: '2022-03-16:00:00-04:00'
author: James Perkins
---

Tina allows you as a developer to create an amazing editing experience. By default the editing experience is a more traditional CMS, where you login to a specific URL and you edit your content without being able to see the content till after you finish your changes. But, if you are looking for a more transparent real-time editing experience, Tina has a superpower, called Contextual Editing. Just as it sounds, you get instant feedback on the page as well as being able to preview the changes before publishing live to your site. 

![Example of Tina Context editing](https://res.cloudinary.com/forestry-demo/video/upload/q_100/v1647436971/blog-media/cms-to-contextual/TinaSuper.gif)

## Getting our project started

For this blog post we are going to use Tina’s example which is located in the Next.js official examples and allows us to use `create-next-app`.This example is based upon Next.js blog starter which is a markdown blog.

> You can find the source code in the Next.js examples directory, [https://github.com/vercel/next.js/tree/canary/examples/cms-tina](https://github.com/vercel/next.js/tree/canary/examples/cms-tina).

```bash
## Create our new Tina site

npx create-next-app --example cms-tina tina-contextual-editing

## Move into our app.

cd tina-contextual-editing

## Open with your favorite editor
```


> If you want to learn how this example was created check out the blog post that covers [getting started with Tina](https://tina.io/blog/tina-cms-get-started/).

## What does the Tina code do?

Before you add any code to this example, I want to cover how Tina is integrated and how it works. 

### `.tina` folder

You will find a `.tina` folder in the root of the project, this is the heart and brain of Tina in any project. 

### `schema.ts`

The schema file contains two important pieces of code `defineSchema` and `defineConfig`. The `defineSchema` allows you to define the shape of your content. If you have used a more traditional CMS before you may have done this via a GUI. However, given how Tina is tightly coupled with Git and we treat the filesystem as the “source of truth”, we take the approach of “content-modeling as code”.

If you look at the current defined schema, you will see that each one of the fields is related to the front matter contained within any of the posts in the `_posts` folder. 

Moving on to the `defineConfig`, the `defineConfig` tells your project where the content is requested from, what branch to use, and any configuration to TinaCMS itself.

### `components`

The `components` folder inside the `.tina` holds both our `TinaProvider` and `DynamicTinaProvider`; these two components wrap your application with the power of Tina. We will be heading back here later for some updates. 

### `_generated__`

This folder holds all the auto generated files from Tina, if you open this up you will see files that contain queries, fragments and types. You won’t need to make changes here but it’s good to know what you might find in there. 

Before we add contextual editing, go ahead and launch the application using `yarn tina-dev` and navigate to [`http://localhost:3000/`](http://localhost:3000/). You will notice that it is a static blog. Feel free to navigate around and get a feel for the blog. 

Now if you navigate to [http://localhost:3000/admin](http://localhost:3000/admin) you will be presented with a screen to login, if you login you will land on the CMS dashboard. Selecting a collection on the left will bring you to a screen with all the current files in that space. Then selecting a file will allow you to edit it as you see fit.

![Tina CMS Example](https://res.cloudinary.com/forestry-demo/video/upload/c_scale,w_1174/v1646412458/blog-media/getting-started-tina-admin/example.gif)

## Adding Contextual Editing.

Now you have an understanding of both how the CMS works, and how the code behind is laid out we can start working on adding contextual editing to our project. What do we need to do to make contextual editing work? 

1. Update `getStaticPaths` and `getStaticProps` to use Tina’s graphql layer

2. Update the page to use `useTina` and power the project props

3. Update the TinaCMS configuration

### Creating the getStaticPaths query

The `getStaticPaths` query is going to need to know where all of our markdown files are located. With our current schema you have the option to use `getPostsList`, which will provide a list of all posts in our `_posts` folder. Make sure your local server is running and navigate to http://localhost:4001/altair and select the Docs button. The Docs button gives you the ability to see all the queries possible and the variables returned:

So based upon the `getPostsList` we will want to query the `sys` which is the filesystem and retrieve the `filename`, which will return all the filenames without the extension.

```bash
query {
  getPostsList {
    edges {
      node {
        sys {
          basename
        }
      }
    }
  }
}
```

If you run this query in the GraphQL client you will see the following returned:

```bash
{
  "data": {
    "getPostsList": {
      "edges": [
        {
          "node": {
            "sys": {
              "filename": "dynamic-routing"
            }
          }
        },
        {
          "node": {
            "sys": {
              "filename": "hello-world"
            }
          }
        },
        {
          "node": {
            "sys": {
              "filename": "preview"
            }
          }
        }
      ]
    }
  }
}
```

Adding this query to our Blog.

The NextJS starter blog is served on the dynamic route `/pages/posts/[slug].js`. When you open the file you will see a function called `getStaticPaths` at the bottom of the file.

```bash
export async function getStaticPaths() {

....
```

Remove all the code inside of this function and we can update it to use our own code. The first step is to add an import to the top of the file to be able interact with our graphql, and remove the `getPostBySlug` and `getAllPosts` imports we won’t be using:

```diff
//other imports
.....
- import { getPostBySlug, getAllPosts } from '../../lib/api'
+ import { staticRequest } from "tinacms";
```

Inside of the `getStaticPaths` function we can construct our request to our content-api. When making a request we expect a `query` or `mutation` and then `variables` if needed to be passed to the query, here is an example:

`staticRequest({
  query: '...', // our query
}),`

“*What does* `staticRequest` do?”

It’s just a helper function which supplies a query to your locally-running GraphQL server, which is started on port `4001`. You can just as easily use `fetch` or an http client of your choice.

We can use the `getPostsList` query from earlier to build our dynamic routes:

```bash
export async function getStaticPaths() {
  const postsListData = await staticRequest({
    query: `
      query {
        getPostsList {
          edges {
            node {
            sys {
              filename
              }
            }
          }
      }
    }
    `,
  })
  return {
    paths: postsListData.getPostsList.edges.map(edge => ({
      params: { slug: edge.node.sys.filename },
    })),
    fallback: false,
  }
}
```

**Quick break down of `getStaticPaths`**

The `getStaticPaths` code takes the graphql query we created, because it does not require any `variables` we can send down an empty object. In the return functionality we map through each item in the `postsListData.getPostsList` and create a slug for each one.

## Creating getStaticProps query

### Creating the query

The `getStaticProps` query is going to deliver all the content to the blog, which is how it works currently with the code provided by Next.js. When we use the GraphQL API we will both deliver the content and give the content team the ability to edit it right in the browser.

We need to query the following things from our content api:

- Title
- Excerpt
- Date
- Cover Image
- OG Image data
- Author Data
- Body content

**Creating our Query**

Using our local graphql client we can query the `getPostDocument` using the path to the blog post in question, below is the skeleton of what we need to fill out.

```bash
query BlogPostQuery($relativePath: String!) {
  getPostsDocument(relativePath: $relativePath) {
    # data from our posts.
  }
}
```

We can now fill in the relevant fields we need to query, take special note of both `author` and `ogImage` which are grouped so they get queried as:

```bash
author {
  name
  picture
}
ogImage {
  url
}
```

Once you have filled in all the fields you should have a query that looks like the following:

```bash
query BlogPostQuery($relativePath: String!) {
  getPostsDocument(relativePath: $relativePath) {
    data {
      title
      excerpt
      date
      coverImage
      author {
        name
        picture
      }
      ogImage {
        url
      }
      body
    }
  }
}
```

If you would like to test this out, you can add the following to the variables section at the bottom `{"relativePath": "hello-world.md"}`

**Adding our query to our blog**

Remove all the code inside of the `getStaticProps` function and we can update it to use our own code. Since these pages are dynamic, we’ll want to use the values we returned from `getStaticPaths` in our query. We’ll destructure `params` to obtain the `slug`, using it as a `relativePath`. As you’ll recall the “Blog Posts” collection stores files in a folder called `_posts`, so we want to make a request for the relative path of our content. Meaning for the file located at `_posts/hello-world.md`, we only need to supply the relative portion of `hello-world.md`.

```bash
export const getStaticProps = async ({ params }) => {
  const { slug } = params
  // Ex. `slug` is `hello-world`
  const variables = { relativePath: `${slug}.md` }
  // ...
}
```

We’ll also want to call `staticRequest` to load our data for our specific page. You’ll also notice that we will return the query & variables from getStaticProps. We’ll be using these values within the TinaCMS frontend.

`import { staticRequest } from 'tinacms'`

So the full query should look like this:

```bash
export const getStaticProps = async ({ params }) => {
  const { slug } = params
  const variables = { relativePath: `${slug}.md` }
  const data = await staticRequest({
    query: query,
    variables: variables,
  })

  return {
    props: {
      data,
      variables,
    },
  }
}
```

You may have noticed that our query isn’t there but we are referencing it. This is because we want to be able to reuse the query for our `useTina` hook. At the top of our file, after the imports you can add the query:

```jsx
const query = `query BlogPostQuery($relativePath: String!) {
  getPostsDocument(relativePath: $relativePath) {
    data {
      title
      excerpt
      date
      coverImage
      author {
        name
        picture
      }
      ogImage {
        url
      }
      body
    }
  }
}`
```

### Adding `useTina` hook

The `useTina` hook is used to make a piece of Tina content editable. It is code-split so in production, this hook will pass through the data value. When you are in edit mode, it registers an editable form in the sidebar. 

### Adding imports

The first thing that needs to be done is import useTina, useEffect and useState. We can also remove a few imports that we will no longer be using. 

```bash
import {useState, useEffect} from 'react'
import {useTina} from 'tinacms/dist/edit-state'
```

### Changing our props and adding UseTina

We are going to update our props from `({ post, morePosts, preview })` to `(props)`. We are going to pass the props into our `useTina` hook. Now that has been updated with the props coming in we can use `useTina` . 

```diff

- export default function Post({ post, morePosts, preview }) {
+ export default function Post( props ) {
 

+  const { data } = useTina({
+    query,
+    variables: props.variables,
+    data: props.data,
+  })
```

As you can see, we are reusing our query from before and passing the variables, and data to `useTina`.  This now means we can power our site using contextual editing. Congratulations your site now has superpowers! 


### Update our elements to use Tina data

Now we have access to our Tina powered data we can go through and update all of our elements to use Tina. You can replace each of the `post.` with `data.getPostsDocument.data.` and then replace the `!post?.slug` with `!props.variables.relativePath` when you are finished your return code should look like:

```diff
const router = useRouter()
-  if (!router.isFallback && !post?.slug) {
+  if (!router.isFallback && !props.variables.relativePath) {
    return <ErrorPage statusCode={404} />
  }
  return (
-   <Layout preview={preview}>
+   <Layout preview={false}>
      <Container>
        <Header />
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <article className="mb-32">
              <Head>
                <title>
-                  {post.title} | Next.js Blog Example with {CMS_NAME}
+                  {data.getPostsDocument.data.title} | Next.js Blog Example with {CMS_NAME}
                </title>
-                <meta property="og:image" content={post.ogImage.url} />
+                <meta property="og:image" content={data.getPostsDocument.data.ogImage.url} />
              </Head>
              <PostHeader
-                title={post.title}
-                coverImage={post.coverImage}
-                date={post.date}
-                author={post.author}
+                title={data.getPostsDocument.data.title}
+                coverImage={data.getPostsDocument.data.coverImage}
+                date={data.getPostsDocument.data.date}
+                author={data.getPostsDocument.data.author}
              />
-             <PostBody content={post.content} />              
+             <PostBody content={data.getPostsDocument.data.body} />
            </article>
          </>
        )}
      </Container>
    </Layout>
    
  )
```

### The final piece of Contextual Editing.

One piece of code that the original was doing was taking the markdown and turning it into HTML, inside of the `getStaticPriops`. We currently aren’t doing that with our body and just returning the string. Due to the nature of contextual editing, we need to make sure that we are always passing the latest content through the `markdownToHtml` function provided by the team at Next.js. This is where `useState` and `useEffect` come in, first create a content variable that is track by a state:

> Note you could use another markdown to html package that would not require this, but in this example we want to reuse as much of the original code as possible to show how you could integrate with minimal code replacement. 

```jsx
const [content, setContent] = useState('')
```

Then in useEffect we are going to parse our body to the markdownToHtml code provided by the Next.js team and set it to content.

```jsx
useEffect(() => {
      const parseMarkdown = async () => {
        setContent(await markdownToHtml(data.getPostsDocument.data.body))
      } 
      parseMarkdown()
     }, [data.getPostsDocument.data.body])
```

Now all we need to do is update our post body content from `data.getPostsDocument.data.body` to `content` . If you go ahead and test your application now, you can now edit on the page! 

## Next steps

Now that you have contextual editing here are a few things you can explore with Tina

- [Media management through Cloudinary](https://tina.io/docs/media-cloudinary/)
- [Route Mapping (connect the CMS to contextual editing](https://tina.io/docs/tinacms-context/#the-routemappingplugin)
- [Data layer](https://tina.io/docs/tina-cloud/data-layer/)
- [Read-only tokens](https://tina.io/docs/graphql/read-only-tokens/)

## How to keep up to date with Tina?

The best way to keep up with Tina is to subscribe to our newsletter, we send out updates every two weeks. Updates include new features, what we have been working on, blog posts you may of missed and so much more! 

You can subscribe by following this link and entering your email: [https://tina.io/community/](https://tina.io/community/)

### Tina Community Discord

Tina has a community [Discord](https://discord.com/invite/zumN63Ybpf) that is full of Jamstack lovers and Tina enthusiasts. When you join you will find a place:

* To get help with issues
* Find the latest Tina news and sneak previews
* Share your project with Tina community, and talk about your experience
* Chat about the Jamstack

### Tina Twitter

Our Twitter account ([@tina_cms](https://twitter.com/tina_cms)) announces the latest features, improvements, and sneak peeks to Tina. We would also be psyched if you tagged us in projects you have built.
