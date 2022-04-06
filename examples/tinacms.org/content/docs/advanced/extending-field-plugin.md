---
title: Extending a field plugin
id: '/docs/advanced/extending-field-plugin'
next: '/docs/advanced/creating-field-component'
---

Sometimes we will want to modify an existing tinacms field plugin, beyond what's available in a given plugin's configurable props. We can do this by extending a field-plugin on the frontend.

## Creating a Custom Field Plugin

Extending a field plugin involves a few steps

- Define a field plugin
- Register the field plugin
- Using the field plugin in your schema.

**FieldPlugin Interface**

```ts
export interface FieldPlugin<ExtraFieldProps = {}, InputProps = {}> {
  __type: 'field'
  name: string
  Component: React.FC<InputFieldType<ExtraFieldProps, InputProps>>
  type?: string
  validate?(
    value: any,
    allValues: any,
    meta: any,
    field: Field
  ): string | object | undefined
  parse?: (value: any, name: string, field: Field) => any
  format?: (value: any, name: string, field: Field) => any
  defaultValue?: any
}
```

The `Component` property can be a built-in component from the "tinacms" package or a custom component. [See here](#built-in-field-components) for a full list of built-in components.

Let's create a new "Email" plugin, that extends the basic behaviour of a text field, but adds some email validation.

```tsx
// ./plugins.tsx
import { TextField } from 'tinacms'

export const emailFieldPlugin = {
  __type: 'field',
  Component: TextField, // Extend the built-in text field
  name: 'text-email',
  validate: (email, allValues, meta, field) => {
    let isValidEmail = /.*@.*\..*/.test(email)
    if (!isValidEmail) return 'Invalid email address'
  },
}
```

> Note: It is considered a good practice to declare your plugins in a separate file, this allows the plugin to be lazy-loaded only when in edit-mode. This way it does not affect your production bundle.

### 2. Register the Field Plugin

The plugin can then be registered in [the CMS callback](/docs/tinacms-context/#tinacms) in the `<TinaCMS>` wrapper component.

```tsx
<TinaCMS
  // ...
  cmsCallback={cms => {
    import('../plugins.tsx').then(({ emailFieldPlugin }) => {
      cms.plugins.add(emailFieldPlugin)
    })
  }}
/>
```

### 3. Use Field in `.tina/schema.ts`

Now in the [schema.ts file](/docs/schema/) this new field plugin can be used for any field. It can be added to the [`ui` property](/docs/schema/#the-ui-property)

```ts
export default defineSchema({
  collections: [
    {
      // ...
      fields: [
        {
          type: 'string',
          label: 'Email',
          name: 'email',
          ui: {
            component: 'text-email' // use our new field plugin instead of the default text plugin
          }
        },
      ]
    }]
```
