# Custom Field Plugins

This doc explains describes how to add fields plugins to a Gatsby site.

## Example: An Email Field

This example will contain a simple email field. Besides the required `name`, the email field definitions will also accept a `label` and a `description`.

**src/components/EmailField.js**

```javascript
export function EmailField({ input, meta, field }) {
  return (
    <div>
      <label htmFor={input.name}>{field.label || field.name}</label>
      <div>{field.description}</div>
      <input type="email" {...input} />
      <div class="field-error">{meta.error}</div>
    </div>
  )
}
```

In order to add `EmailField` as a plugin to the CMS, open your `gatsby-browser.js` and in the `onClientEntry` add the field to the `cms`.

**gatsby-browser.js**

```javascript
import { cms } from '@forestryio/gatsby-plugin-xeditor'
import { EmailField } from './src/components/EmailField'

export const onClientEntry = () => {
  cms.forms.addFieldPlugin({
    name: 'email',
    Component: EmailField,
  })
}
```

## Further Reading

- [Field Plugins](../concepts/field-plugins.md)
  - [Creating Fields in React](../react/creating-fields.md)
