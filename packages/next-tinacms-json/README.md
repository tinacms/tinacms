# next-tinacms-json

The `next-tinacms-json` package provides helpers to make local JSON content editable. This package is intended to be used with a [Git-based workflow](https://tinacms.org/guides/nextjs/git/getting-started).

## Installation

```bash
yarn add next-tinacms-json
```

## Helpers

- `useJsonForm( jsonFile, options? ):[values, form]`: A React Hook that creates a Git form
- `jsonForm( Component, options? ): Component`: An HOC that creates and registers a Git form
- `useLocalJsonForm`(deprecated)
- `useGlobalJsonForm`(deprecated)

### _useJsonForm_ hook

```js
const [data, form] = useJsonForm(jsonFile, formOptions)
```

As the first argument, this hook expects an object matching the following interface:

```typescript
// A datastructure representing a JSON file stored in Git
interface JsonFile<T = any> {
  fileRelativePath: string
  data: T
}
```

As with other Tina form helpers, this hook also accepts a second, optional argument — a [form configuration](/docs/plugins/forms#form-configuration) object.

**/pages/index.js**

```js
import * as React from 'react'
import { usePlugin } from 'tinacms'
import { useJsonForm } from 'next-tinacms-json'

export default function Index({ jsonFile }) {
  // Create the Form
  const [post, form] = useJsonForm(jsonFile)

  // Register it with the CMS
  usePlugin(form)

  return <h1>{post.title}</h1>
}

export async function getStaticProps() {
  const content = await import(`../../content/index.json`)

  return {
    props: {
      jsonFile: {
        fileRelativePath: `/content/index.json`,
        data: content.default,
      },
    },
  }
}
```

### _jsonForm_ HOC

`jsonForm` accepts two arguments: _a component and an optional [form configuration object](/docs/plugins/forms#form-configuration)_. The component being passed is expected to receive data as props that matches the `jsonFile` interface outlined below.

```typescript
// A datastructure representing a JSON file stored in Git
interface JsonFile<T = any> {
  fileRelativePath: string
  data: T
}
```

`jsonForm` returns the original component connected with a new JSON form registered with Tina. Below is the same example from `useJsonForm`, but refactored to use the `jsonForm` HOC.

**/pages/index.js**

```js
/**
 * 1. import jsonForm
 */
import { jsonForm } from 'next-tinacms-json'
import * as React from 'react'

function Index(props) {
  const post = props.jsonFile

  return (
    <>
      <h1>{post.title}</h1>
    </>
  )
}

/**
 * 2. Wrap and export the Page component with jsonForm
 */
export default jsonForm(Page)

export async function getStaticProps() {
  const content = await import(`../../posts/index.json`)

  return {
    props: {
      /**
       * 3. Make sure your return object matches this shape
       */
      jsonFile: {
        fileRelativePath: `/posts/index.json`,
        data: content.default,
      },
    },
  }
}
```
