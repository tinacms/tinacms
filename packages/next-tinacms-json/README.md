# next-tinacms-json

The `next-tinacms-json` package provides helpers to make local JSON content editable. This package is intended to be used with a [Git-based workflow](https://tinacms.org/guides/nextjs/git/getting-started).

## Installation

```bash
yarn add next-tinacms-json
```

## API

| Export | Description|
| --- | --- |
| `JsonFile` | A interface representing a JSON file stored on the local filesystem in Git.|
| `useJsonForm` | [React Hook](https://reactjs.org/docs/hooks-intro.html) that creates a [TinaCMS Form Plugin](https://tinacms.org/docs/plugins/forms) for editing a `JsonFile`.|


### _JsonFile_
The `JsonFile` interface represents a JSON file stored on the local filesystem in Git.

```ts
export interface JsonFile {
  fileRelativePath: string
  data: any
}
```

| Name | Description |
| --- | --- |
| `fileRelativePath` | The path to the file relative to the root of the Git repository. |
| `data`| The parsed data from the JSON file.|

### _useJsonForm_

The `useJsonForm` function is a [React Hook](https://reactjs.org/docs/hooks-intro.html) creates a [TinaCMS Form Plugin](https://tinacms.org/docs/plugins/forms) for editing a `JsonFile`.

```ts
import { Form, FormOptions } from "tinacms"

export function useJsonForm(
  jsonFile: JsonFile,
  options?: FormOptions
):[any, Form]
```

The `useJsonForm` hook accepts a [JsonFile](#jsonfile) and an optional [FormOptions](/docs/plugins/forms#form-configuration) object. It returns an array with containing the current values aand the Form.


**Example: pages/index.js**

```js
import { usePlugin } from 'tinacms'
import { useJsonForm } from 'next-tinacms-json'

export default function Index({ jsonFile }) {
  // Create the Form
  const [homePage, homePageForm] = useJsonForm(jsonFile)

  // Register it with the CMS
  usePlugin(homePageForm)

  return <h1>{homePage.title}</h1>
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
