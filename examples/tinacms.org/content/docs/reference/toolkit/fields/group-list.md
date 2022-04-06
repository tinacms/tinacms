---
title: Group-List Field
prev: /docs/reference/toolkit/fields/group
next: /docs/reference/toolkit/fields/blocks
consumes:
  - file: /packages/tinacms/src/plugins/fields/GroupListFieldPlugin.tsx
    details: Shows group list interface
---

{{ WarningCallout text="This is an advanced-use feature, and likely not something you'll need to configure. What you probably want is the [content types reference](/docs/reference/types/)" }}

The **Group List** field represents a list of [group fields](/docs/reference/toolkit/fields/group). This field exports an _array of objects_.

Use this field when you want to support _multiple entities_ that all have the same shape. Each entity will appear in a list where you can add and delete them. You can then click into an entity to edit its individual fields according to the Group List's field definition.

![tinacms-group-list-gif](/gif/group-list.gif)

## Options

```typescript
import { Field } from '@tinacms/core'

interface GroupListConfig {
  component: 'group-list'
  name: string
  fields: Field[]
  label?: string
  defaultItem?: object | (() => object)
  itemProps?(
    item: object
  ): {
    key?: string
    label?: string
  }
}
```

| Option        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `component`   | The name of the plugin component. Always `'group-list'`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `name`        | The path to some value in the data being edited.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `fields`      | An array of [`fields`](/docs/reference/toolkit/fields) that will render as a sub-menu for each group item. The fields should map to editable content.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `label`       | A human readable label for the field. Defaults to the `name`. _(Optional)_                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `description` | Description that expands on the purpose of the field or prompts a specific action. _(Optional)_                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `defaultItem` | A function to provide the `group-list` item with default data upon being created. _(Optional)_                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `itemProps`   | A function that generates `props` for each group item. It takes the item as an argument. _(Optional)_ <br> It returns an object containing, <ul> <li>`key`: This property is used to optimize the rendering of lists. If rendering is causing problems, use `defaultItem` to generate a new key, as is seen in [this example](http://tinacms.org/docs/reference/toolkit/fields/group-list#definition). Feel free to reference the [React documentation](https://reactjs.org/docs/lists-and-keys.html) for more on keys and lists. </li> <li> `label`: A readable label for the new `group-list` item. </li> </ul> |

> This interfaces only shows the keys unique to the group-list field.
>
> Visit the [Field Config](/docs/reference/toolkit/fields) docs for a complete list of options.

## Definition

Below is an example of how a `group-list` field could be defined in a JSON form.

For example, if we had a list of authors in a JSON file:

```json
{
  "author": [
    {
      "name": "Alice Walker",
      "id": "alice-walker",
      "best-novel": "The Color Purple"
    },
    {
      "name": "Margaret Atwood",
      "id": "margaret-atwood",
      "best-novel": "Oyrx and Crake"
    },
    {
      "name": "Isabel Allende",
      "id": "isabel-allende",
      "best-novel": "Daughter of Fortune"
    }
  ]
}
```

Our `group-list` field config would look like this:

```javascript
const formOptions = {
  fields: [
    {
      label: 'Authors List',
      name: 'rawJson.authors',
      component: 'group-list',
      description: 'Authors List',
      itemProps: item => ({
        key: item.id,
        label: item.name,
      }),
      defaultItem: () => ({
        name: 'New Author',
        id: Math.random()
          .toString(36)
          .substr(2, 9),
      }),
      fields: [
        {
          label: 'Name',
          name: 'name',
          component: 'text',
        },
        {
          label: 'Best Novel',
          name: 'best-novel',
          component: 'text',
        },
      ],
    },
    //...
  ],
}
```
