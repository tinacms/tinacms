# @forestrtyio/gatsby-plugin-xeditor-cms

A Gatsby plugin for the XEditor CMS.

## Setup

Add the plugin to your project:

```sh
yarn add @forestryio/@forestrtyio/gatsby-plugin-xeditor-cms
```

Include it in the list of plugins:

_gatsby.config.js_

```javascript
module.exports = {
  // ...
  plugins: [
    // ...
    '@forestryio/@forestrtyio/gatsby-plugin-xeditor-cms',
  ],
}
```

Start the gatsby development server:

```sh
gatsby develop
```

## Editing Markdown Files

`@forestrtyio/gatsby-plugin-xeditor-cms` supports editing nodes created by the `gatsby-transformer-remark` plugin.

Use the `useRemarkForm` hook to make your `markdownRemark` node editable. For example:

**src/templates/blog-post.js**

```javascript
import { useRemarkForm } from "@forestrtyio/gatsby-plugin-xeditor-cms"

function BlogPostTemplate(props) {
  const [form, post] = useRemarkForm(props.data.markdownRemark)

  return (
    // ...
  )
}
```
