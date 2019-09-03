# Editing JSON in Gatsby

Creating forms for content provided by the [`gatsby-transformer-json`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-transformer-json) plugin is made possible by three plugins:

- `gatsby-tinacms-json`: Provides hooks and components for creating Remark forms.
- `gatsby-tinacms-git`: Extends the gatsby dev server to writes changes to the local filesystem;
  and registers [CMS Backend](../concepts/backends.md) for saving changes to that backend.

## Installation

```
npm install --save gatsby-source-filesystem gatsby-transformer-json @tinacms/gatsby-tinacms-git @tinacms/react-tinacms-json
```

or

```
yarn add gatsby-source-filesystem gatsby-transformer-json @tinacms/gatsby-tinacms-git @tinacms/react-tinacms-json
```

## Configuring Gatsby

**gastby-config.js**

```javascript
module.exports = {
  plugins: [
    // ...
    '@tinacms/react-tinacms-json',
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/data`,
        name: 'data',
      },
    },
    'gatsby-transformer-json',
  ],
}
```

This will create a node for each json file in the `src/data` directory. You can then query that data like so:

```graphql
query MyQuery {
  dataJson(firstName: { eq: "Nolan" }) {
    lastName
    firstName
  }
}
```

## Creating JSON Forms

In order to edit a json file, you must register a form with the CMS. There are two approaches to registering Json Forms with the XEditor. The approach you choose depends on whether the React template is class or function.

1. [`useJsonForm`](#useJsonForm): A [Hook](https://reactjs.org/docs/hooks-intro.html) used when the template is a function.
1. [`JsonForm`](#JsonForm): A [Render Props](https://reactjs.org/docs/render-props.html#use-render-props-for-cross-cutting-concerns) component to use when the template is a class component.

### Note: required query data

In order for the Json forms to work, you must include the following fields in your `dataJson` query:

- `fields.fileRelativePath`

An example `dataQuery` in your template might look like this:

```
query DataQuery($slug: String!) {
  dataJson(fields: { slug: { eq: $slug } }) {
    fields {
      fileRelativePath
    }
    firstName
    lastName
  }
}
```

Additionally, any fields that are **not** queried will be deleted when saving content via the CMS.

### useJsonForm

This is a [React Hook](https://reactjs.org/docs/hooks-intro.html) for registering Json Forms with the CMS.
This is the recommended approach if your template is a Function Component.

**Interface**

```typescript
useJsonForm(data): [values, form]
```

**Arguments**

- `data`: The data returned from a Gatsby `dataJson` query.

**Return**

- `[values, form]`
  - `values`: The current values to be displayed. This has the same shape as the `data` argument.
  - `form`: A reference to the [CMS Form](../concepts/forms.md) object. The `form` is rarely needed in the template.

**src/templates/blog-post.js**

```jsx
import { useJsonForm } from '@tinacms/react-tinacms-json'

function DataTemplate(props) {
  const [data] = useJsonForm(props.data.dataJson)

  return <h1>{data.firstName}</h1>
}
```

### JsonForm

`JsonForm` is a [Render Props](https://reactjs.org/docs/render-props.html#use-render-props-for-cross-cutting-concerns)
based component for accessing [CMS Forms](../concepts/forms.md).

This Component is a thin wrapper of `useJsonForm`. Since React[Hooks](https://reactjs.org/docs/hooks-intro.html) are
only available within Function Components you will wneed to use `JsonForm` if your template is Class Component.

**Props**

- `data`: The data returned from a Gatsby `dataJson` query.
- `render({ data, form }): JSX.Element`: A function that returns JSX elements
  - `data`: The current values to be displayed. This has the same shape as the data in the `Json` prop.
  - `form`: A reference to the [CMS Form](../concepts/forms.md) object. The `form` is rarely needed in the template.

**src/templates/blog-post.js**

```jsx
import { JsonForm } from '@tinacms/react-tinacms-json'

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

## Next Steps

- [Editing Markdown](./editing-markdown.md)

## References

- [Creating Forms](../react/creating-forms.md)
- [Custom Field Plugins](./custom-field-plugins.md)
