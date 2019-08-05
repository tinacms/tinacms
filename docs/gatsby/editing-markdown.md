# Editing Markdown in Gatsby

Creating forms for content provided by the [`gatsby-transformer-remark`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-transformer-remark) plugin is made possible by two plugins:

- `gatsby-xeditor-remark`: Provides hooks and components for creating Remark forms.
- `gatsby-xeditor-git`: Creates a node server that writes changes to the local filesystem;
  and registers [CMS Backend](../concepts/backends.md) for saving changes to that backend.

## Installation

```
npm install --save @forestryio/gatsby-xeditor-remark @forestryio/gatsby-xeditor-git
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
    "@forestryio/gatsby-xeditor-git",
    // ...
  ]
}
```

## Creating Remark Forms

In order to edit a markdown file, you must register a form with the CMS. There are two approaches to registering Remark Forms with the XEditor. The approach you choose depends on whether the React template is class or function.

1. [`useRemarkForm`](#useRemarkForm): A [Hook](https://reactjs.org/docs/hooks-intro.html) used when the template is a function.
1. [`RemarkForm`](#RemarkForm): A [Render Props](https://reactjs.org/docs/render-props.html#use-render-props-for-cross-cutting-concerns) component to use when the template is a class component.

### Note: required query data

In order for the remark forms to work, you must include the following fields in your `markdownRemark` query:

- `fileAbsolutePath`
- `rawMarkdownBody`

An example `pageQuery` in your template might look like this:

```
query BlogPostBySlug($slug: String!) {
  site {
    siteMetadata {
      title
    }
  }
  markdownRemark(fields: { slug: { eq: $slug } }) {
    id
    fileAbsolutePath
    rawMarkdownBody
    html
    frontmatter {
      title
      date(formatString: "MMMM DD, YYYY")
      description
    }
  }
}
```

Additionally, any front matter fields that are **not** queried will be deleted when saving content via the CMS.

### useRemarkForm

This is a [React Hook](https://reactjs.org/docs/hooks-intro.html) for registering Remark Forms with the CMS.
This is the recommended approach if your template is a Function Component.

**Interface**

```typescript
useRemarkForm(remark): [values, form]
```

**Arguments**

- `remark`: The data returned from a Gatsby `markdownRemark` query.

**Return**

- `[values, form]`
  - `values`: The current values to be displayed. This has the same shape as the `remark` argument.
  - `form`: A reference to the [CMS Form](../concepts/forms.md) object. The `form` is rarely needed in the template.

**src/templates/blog-post.js**

```javascript
import { useRemarkForm } from '@forestryio/gatsby-xeditor-remark'

function BlogPostTemplate(props) {
  const [markdownRemark] = useRemarkForm(props.data.markdownRemark)

  return <h1>{markdownRemark.frontmatter.title}</h1>
}
```

### RemarkForm

`RemarkForm` is a [Render Props](https://reactjs.org/docs/render-props.html#use-render-props-for-cross-cutting-concerns)
based component for accessing [CMS Forms](../concepts/forms.md).

This Component is a thin wrapper of `useRemarkForm`. Since React[Hooks](https://reactjs.org/docs/hooks-intro.html) are
only available within Function Components you will wneed to use `RemarkForm` if your template is Class Component.

**Props**

- `remark`: The data returned from a Gatsby `markdownRemark` query.
- `render({ markdownRemark, form }): JSX.Element`: A function that returns JSX elements
  - `markdownRemark`: The current values to be displayed. This has the same shape as the data in the `remark` prop.
  - `form`: A reference to the [CMS Form](../concepts/forms.md) object. The `form` is rarely needed in the template.

**src/templates/blog-post.js**

```javascript
import { RemarkForm } from '@forestryio/gatsby-xeditor-remark'

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

## Editing Content

With the Remark Form created, you can now edit the files in the XEditor sidebar. Changes to the form
will be written back to the markdown files in real time.

**Why write to disk "on change"?**

This allows any `gatsby-remark-*` plugins to properly transform the data in to a remark node and
provide a true-fidelity preview of the changes.

Without this behaviour, producing a true-fidelity preview of the changes would require the frontend
to replicate all transformations applied to the Markdown files by the gatsby transformers.

## Customizing Remark Forms

The `useRemarkForm` automatically creates a list of form fields based on the shape of
your data. This is convenient for getting started but you will probably want to customize the form's list of fields. Here's a couple reason's why:

1. The field's `label` defaults to it's `name`.
1. Every field is rendered with a `text` component.
1. The order of fields might not be consistent.

We lied about the interface of [`useRemarkForm`](#useRemarkForm) earlier, it actually has a second arguments:

```typescript
//                               👇
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
import { useRemarkForm } from '@forestryio/gatsby-xeditor-remark'

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
