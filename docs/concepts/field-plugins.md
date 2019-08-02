# Field Plugins

A field plugin defines a component that can be used to edit a field.

The field plugin is a javascript object with two properties:

- `name`: A string used to identify the component. This is the name that is set in a [Field Definition](./forms.md#field-definitions). This name must be unique; if multiple plugins are registered with the same name, only the last will be used.
- `Component`: The component that will used in the form.

## Registering Field Plugins

```javascript
import { MapPicker } from 'cms-field-my-map-picker'

let cms = new CMS()

cms.fields.register({
  name: 'map',
  Component: MapPicker,
})
```

##

## Resources

- [Creating Fields in React](../react/creating-fields.md)
- [Registering Fields in Gatsby](../gatsby/custom-field-plugins.md)
