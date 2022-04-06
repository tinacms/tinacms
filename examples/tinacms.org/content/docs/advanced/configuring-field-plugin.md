---
title: Configuring a field
id: '/docs/advanced/configuring-field-plugin'
next: '/docs/advanced/extending-field-plugin'
---

When we add a field to our Tina schema, this field will be editable through a field plugin in the sidebar. The type of field plugin will change depending on properties like `type`, `isBody`, `list`, `options`, etc.

For example:

```ts
// .tina/schema.ts
import { defineSchema } from '@tinacms/cli'

export default defineSchema({
  collections: [
    {
      label: 'Blog Posts',
      name: 'post',
      path: 'content/posts',
      fields: [
        {
          type: 'string', // The default field plugin will be a "textfield" field plugin
          label: 'Title',
          name: 'title',
        },
        {
          type: 'string', // The default field plugin will be a "textfield" field plugin
          label: 'Description',
          name: 'desription',
        },
        // ...
      ],
    },
  ],
})
```

If you want to override the field plugin used for a field, you can use the `ui` property.

```ts
// ...
        {
          type: 'string',
          label: 'Description',
          name: 'desription',
          ui: {
            component: "textarea" // Use a textarea instead of a textfield
          }
        },
// ...
```

The component property can be any registered field. Below is a list of default fields.

## Default Field Plugins

- [text](/docs/reference/toolkit/fields/text/)
- [textarea](/docs/reference/toolkit/fields/textarea/)
- [number](/docs/reference/toolkit/fields/number/)
- [image](/docs/reference/toolkit/fields/image/)
- [color](/docs/reference/toolkit/fields/color/)
- [toggle](/docs/reference/toolkit/fields/toggle/)
- [radio-group](/docs/reference/toolkit/fields/radio-group/)
- [select](/docs/reference/toolkit/fields/select/)
- [tags](/docs/reference/toolkit/fields/tags/)
- [list](/docs/reference/toolkit/fields/list/)
- [group](/docs/reference/toolkit/fields/group/)
- [group-list](/docs/reference/toolkit/fields/group-list/)
- [blocks](/docs/reference/toolkit/fields/blocks/)
- [date](/docs/reference/toolkit/fields/date/)

Tina also supports some extra field plugins, that need to be imported and registered from separate packages:

- [markdown](/docs/reference/toolkit/fields/markdown/)
- [html](/docs/reference/toolkit/fields/html/)

## Configuring a field plugin

Each of these fields has a unique set of properties that can be configured within the `.tina/schema.ts` file.

If you take a look at the color field plugin's definition, it takes a `colorFormat` property. We can configure that in our `.tina/schema.ts` like so:

```ts
// ...
        {
          type: 'string',
          label: 'Background Color',
          name: 'color',
          ui: {
            component: "color",
            colorFormat: "rgb"
          }
        },
// ...
```

Any field-plugin properties other than the [base schema-field properties](/docs/schema/) (e.g, `type`,`label`,`name` ,etc) are set under `ui`.
