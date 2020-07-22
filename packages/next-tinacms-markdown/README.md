# _next-tinacms-markdown_

The `next-tinacms-markdown` package provides a set of methods for editing content sourced from Markdown files.

## Installation

```bash
yarn add next-tinacms-markdown
```

## Helpers

- `useMarkdownForm( markdownFile, options? ):[values, form]` - A [React Hook](https://reactjs.org/docs/hooks-intro.html) for registering local forms with [function components](https://reactjs.org/docs/components-and-props.html#function-and-class-components).
- `markdownForm( Component, options? ): Component` - A [React Higher-Order Component](https://reactjs.org/docs/higher-order-components.html) for registering local forms with class or function components.
- `useLocalMarkdownForm`(deprecated)
- `useGlobalMarkdownForm`(deprecated)

**Arguments**

- `markdownFile`: These helper functions expect an object as the first argument that matches the following interface:

```typescript
// A datastructure representing a MarkdownFile file stored in Git
export interface MarkdownFile {
  fileRelativePath: string
  frontmatter: any
  markdownBody: string
}
```

- `options`: The second argument is an _optional configuration object_ that can include [options](/guides/gatsby/git/customize-form) to customize the form.

**Return Values**

- `values`: An object containing the current values from `frontmatter` and `markdownBody`. You can use these values to render content.
- `form`: A reference to the `Form` registered to the CMS. Most of the time you won't need to work directly with the `Form`, so you won't see it used in the example.

### _useMarkdownForm_ hook

The `useMarkdownForm` hook will connect the return data from `getStaticProps` with Tina, then return the `frontmatter` and `markdownBody` values to be rendered.

**pages/info.js**

```jsx
/*
** 1. Import `useMarkdownForm` and `usePlugin`
*/
import { useMarkdownForm } from 'next-tinacms-markdown'
import { usePlugin } from 'tinacms'
import matter from 'gray-matter'
import ReactMarkdown from 'react-markdown'
import Layout from '../components/Layout'

export default function Info(props) {

  /*
  ** Optional — define an options object
  ** to customize the form
  */
  const formOptions = {
    label: 'Info Page',
    fields: [
      { label: 'Name', name: 'frontmatter.name', component: 'text' },
      {
        name: 'markdownBody',
        label: 'Info Page Content',
        component: 'markdown',
      },
    ],
  }
  /*
  ** 2. Call `useMarkdownForm` and pass in the
  **    `data` object returned from `getStaticProps`,
  **    along with any form options.
  */
  const [data, form] = useMarkdownForm(props.markdownFile, formOptions)

  /*
  ** 3. Register the form with the CMS
  */
  usePlugin(form)

  /*
  **  4. Render content from your Markdown source file
  **     with the props returned from getStaticProps
  */
  return (
    <Layout>
      <section>
        <h1>{data.frontmatter.name}</h1>
        <ReactMarkdown>{data.markdownBody}</ReactMarkdown>
      </section>
    </Layout>
  )
}

export async function getStaticProps() {
  const infoData = await import(`../data/info.md`)
  const data = matter(infoData.default)

  return {
    props: {
    markdownFile: {
      fileRelativePath: `data/info.md`,
      frontmatter: data.data,
      markdownBody: data.content,
    },
  }
}
```

> You can use [`gray-matter`](https://github.com/jonschlinkert/gray-matter) to parse the YAML frontmatter when importing a raw Markdown file.

### _markdownForm_ HOC

`markdownForm` accepts two arguments: _a component and an [form configuration object](/guides/gatsby/git/customize-form)_. The component being passed is expected to receive data as props that matches the `markdownFile` interface outlined below.

```typescript
// A datastructure representing a MarkdownFile file stored in Git
export interface MarkdownFile {
  fileRelativePath: string
  frontmatter: any
  markdownBody: string
}
```

`markdownForm` returns the original component with a Git form registered with Tina. Below is the same example from `useMarkdownForm`, but refactored to use the HOC.

**pages/info.js**

```js
/*
** 1. import `markdownForm`
*/
import { markdownForm } from 'next-tinacms-markdown'
import ReactMarkdown from 'react-markdown'
import matter from 'gray-matter'
import Layout from '../components/Layout'

function Info(props) {
  const data = props.markdownFile
  return (
    <Layout>
      <section>
        <h1>{data.frontmatter.name}</h1>
        <ReactMarkdown>{data.markdownBody}</ReactMarkdown>
      </section>
    </Layout>
  )
}

/*
** Optional — define an options object
** to customize the form
*/
const formOptions = {
  //...
}

/*
 ** 2. Wrap your component with `markdownForm`,
 **    pass in optional form field config object
 */
export default markdownForm(Info, formOptions)

export async function getStaticProps() {
  const infoData = await import(`../data/info.md`)
  const data = matter(infoData.default)

  return {
    props: {
    /*
    ** 3. Structure your return object with this shape.
    **    Make sure to use the `markdownFile`
    **    property name
    */
    markdownFile: {
      fileRelativePath: `data/info.md`,
      frontmatter: data.data,
      markdownBody: data.content,
    },
  }
}
```