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
    "@forestryio/gatsby-xeditor-git",
    // ...
  ]
}
```

## Creating Remark Forms

In order to edit a markdown file you must register a form with the CMS. This is done using the `remarkForm` function.

### Querying Data

In order for the remark forms to work, you must include the following fields in your `markdownRemark` query:

- `id`
- `fields.fileRelativePath`
- `rawMarkdownBody`

An example `pageQuery` in your template might look like this:

```graphql
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
      date(formatString: "MMMM DD, YYYY")
      description
    }
  }
}
```

\__IMPORTANT:_ Additionally, any front matter fields that are **not** queried will be deleted when saving content via the CMS.

## Registering Forms

```javascript
function BlogPostTemplate(props) {
  return <h1>{props.data.markdownRemark.frontmatter.title}</h1>
}

export default remarkForm()(BlogPostTemplate)
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
