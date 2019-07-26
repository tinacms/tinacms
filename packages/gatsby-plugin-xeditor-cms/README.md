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

Next need to register content so it can be edited.

## Making Content Editable

`@forestryio/gatsby-plugin-xeditor-cms` supports editing content added by the `gatsby-transformer-remark` plugin.

In order to make content editable, it must be registered with the CMS. There are two ways to do this
with `@forestryio/gatsby-plugin-xeditor-cms` depending on how your templates are setup.

1. `useRemarkForm`: A hook. Used when the page template is a function component.
1. `RemarkForm`: A render children component. Used when the page template is a class component.

### Option 1: `useRemarkForm(remark): [values, form]`

**Arguments**

- `remark`: the data returned from a Gatsby `markdownRemark` query.

**Return**

- `[values, form]`
  - `values`: The current values to be display. This has the same shape as the `markdownRemark` data.
  - `form`: A reference to the `Form`. See `@forestryio/cms` for more details.

**src/templates/blog-post.js**

```javascript
import { useRemarkForm } from "@forestryio/gatsby-plugin-xeditor-cms"

function BlogPostTemplate(props) {
  const [markdownRemark] = useRemarkForm(props.data.markdownRemark)

  return (
    // ...
  )
}
```

### Option 2: `RemarkForm`

`RemarkForm` is a [Render Children](https://reactjs.org/docs/render-props.html#use-render-props-for-cross-cutting-concerns) based component for accessing CMS Forms.

This is a thin wrapper around `useRemarkForm`. Since React Hooks are only available within Function Components you may need to use this instead of `useRemarkForm` directly.

**Props**

- `remark`: the data returned from a Gatsby `markdownRemark` query.
- `children(renderProps): JSX.Element`: A render-child function.
  - `renderProps.data`: The current values to be display. This has the same shape as the `markdownRemark` data.
  - `renderProps.form`: A reference to the `Form`. See `@forestryio/cms` for more details.

**src/templates/blog-post.js**

```javascript
import { RemarkForm } from "@forestryio/gatsby-plugin-xeditor-cms"

class BlogPostTemplate extends React.Component {
  render() {

    return (
      <RemarkForm remark={this.props.data.markdownRemark}>
        {({ values, form }) => {
          return (
            // ...
          )
        }}
      </RemarkForm>
    )
  }
}
```
