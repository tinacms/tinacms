# Custom Field Plugins in Gatsby

This doc explains how to add custom field plugins to a Gatsby site.

## Registering an Email Field

In this example we'll create a simple email field for our Gatsby site. Besides the required `name`, we also want the email field definition to accept a `label` and a `description`.

First create the React component that accepts three props:

- `input`: The data and callbacks necessary to make an input.
- `meta`: Metadata about the field in the form. (e.g. `dirty`, `valid`)
- `field`: The [field definition](../concepts/forms.md#field-definitions) for the current field.

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

Open your `gatsby-browser.js` and create an `onClientEntry`. In this function, we'll use the `cms.forms.addFieldPlugin` method to register the `EmailField`.

**gatsby-browser.js**

```javascript
import { cms } from '@tinacms/gatsby-plugin-tinacms'
import { EmailField } from './src/components/EmailField'

export const onClientEntry = () => {
  cms.forms.addFieldPlugin({
    name: 'email',
    Component: EmailField,
  })
}
```

Your field plugin can now be used in your forms!

```javascript
useRemarkForm(remark, {
  fields: [
    // ...
    {
      name: 'frontmatter.author.email',
      component: 'email',
      label: 'Email',
      description: 'The email address of the author',
    },
  ],
})
```

## Validating the Email Field

An optional `validate` function can also be added to your Field Plugin.

**Arguments**

- `value`: The field's current value
- `allValues`: The current state of the entire form
- `meta`: The form metadata for this field
- `field`: The field's configuration

**Return: string | null | undefined**

If the value is invalid, then return the error message to be displayed.

**gatsby-browser.js**

```javascript
import { cms } from '@tinacms/gatsby-plugin-tinacms'
import { EmailField } from './src/components/EmailField'

export const onClientEntry = () => {
  cms.forms.addFieldPlugin({
    name: 'email',
    Component: EmailField,
    validate(value, allValues, meta, field) {
      let isValidEmail = /.*@.*\..*/.test(email)

      if (!isValidEmail) return 'Invalid email address'
    },
  })
}
```

## Further Reading

- [Field Plugins](../concepts/field-plugins.md)
  - [Creating Fields in React](../react/creating-fields.md)
