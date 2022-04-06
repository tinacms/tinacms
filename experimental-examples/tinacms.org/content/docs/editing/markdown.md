---
title: Markdown
id: '/docs/editing/markdown'
next: '/docs/editing/mdx'
---

Editing a markdown file (with front matter and a body) is the simplest use-case of editing with Tina

## Defining our schema

Let's say your content looks something like:

```md
---
title: 'My first post'
// ...
---

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi ultricies urna ut ex varius, sed fringilla nibh posuere. Vestibulum a pulvinar eros, vel varius orci. Sed convallis purus sed tellus pellentesque ornare quis non velit. Quisque eget nibh nec nisl volutpat aliquet. Donec pharetra turpis vitae diam aliquam rutrum. Sed porta elit ut mi vehicula suscipit. Ut in pulvinar nunc.
```

You would model this collection as:

```ts
// .tina/schema.ts
import { defineSchema } from '@tinacms/cli'

export default defineSchema({
  collections: [
    {
      // ...
      fields: [
        {
          type: 'string'
          label: 'Title',
          name: 'title',
        },
        {
          type: 'string',
          label: 'Body',
          name: 'body',
          isBody: true,
        },
      ],
    },
  ],
})
```

Notice that the first field (`title`) maps to a frontmatter field. We can add any other metadata fields that we want here.

Our `body` field has the `isBody` property set, which will use the [markdown](/docs/reference/toolkit/fields/markdown/) field plugin.

## Registering the field plugins

The majority of our built-in field plugins work out of the box, but some of the larger field plugins (like the "markdown" editor) need to be manually imported and registered.

First, install the markdown editor package with:

```copy
yarn add react-tinacms-editor
```

or

```copy
npm install react-tinacms-editor
```

Inside the config within the `.tina/schema.ts` file we need to import the `MarkdownFieldPlugin` and add it to the CMS callback:

```diff
// .tina/schema.ts

// ...
export config = defineConfig({
  apiURL,
+ cmsCallback: (cms) => {
+   import('react-tinacms-editor').then((field)=> {
+     cms.plugins.add(field.MarkdownFieldPlugin)
+   })
+ }
})
```

Assuming that [contextual editing](/docs/tinacms-context/) is setup on your page, your editors should be able to start editing markdown content!

![markdown-editing](https://res.cloudinary.com/forestry-demo/image/upload/v1645712826/tina-io/docs/markdown.gif)

## Rendering Markdown

The value you get back from the TinaCMS `markdown` field is raw markdown, so you'll want to make sure you have a way to render it to HTML on the page (if you're converting an existing markdown-powered site to use Tina, you probably already have a solution in place for this.)

A popular solution is to use the [react-markdown](https://github.com/remarkjs/react-markdown) library, which provides document-safe rendering for markdown in React.

After installing `react-markdown`, it can be used like this:

```tsx
import * as React from 'react'
import ReactMarkdown from 'react-markdown'

export default MyContentPage: (props) => {
  const markdownContent = props.data.getPostDocument.data.body
  return (
    <main>
      <ReactMarkdown>
        {markdownContent}
      </ReactMarkdown>
    </main>
  )
}

// See /docs/features/data-fetching/ for more info on our getStaticProps/getStaticPaths data-fetching with NextJS
export const getStaticPaths = async () => {
  const tinaProps = await staticRequest({
    query: `{
        getPostList{
          edges {
            node {
              sys {
                filename
              }
            }
          }
        }
      }`,
    variables: {},
  })
  const paths = tinaProps.getPostList.edges.map(x => {
    return { params: { slug: x.node.sys.filename } }
  })

  return {
    paths,
    fallback: 'blocking',
  }
}

export const getStaticProps = async ctx => {
  const query = `query getPost($relativePath: String!) {
    getPostDocument(relativePath: $relativePath) {
      data {
        body
      }
    }
  }
  `
  const variables = {
    relativePath: ctx.params.slug + '.md',
  }
  let data = {}

  data = await staticRequest({
    query,
    variables,
  })

  return {
    props: {
      data,
      query,
      variables,
    },
  }
}
```
