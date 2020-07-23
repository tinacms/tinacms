# _gatsby-tinacms-json_

A Gatsby/Tina plugin for **editing JSON files stored in git**.

## Installation

```
yarn add gatsby-plugin-tinacms gatsby-tinacms-git gatsby-tinacms-json
```

## Setup

Include `gatsby-plugin-tinacms`, `gatsby-tinacms-git`, and `gatsby-tinacms-json` in your config:

**gatsby-config.js**

```javascript
module.exports = {
  // ...
  plugins: [
    // ...
    {
      resolve: 'gatsby-plugin-tinacms',
      options: {
        plugins: ['gatsby-tinacms-git', 'gatsby-tinacms-json'],
      },
    },
  ],
}
```

## Creating JSON Forms

There are two approaches to registering JSON forms with Tina. The approach you choose depends on whether the React template is a class or function.

1. [`useJsonForm`](#useJsonForm): A [Hook](https://reactjs.org/docs/hooks-intro.html) used when the template is a function.
2. [`JsonForm`](#JsonForm): A [Render Props](https://reactjs.org/docs/render-props.html#use-render-props-for-cross-cutting-concerns) component to use when the template is a class component.

#### Note: required query data

In order for the JSON forms to work, you must include the following fields in your `dataJson` graphql query:

- `rawJson`
- `fileRelativePath`

An example `dataQuery` in your template might look like this:

    query DataQuery($slug: String!) {
      dataJson(fields: { slug: { eq: $slug } }) {
        id
        firstName
        lastName

        rawJson
        fileRelativePath
      }
    }

Additionally, any fields that are **not** queried will be deleted when saving content via the CMS.

### useJsonForm

This is a [React Hook](https://reactjs.org/docs/hooks-intro.html) for creating Json Forms.
This is the recommended approach if your template is a Function Component.

In order to use a form you must register it with the CMS. There are two main approaches to register forms in Tina: page forms and screen plugins. Please refer to the [form concepts](/docs/forms) doc to get clarity on the differences.

**Interface**

```typescript
useJsonForm(data): [values, form]
```

**Arguments**

- `data`: The data returned from a Gatsby `dataJson` query.

**Return**

- `[values, form]`
  - `values`: The current values to be displayed. This has the same shape as the `data` argument.
  - `form`: A reference to the [CMS Form](/docs/forms) object. The `form` is rarely needed in the template.

#### Example

**src/templates/blog-post.js**

```jsx
import { usePlugin } from 'tinacms'
import { useJsonForm } from 'gatsby-tinacms-json'

function BlogPostTemplate(props) {
  // Create the form
  const [data, form] = useJsonForm(props.data.dataJson)

  // Register it with the CMS
  usePlugin(form)

  return <h1>{data.firstName}</h1>
}
```

### JsonForm

`JsonForm` is a [Render Props](https://reactjs.org/docs/render-props.html#use-render-props-for-cross-cutting-concerns)
based component for accessing [CMS Forms](/docs/forms).

This Component is a thin wrapper of `useJsonForm` and `usePlugin`. Since [React Hooks](https://reactjs.org/docs/hooks-intro.html) are
only available within Function Components you will need to use `JsonForm` if your template is Class Component.

**Props**

- `data`: The data returned from a Gatsby `dataJson` query.
- `render({ data, form }): JSX.Element`: A function that returns JSX elements
  - `data`: The current values to be displayed. This has the same shape as the data in the `Json` prop.
  - `form`: A reference to the [CMS Form](/docs/forms) object. The `form` is rarely needed in the template.

**src/templates/blog-post.js**

```jsx
import { JsonForm } from 'gatsby-tinacms-json'

class DataTemplate extends React.Component {
  render() {
    return (
      <JsonForm
        data={this.props.data.dataJson}
        render={({ data }) => {
          return <h1>{data.firstName}</h1>
        }}
      />
    )
  }
}
```

## Content Creator

`JsonCreatorPlugin`: contstructs a `content-creator` plugin for JSON files.

```typescript
interface JsonCreatorPlugin {
  label: string
  fields: Field[]
  filename(form: any): Promise<string>
  data?(form: any): Promise<any>
}
```

**Example**

```javascript
import { JsonCreatorPlugin } from 'gatsby-tinacms-json'

const CreatePostPlugin = new JsonCreatorPlugin({
  label: 'New JSON File',
  filename: form => {
    return form.filename
  },
  fields: [
    {
      name: 'filename',
      component: 'text',
      label: 'Filename',
      placeholder: 'content/data/puppies.json',
      description:
        'The full path to the new Markdown file, relative to the repository root.',
    },
  ],
})
```