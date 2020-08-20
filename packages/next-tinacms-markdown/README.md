# next-tinacms-markdown

The `next-tinacms-markdown` package provides helpers to make local Markdown files editable. This package is intended to be used with a [TinaCMS Git-based workflow](https://tinacms.org/guides/nextjs/git/getting-started).

## Installation

```bash
yarn add next-tinacms-markdown
```

## API

| Export | Description|
| --- | --- |
| `MarkdownFile` | A interface representing a Markdown file stored on the local filesystem in Git.|
| `useMarkdownForm` | [React Hook](https://reactjs.org/docs/hooks-intro.html) that creates a [TinaCMS Form Plugin](https://tinacms.org/docs/plugins/forms) for editing a `MarkdownFile`.|


### _MarkdownFile_
The `MarkdownFile` interface represents a Markdown file stored on the local filesystem in Git.

```ts
export interface MarkdownFile {
  fileRelativePath: string
  frontmatter: any
  markdownBody: string
}
```

| Name | Description |
| --- | --- |
| `fileRelativePath` | The path to the file relative to the root of the Git repository. |
| `markdownBody`| The content body of from the Markdown file.|
| `frontmatter`| The parsed frontmatter data from the Markdown file.|

### _useMarkdownForm_

The `useMarkdownForm` function is a [React Hook](https://reactjs.org/docs/hooks-intro.html) creates a [TinaCMS Form Plugin](https://tinacms.org/docs/plugins/forms) for editing a `MarkdownFile`.

```ts
import { Form, FormOptions } from "tinacms"

export function useMarkdownForm(
  markdownFile: MarkdownFile,
  options?: FormOptions
):[any, Form]
```

The `useMarkdownForm` hook accepts a [MarkdownFile](#markdownfile) and an optional [FormOptions](/docs/plugins/forms#form-configuration) object. It returns an array with containing the current values aand the Form.


## Usage

This package does not handle rendering the markdown content on the page. You can bring your own renderer or use `react-markdown`:

```bash
yarn add react-markdown
```

**Example: pages/index.js**


```js
import { usePlugin } from 'tinacms'
import { useMarkdownForm } from 'next-tinacms-markdown'
import ReactMarkdown from 'react-markdown'

export default function Index({ markdownFile }) {
  // Create the Form
  const [homePage, homePageForm] = useMarkdownForm(markdownFile)

  // Register it with the CMS
  usePlugin(homePageForm)

  return (
    <>
      <h1>{homePage.title}</h1>
      <ReactMarkdown>{homePage.markdownBody}</ReactMarkdown>
    </>
  )
}

export async function getStaticProps() {
  const infoData = await import(`../content/info.md`)
  const data = matter(infoData.default)

  return {
    props: {
      markdownFile: {
        fileRelativePath: `content/info.md`,
        frontmatter: data.data,
        markdownBody: data.content,
      }
    },
  }
}
```