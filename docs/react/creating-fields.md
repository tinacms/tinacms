# Creating Fields in React

This is a guide to creating [Field Plugin](../concepts/field-plugins.md) Components in React.

## Component

The `Component` is React component that accepts three props:

- `field`: The [field definition](../concepts/forms.md#field-definitions) for the current field.
- `input`: The data and callbacks necessary to make an input.
- `meta`: Metadata about the field in the form. (e.g. `dirty`, `valid`)

Checkout the [`react-final-form`](https://github.com/final-form/react-final-form#fieldrenderprops) docs for a more detailed description of the `input` and `meta` props.

## Validate (optional)

The optional `validate` function let's you define how you 're

**Arguments**

- `value`: The field's current value
- `allValues`: The current state of the entire form
- `meta`: The form metadata for this field
- `field`: The field's configuration

## Example

Here is an example of a simple text field plugin. The `Component` renders the label, the input, and the errors for the field.

```javascript
import { CMS } from '@tinacms/core'

let cms = new CMS()

cms.forms.addFieldPlugin({
  name: 'text',
  Component({ input, meta, field }) {
    return (
      <div>
        <label htmFor={input.name}>{field.label || field.name}</label>
        <div>{field.description}</div>
        <input type="email" {...input} />
        <div class="field-error">{meta.error}</div>
      </div>
    )
  },
  validate(email, allValues, meta, field) {
    let isValidEmail = /.*@.*\..*/.test(email)

    if (!isValidEmail) return 'Invalid email address'
  },
})
```

## Further Reading

- [Field Plugin](../concepts/field-plugins.md)
- [Registering Fields in Gatsby](../gatsby/custom-field-plugins.md)
