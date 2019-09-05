# @tinacms/gatsby-plugin-tinacms

A Gatsby plugin for the Tina CMS.

## Installation

```
npm install --save @tinacms/gatsby-plugin-tinacms
```

or

```sh
yarn add @tinacms/gatsby-plugin-tinacms
```

## Setup

Include `@tinacms/gatsby-plugin-tinacms` in the list of gatsby plugins:

_gatsby.config.js_

```javascript
module.exports = {
  // ...
  plugins: [
    // ...
    '@tinacms/gatsby-plugin-tinacms',
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

See `gatsby-tinacms-remark`.

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
import { useCMS } from '@tinacms/react-tinacms'
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
import { RemarkForm } from '@tinacms/gatsby-plugin-tinacms'

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

## Known Issues

Elements positioned relative to the window (e.g with `position: fixed`) may be hidden by the sidebar.
