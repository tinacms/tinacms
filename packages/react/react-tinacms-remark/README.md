# Remark Adapter for Xeditor Gatsby Plugin

This library makes it easy to edit content provided by the [`gatsby-transformer-remark`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-transformer-remark) plugin. There are two ways to register remark forms with the CMS, depending on how your React template is setup.

1. `useRemarkForm`: A [Hook](https://reactjs.org/docs/hooks-intro.html). Used when the page template is a function component.
1. `RemarkForm`: A [Render Props](https://reactjs.org/docs/render-props.html#use-render-props-for-cross-cutting-concerns) component. Used when the page template is a class component.

## Option 1: `useRemarkForm(remark): [values, form]`

**Arguments**

- `remark`: the data returned from a Gatsby `markdownRemark` query.

**Return**

- `[values, form]`
  - `values`: The current values to be display. This has the same shape as the `markdownRemark` data.
  - `form`: A reference to the `Form`. See `@tinacms/cms` for more details.

**src/templates/blog-post.js**

```javascript
import { useRemarkForm } from '@tinacms/gatsby-plugin-xeditor'

function BlogPostTemplate(props) {
  const [markdownRemark] = useRemarkForm(props.data.markdownRemark)

  return <h1>{markdownRemark.frontmatter.title}</h1>
}
```

## Option 2: `RemarkForm`

`RemarkForm` is a [Render Props](https://reactjs.org/docs/render-props.html#use-render-props-for-cross-cutting-concerns) based component for accessing CMS Forms.

This is a thin wrapper around `useRemarkForm`. Since React [Hooks](https://reactjs.org/docs/hooks-intro.html) are only available within Function Components you may need to use `RemarkForm` instead of calling `useRemarkForm` directly.

**Props**

- `remark`: the data returned from a Gatsby `markdownRemark` query.
- `render(renderProps): JSX.Element`: A function that returns JSX elements
  - `renderProps.markdownRemark`: The current values to be displayed. This has the same shape as the `markdownRemark` data that was passed in.
  - `renderProps.form`: A reference to the `Form`. See `@tinacms/cms` for more details.

**src/templates/blog-post.js**

```javascript
import { RemarkForm } from '@tinacms/gatsby-plugin-xeditor'

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
