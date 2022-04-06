---
title: Tags Field
prev: /docs/reference/toolkit/fields/select
next: /docs/reference/toolkit/fields/group
consumes:
  - file: /packages/@tinacms/fields/src/plugins/TagsFieldPlugin.tsx
    details: Shows Tags field and Option interfaces
---

{{ WarningCallout text="This is an advanced-use feature, and likely not something you'll need to configure. What you probably want is the [content types reference](/docs/reference/types/)" }}

The `tags` field represents a collection of tags.

![TinaCMS-tags-field](/img/fields/tags-field.png)

## Options

```typescript
interface TagsField {
  component: 'tags'
  name: string
  label?: string
  description?: string
}
```

| Option        | Description                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------------- |
| `component`   | The name of the plugin component. Always `'tags'`.                                              |
| `name`        | The path to some value in the data being edited.                                                |
| `label`       | A human readable label for the field. Defaults to the `name`. _(Optional)_                      |
| `description` | Description that expands on the purpose of the field or prompts a specific action. _(Optional)_ |

> This interfaces only shows the keys unique to the tags field.
>
> Visit the [Field Config](/docs/reference/toolkit/fields) docs for a complete list of options.

## Definition

Below is an example of how a `tags` field could be defined in a form.

```javascript
const FormConfig = {
  fields: [
    {
      name: 'frontmatter.tags',
      component: 'tags',
      label: 'Tags',
      description: 'Tags for this post',
    },
    // ...
  ],
}
```
