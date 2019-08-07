# Field Plugins

A field plugin defines a component that can be used to edit a field.

The field plugin is a javascript object with two properties:

- `name`: A string used to identify the component. This is the name that is set in a [Field Definition](./forms.md#field-definitions). This name must be unique; if multiple plugins are registered with the same name, only the last will be used.
- `Component`: The component that will used in the form. The exact nature of this component depends on which form builder is being used.
- `validate`: A optional function that will be used to validate the field's data.

## Registering Field Plugins

```javascript
import { MapPicker, validateMap } from 'cms-field-my-map-picker'

let cms = new CMS()

cms.forms.addFieldPlugin({
  name: 'map',
  Component: MapPicker,
  validate: validateMap,
})
```

## Resources

- [Creating Fields in React](../react/creating-fields.md)
  - [Registering Fields in Gatsby](../gatsby/custom-field-plugins.md)
