# Editing Markdown in Gatsby

Creating forms for content provided by the [`gatsby-transformer-remark`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-transformer-remark) plugin is made possible by three plugins:

- `gatsby-xeditor-remark`: Provides hooks and components for creating Remark forms.
- `gatsby-xeditor-git`: Extends the gatsby development server to writes changes to the local filesystem;
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
    "@forestryio/gatsby-xeditor-git",
    "@forestryio/gatsby-xeditor-remark",
    // ...
  ]
}
```

## Creating Remark Forms

The `remarkForm` [higher-order component](https://reactjs.org/docs/higher-order-components.html) (HOC) let's us register forms with `xeditor`. In order for it to work with your template, 3 fields must be included in the `markdownRemark` query:

- `id`
- `fields.fileRelativePath`
- `rawMarkdownBody`

**Example: src/templates/blog-post.js**

```jsx
import { remarkForm } from '@forestryio/gatsby-xeditor-remark'

function BlogPostTemplate(props) {
  return <h1>{props.data.markdownRemark.frontmatter.title}</h1>
}

// Wrap the export with `remarkForm`
export default remarkForm()(BlogPostTemplate)

// Include the required fields in the query
export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      fields {
        fileRelativePath
      }
      rawMarkdownBody

      html
      frontmatter {
        title
        date
        description
      }
    }
  }
`
```

_IMPORTANT:_ Any front matter fields that are **not** queried will be deleted when saving content via the CMS.

## Customizing Forms

The `remarkForm` HOC automatically creates a list of form fields based on the shape of your data. This is convenient for getting started but you will probably want to customize the form's list of fields.

**Why customize the form?**

1. The default `label` for a field is it's `name`.
1. Every field is made a `text` component.
1. The order of fields might not be consistent.

The `remarkForm` function accepts some options.

**Example: src/templates/blog-post.js**

```typescript
//                          👇
export default remarkForm(config)(BlogPostTemplate)
```

**Config**

The `config` is an optional object for overriding the default configuration of a `RemarkForm`. The following properties are accepted:

- `fields`: A list of field definitions

**Field Definitions**

- `name`: The path to some value in the data being edited. (e.g. `frontmatter.tittle`)
- `component`: The name of the React component that should be used to edit this field.
  The default options are: `"text"`, `"textarea"`, `"color"`.
- `label`: A human readable label for the field.

#### Example: src/templates/blog-post.js

```jsx
import { useRemarkForm } from '@forestryio/gatsby-xeditor-remark'

function BlogPostTemplate(props) {
  return (
    <>
      <h1>{props.markdownRemark.frontmatter.title}</h1>
      <p>{props.markdownRemark.frontmatter.description}</p>
    </>
  )
}

let BlogFields = [
  {
    label: 'Title',
    name: 'frontmatter.title',
    component: 'text',
  },
  {
    label: 'Description',
    name: 'frontmatter.description',
    component: 'textarea',
  },
]

export default remarkForm({ fields })(BlogPostTemplate)
```

## Editing Content

With the Remark Form created, you can now edit the files in the XEditor sidebar. Changes to the form
will be written back to the markdown files in real time.

**Why write to disk "on change"?**

This allows any `gatsby-remark-*` plugins to properly transform the data in to a remark node and
provide a true-fidelity preview of the changes.

Without this behaviour, producing a true-fidelity preview of the changes would require the frontend
to replicate all transformations applied to the Markdown files by the gatsby transformers.

## Next Steps

- [Editing Json](./editing-json.md)

## References

- [Creating Forms](../react/creating-forms.md)
- [Custom Field Plugins](./custom-field-plugins.md)
