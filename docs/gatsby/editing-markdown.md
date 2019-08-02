# Editing Markdown in Gatsby

The `gatsby-xeditor-remark` plugin makes it easy to create forms for editing content provided by the [`gatsby-transformer-remark`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-transformer-remark) plugin.

## Installation

```
npm install -g @forestryio/gatsby-xeditor-remark @forestryio/gatsby-xeditor-git
```

or

```
yarn add @forestryio/gatsby-xeditor-remark @forestryio/gatsby-xeditor-git
```

## Adding the Plugin

Open the `gatsby-config.js` file and add make sure the following plugins are listed:

```JavaScript
module.exports = {
  plugins: [
    "@forestryio/gatsby-plugin-xeditor",
    "@forestryio/gatsby-xeditor-remark",
    "@forestryio/gatsby-xeditor-git",
    // ...
  ]
}
```

## Creating Remark Forms

In order to edit a markdown file, you must register a form with the CMS. There are two ways to register remark forms with the CMS, depending on how your React template is setup.

1. [`useRemarkForm`](#useRemarkForm): A [Hook](https://reactjs.org/docs/hooks-intro.html). Used when the page template is a function component.
1. [`RemarkForm`](#RemarkForm): A [Render Props](https://reactjs.org/docs/render-props.html#use-render-props-for-cross-cutting-concerns) component. Used when the page template is a class component.

### useRemarkForm

This is a React hook for registering Remark forms with the CMS. This is the recommended approach if your template is Function Components

**Interface**

```typescript
useRemarkForm(remark): [values, form]
```

**Arguments**

- `remark`: the data returned from a Gatsby `markdownRemark` query.

**Return**

- `[values, form]`
  - `values`: The current values to be displayed. This has the same shape as the `markdownRemark` data.
  - `form`: A reference to the `Form`. See `@forestryio/cms` for more details.

**src/templates/blog-post.js**

```javascript
import { useRemarkForm } from '@forestryio/gatsby-plugin-xeditor'

function BlogPostTemplate(props) {
  const [markdownRemark] = useRemarkForm(props.data.markdownRemark)

  return <h1>{markdownRemark.frontmatter.title}</h1>
}
```

### RemarkForm

`RemarkForm` is a [Render Props](https://reactjs.org/docs/render-props.html#use-render-props-for-cross-cutting-concerns) based component for accessing CMS Forms.

This is a thin wrapper around `useRemarkForm`. Since React [Hooks](https://reactjs.org/docs/hooks-intro.html) are only available within Function Components you may need to use `RemarkForm` instead of calling `useRemarkForm` directly.

**Props**

- `remark`: the data returned from a Gatsby `markdownRemark` query.
- `render({ markdownRemark, form}): JSX.Element`: A function that returns JSX elements
  - `markdownRemark`: The current values to be displayed. This has the same shape as the data in the `remark` prop.
  - `form`: A reference to the `Form`. See `@forestryio/cms` for more details.

**src/templates/blog-post.js**

```javascript
import { RemarkForm } from '@forestryio/gatsby-plugin-xeditor'

class BlogPostTemplate extends React.Component {
  render() {
    return (
      <RemarkForm
        remark={this.props.data.markdownRemark}
        render={({ markdownRemark }) => {
          return <h1>{markdownRemark.frontmatter.title}</h1>
        }}
      />
    )
  }
}
```

## Customizing Remark Forms

The `useRemarkForm` automatically creates a list of form fields based on the shape of
your data. This is convenient for getting started but you will probably want to customize the form's list of fields. Here's a couple reason's why:

1. The field's `label` defaults to it's `name`.
1. Every field is rendered with a `text` component.
1. The order of fields might not be consistent.

In the [`useRemarkForm`](#useRemarkForm) section above, we lied a little bit about that interface of that function. The `useRemarkForm` function actually has a second arguments:

```typescript
function useRemarkForm(remark, config): [values, form]
```

**Config**

The `config` is an optional object for overriding the default configuration of a `RemarkForm`. The following properties are accepted:

- `fields`: A list of field definitions

**Field Definitions**

- `name`: The path to some value in the data being edited. (e.g. `frontmatter.tittle`)
- `component`: The name of the React component that should be used to edit this field.
  The default options are: `"text"`, `"textarea"`, `"color"`.
- `label`: A human readable label for the field.

```javascript
import { useRemarkForm } from '@forestryio/gatsby-plugin-xeditor'

function BlogPostTemplate(props) {
  const [markdownRemark] = useRemarkForm(props.data.markdownRemark, {
    fields: [
      {
        label: "Title",
        name: "frontmatter.title",
        component: "text",
      },
      {
        label: "Description",
        name: "frontmatter.description",
        component: "textarea",
      },
    ]
  })

  return (
    <h1>{markdownRemark.frontmatter.title}</h1>
    <p>{markdownRemark.frontmatter.description}</p>
  )
}
```

## References

- [Creating Forms](../react/creating-forms.md)
- [Custom Field Plugins](./custom-field-plugins.md)
  {
  label: "Title",
  name: "frontmatter.title",
  component: "text",
  },
  {
  label: "Description",
  name: "frontmatter.description",
  component: "textarea",
  },
  ]
  })

  return (

  <h1>{markdownRemark.frontmatter.title}</h1>
  <p>{markdownRemark.frontmatter.description}</p>
  )
  }

```

## References

- [Creating Forms](../react/creating-forms.md)
- [Custom Field Plugins](./custom-field-plugins.md)
```
