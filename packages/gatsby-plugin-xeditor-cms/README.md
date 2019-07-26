# @forestryio/gatsby-plugin-xeditor-cms

A Gatsby plugin for the XEditor CMS.

## Installation

```
npm install --save @forestryio/gatsby-plugin-xeditor-cms
```

or

```sh
yarn add @forestryio/gatsby-plugin-xeditor-cms
```

## Setup

Include `@forestryio/gatsby-plugin-xeditor-cms` in the list of gatsby plugins:

_gatsby.config.js_

```javascript
module.exports = {
  // ...
  plugins: [
    // ...
    '@forestryio/gatsby-plugin-xeditor-cms',
  ],
}
```

Start the gatsby development server:

```sh
gatsby develop
```

Open a browser to http://localhost:8000 and click the "Open CMS" button in the top bar.

A sidebar will open up, but there won't be much to see.

Next need to register content to be editable

## Making Content Editable

`@forestryio/gatsby-plugin-xeditor-cms` supports editing nodes created by the `gatsby-transformer-remark` plugin.

Use the `useRemarkForm` hook to make your `markdownRemark` node editable. This is implemented using
[React hooks](https://reactjs.org/docs/hooks-intro.html) so make sure you're template is a Function Component rather then a Class Component.

**src/templates/blog-post.js**

```javascript
import { useRemarkForm } from "@forestryio/gatsby-plugin-xeditor-cms"

function BlogPostTemplate(props) {
  const [form, post] = useRemarkForm(props.data.markdownRemark)

  return (
    // ...
  )
}
```
