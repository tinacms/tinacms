---
title: Rich text with MDX
id: '/docs/editing/mdx'
next: '/docs/editing/blocks'
---

## The `rich-text` type

Provides structured content which can _embed_ custom templates that you define, much like the `object` type.

```ts
// .tina/schema.ts
import { defineSchema } from '@tinacms/cli'

export default defineSchema({
  collections: [
    {
      label: 'Blog Posts',
      name: 'post',
      // This assumes that you have a /content/post directory
      path: 'content/post',
      fields: [
        // ...
        {
          type: 'rich-text',
          label: 'Body',
          name: 'body',
          isBody: true,
          templates: [
            {
              name: 'Cta',
              label: 'Call to Action',
              fields: [
                {
                  type: 'string',
                  name: 'heading',
                  label: 'Heading',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
})
```

### An example

Given a markdown file like this:

```md
## Hello, world!

This is some text

<Cta heading="Welcome" />
```

Results in the following response from the content API:

<iframe loading="lazy" src="/api/graphiql/?query=%7B%0A%20%20getPostDocument(relativePath%3A%20%22voteForPedro.json%22)%20%7B%0A%20%20%20%20data%20%7B%0A%20%20%20%20%20%20body%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D" width="800" height="400" />

> Notice the `body` response, it's a structured object instead of a string!

## `<TinaMarkdown>`

Since the value for `rich-text` is a structured `object` instead of a `string`, rendering it out to your page requires more work. We've provided a special `TinaMarkdown` component which is super lightweight and can used directly in your code.

### Usage

```ts
// [slug].js
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { staticRequest } from 'tinacms'

// The `props` here are based off our custom "Cta" MDX component
const Cta = props => {
  return <h2>{props.heading}</h2>
}

// Be sure to provide the appropriate components for each template you define
const components = {
  Cta: Cta,
}

export default function MyPage(props) {
  return (
    <div>
      <TinaMarkdown
        components={components}
        content={props.data.getPostDocument.data.body}
      />
    </div>
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
    relativePath: ctx.params.slug + '.mdx',
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

You will notice the `TinaMarkdown` component takes two props:

```ts
type TinaMarkdown = ({
  // The rich-text data returned from the content API
  content: TinaMarkdownContent
  /**
   * Any templates provided in the rich-text field.
   * Optionally, most elements (ex. <a>) can also
   * be overridden
   */
  components?: Components<{}>
}) => JSX.Element
```

## Differences from other MDX implementations

If you've worked with MDX before, you know that there's usually a _compilation_ step which turns your `.mdx` file into JavaScript code.
This works really well for developers who can access their files directly, but it creates problems when editing content from a rich-text interface.
With Tina, we're leveraging a subset of MDX to enable what's most important to content editors, and in doing so it's necessary to narrow the scope
of what's supported:

### All JSX must be registered as a `template`

In the above example, if you failed to add the `Cta` _template_ in your schema definition, you would receive an error:

```
Found unregistered JSX or HTML: <Cta>. Please ensure all structured elements have been registered with your schema.
```

### All content must be _serializable_

When we say serializable, we mean that they must not be JavaScript expressions that would need to be executed at any point.

- No support for `import`/`export`
- No support for JavaScript expressions (eg. `const a = 2`, `console.log("Hello")`)

For example:

```md
## Today is {new Date().toLocaleString()}
```

This expression will be ignored, instead register a "Date" `template`:

```md
## Today is <Date />
```

Then you can create a `Date` component which returns `new Date().toLocaleString()` under the hood.

### You _must_ supply the appropriate `components` yourself

Traditionally, MDX will compile whatever components you `import` so they're in scope when it's time to render your content.
But with Tina, MDX is completely decoupled from your JavaScript so it's up to you to ensure that for every `template` in your `rich-text` definition, there's an equivalent `component` in your `<TinaMarkdown>` component.
