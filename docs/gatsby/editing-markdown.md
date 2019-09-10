# Editing Markdown in Gatsby

The [`gatsby-transformer-remark`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-transformer-remark) plugin lets us use markdown in our Gatsby sites. Two additional plugins let us edit markdown with Tina:

- `gatsby-tinacms-remark`: Provides hooks and components for creating Remark forms.
- `gatsby-tinacms-git`: Extends the gatsby development server to writes changes to the local filesystem;
  and registers [CMS Backend](../concepts/backends.md) for saving changes to that backend.

## Installation

```
npm install --save @tinacms/react-tinacms-remark @tinacms/gatsby-tinacms-git
```

or

```
yarn add @tinacms/react-tinacms-remark @tinacms/gatsby-tinacms-git
```

## Adding the Plugin

Open the `gatsby-config.js` file and add make sure the following plugins are listed:

```JavaScript
module.exports = {
  plugins: [
    "@tinacms/gatsby-tinacms-git",
    // ...
  ]
}
```

## Creating Remark Forms

The `remarkForm` [higher-order component](https://reactjs.org/docs/higher-order-components.html) (HOC) let's us register forms with `Tina`. In order for it to work with your template, 3 fields must be included in the `markdownRemark` query:

- `id`
- `fileRelativePath`
- `rawMarkdownBody`
- `rawFrontmatter`

**Example: src/templates/blog-post.js**

```jsx
import { remarkForm } from '@tinacms/react-tinacms-remark'

function BlogPostTemplate(props) {
  return <h1>{props.data.markdownRemark.frontmatter.title}</h1>
}

// Wrap the export with `remarkForm`
export default remarkForm(BlogPostTemplate)

// Include the required fields in the query
export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      fileRelativePath
      rawMarkdownBody
      rawFrontmatter
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

The `remarkForm` function accepts an optional `config` object for overriding the default configuration of a `RemarkForm`. The following properties are accepted:

- `fields`: A list of field definitions
  - `name`: The path to some value in the data being edited. (e.g. `frontmatter.tittle`)
  - `component`: The name of the React component that should be used to edit this field.
    The default options are: `"text"`, `"textarea"`, `"color"`.
  - `label`: A human readable label for the field.

#### Example: src/templates/blog-post.js

```jsx
import { remarkForm } from '@tinacms/react-tinacms-remark'

function BlogPostTemplate(props) {
  return (
    <>
      <h1>{props.markdownRemark.frontmatter.title}</h1>
      <p>{props.markdownRemark.frontmatter.description}</p>
    </>
  )
}

let BlogPostForm = {
  fields: [
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
  ],
}

export default remarkForm(BlogPostTemplate, BlogPostForm)
```

## Editing Content

With the Remark Form created, you can now edit the files in the Tina sidebar. Changes to the form
will be written back to the markdown files in real time.

**Why write to disk "on change"?**

This allows any `gatsby-remark-*` plugins to properly transform the data in to a remark node and
provide a true-fidelity preview of the changes.

Without this behaviour, producing a true-fidelity preview of the changes would require the frontend
to replicate all transformations applied to the Markdown files by the gatsby transformers.

## Next Steps

- [Creating Markdown](./creating-markdown.md)
- [Editing Json](./editing-json.md)

## References

- [Creating Forms](../react/creating-forms.md)
- [Custom Field Plugins](./custom-field-plugins.md)
