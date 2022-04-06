---
title: Blocks Field
prev: /docs/reference/toolkit/fields/group-list
next: /docs/reference/toolkit/fields/date
consumes:
  - file: /packages/tinacms/src/plugins/fields/BlocksFieldPlugin.tsx
    details: Shows blocks interface
---

{{ WarningCallout text="This is an advanced-use feature, and likely not something you'll need to configure. What you probably want is the [content types reference](/docs/reference/types/)" }}

The **Blocks** field represents a list of items, similar to the [Group List](/docs/reference/toolkit/fields/group-list) field, but allows each entity in the list to have a unique shape.

> For an in-depth explanation of the Blocks field, read our ["What are Blocks?"](/blog/what-are-blocks/) blog post. To see a real-world example of Blocks in use, check out the [Tina Grande Starter](https://github.com/tinacms/tina-starter-grande).

![tinacms-blocks-gif](/gif/blocks.gif)

In the gif above, you see a list of Blocks: **Title**, **Image**, and **Content**. The form for this field could be configured like this:

```jsx
const PageForm = {
  label: 'Page',
  fields: [
    {
      label: 'Page Sections',
      name: 'rawJson.blocks',
      component: 'blocks',
      templates: {
        'title-block': TitleBlock,
        'image-block': ImageBlock,
        'content-block': ContentBlock,
      },
    },
  ],
}
```

```jsx
/*
 **  Block template definition for the content block
 **/
export const ContentBlock = {
  label: 'Content',
  key: 'content-block',
  defaultItem: {
    content: '',
  },
  fields: [{ name: 'content', label: 'Content', component: 'markdown' }],
}
```

The source data for the `ContentBlock` might look like the example below. When new blocks are added, additional JSON objects will be added to the `blocks` array:

```json
{
  "blocks": [
    {
      "content": "**Billions upon billions** are creatures of the cosmos Orion's sword cosmic fugue at the edge of forever science?",
      "_template": "content-block"
    }
  ]
}
```

## Blocks Field Options

```typescript
import { Field } from '@tinacms/core'

interface BlocksConfig {
  name: string
  component: 'blocks'
  label?: string
  description?: string
  templates: {
    [key: string]: BlockTemplate
  }
}
```

| Option        | Description                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------------- |
| `component`   | The name of the plugin component. Always `'blocks'`.                                            |
| `name`        | The path to some value in the data being edited.                                                |
| `label`       | A human readable label for the field. Defaults to the `name`. _(Optional)_                      |
| `description` | Description that expands on the purpose of the field or prompts a specific action. _(Optional)_ |
| `templates`   | A list of **Block templates** that define the fields used in the Blocks.                        |

## Block Template Options

```typescript
interface BlockTemplate {
  label: string
  key: string
  fields: Field[]
  defaultItem?: object | (() => object)
  itemProps?: (
    item: object
  ) => {
    key?: string
    label?: string
  }
}
```

| Option        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`       | A human readable label for the Block.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `key`         | Should be unique to optimize the [rendering of the list](https://reactjs.org/docs/lists-and-keys.html).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `fields`      | An array of [`fields`](/docs/reference/toolkit/fields) that will render as a sub-menu for each group item. The fields should map to editable content.                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `defaultItem` | A function to provide the block with default data upon being created. _(Optional)_                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `itemProps`   | A function that generates `props` for each group item. It takes the item as an argument. _(Optional)_ <br> It returns an object containing, <ul> <li>`key`: This property is used to optimize the rendering of lists. If rendering is causing problems, use `defaultItem` to generate a new key, as is seen in [this example](http://tinacms.org/docs/reference/toolkit/fields/group-list#definition). Feel free to reference the [React documentation](https://reactjs.org/docs/lists-and-keys.html) for more on keys and lists. </li> <li> `label`: A readable label for the new Block. </li> </ul> |

> This interfaces only shows the keys unique to the blocks field.
>
> Visit the [Field Config](/docs/reference/toolkit/fields) docs for a complete list of options.
