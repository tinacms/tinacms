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

Next you will have to register some content to be editable.

## Making Content Editable

### MarkdownRemark

This plugin makes it easy to edit content provided by the [`gatsby-transformer-remark`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-transformer-remark) plugin. There are two ways to register remark forms with the CMS, depending on how your React template is setup.

1. `useRemarkForm`: A [Hook](https://reactjs.org/docs/hooks-intro.html). Used when the page template is a function component.
1. `RemarkForm`: A [Render Props](https://reactjs.org/docs/render-props.html#use-render-props-for-cross-cutting-concerns) component. Used when the page template is a class component.

### Option 1: `useRemarkForm(remark): [values, form]`

**Arguments**

- `remark`: the data returned from a Gatsby `markdownRemark` query.

**Return**

- `[values, form]`
  - `values`: The current values to be display. This has the same shape as the `markdownRemark` data.
  - `form`: A reference to the `Form`. See `@forestryio/cms` for more details.

**src/templates/blog-post.js**

```javascript
import { useRemarkForm } from '@forestryio/gatsby-plugin-xeditor-cms'

function BlogPostTemplate(props) {
  const [markdownRemark] = useRemarkForm(props.data.markdownRemark)

  return <h1>{markdownRemark.frontmatter.title}</h1>
}
```

### Option 2: `RemarkForm`

`RemarkForm` is a [Render Props](https://reactjs.org/docs/render-props.html#use-render-props-for-cross-cutting-concerns) based component for accessing CMS Forms.

This is a thin wrapper around `useRemarkForm`. Since React [Hooks](https://reactjs.org/docs/hooks-intro.html) are only available within Function Components you may need to use `RemarkForm` instead of calling `useRemarkForm` directly.

**Props**

- `remark`: the data returned from a Gatsby `markdownRemark` query.
- `render(renderProps): JSX.Element`: A function that returns JSX elements
  - `renderProps.markdownRemark`: The current values to be displayed. This has the same shape as the `markdownRemark` data that was passed in.
  - `renderProps.form`: A reference to the `Form`. See `@forestryio/cms` for more details.

**src/templates/blog-post.js**

```javascript
import { RemarkForm } from '@forestryio/gatsby-plugin-xeditor-cms'

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

### Creating custom field plugins

Custom fields can be added to customize how fields can be edited.

**Props**

- [input](https://github.com/final-form/react-final-form#inputname-string) : data and events around the field's state
- [meta](https://github.com/final-form/react-final-form#metaactive-boolean) : data describing the field's form state
- field
  - `name: string;`
  - `component: React.FC<any> | string;`

**Example**

```javascript
//a basic TextInput field plugin
export const TextInput = ({ field, input, meta, ...props }: any) => {
  return (
    <div {...props}>
      <div>
        <label htmlFor={name}>{field.name}</label>
      </div>
      <input {...input} />
      {meta.error && <p>{meta.error}</p>}
    </div>
  )
}
```

### Registering custom field plugins:

Field plugins can be registered to define how all fields of a certain component id will look in the sidebar.

You may want to register your fields inside `wrapPageElement` to ensure that they are registered for all pages on your site.

**/gatsby-browser.js**

```javascript
//gatsby-browser.js
import * as React from 'react'
import { useCMS } from '@forestryio/cms-react'
import { ShortTextField } from './your-custom-field'

export const wrapPageElement = ({ element }) => {
  return <FieldRegistrar>{element}</FieldRegistrar>
}

let firstRender = true
const FieldRegistrar = ({ children }) => {
  const cms = useCMS()

  React.useEffect(() => {
    if (firstRender) {
      //make sure to only register the field plugin once
      cms.forms.addFieldPlugin({
        name: 'short-text',
        Component: ShortTextField,
      })
    }
    firstRender = false
  }, [])

  return children
}
```

### Using your custom field plugins:

Any fields with an unspecified field type will default to the 'text' component.

To customize the component type of your fields using `RemarkForm`, you can pass in some optional form overrides.

**Using the useRemark hook:**

```javascript
function BlogPostTemplate(props) {
  const [markdownRemark] = useRemarkForm(props.data.markdownRemark, {
    fields: [{ name: 'frontmatter.title', component: 'short-text' }],
  })

  return <h1>{markdownRemark.frontmatter.title}</h1>
}
```

**Using the RemarkForm renderProps approach:**

```javascript
import { RemarkForm } from '@forestryio/gatsby-plugin-xeditor-cms'

class BlogPostTemplate extends React.Component {
  render() {
    return (
      <RemarkForm
        remark={this.props.data.markdownRemark}
        fields={[{ name: 'frontmatter.title', component: 'short-text' }]}
      >
        {({ markdownRemark }) => {
          return <h1>{markdownRemark.frontmatter.title}</h1>
        }}
      </RemarkForm>
    )
  }
}
```

Additionally, you can also just pass in the component itself instead of its id

```javascript
import { ShortTextField } from './your-custom-field'

function BlogPostTemplate(props) {
  const [markdownRemark] = useRemarkForm(props.data.markdownRemark, {
    fields: [{ name: 'frontmatter.title', component: ShortTextField }],
  })

  return <h1>{markdownRemark.frontmatter.title}</h1>
}
```
