---
title: Text Area Field
prev: /docs/reference/toolkit/fields/text
next: /docs/reference/toolkit/fields/number
consumes:
  - file: /packages/@tinacms/fields/src/plugins/TextareaFieldPlugin.tsx
    details: Shows textarea field interface and config options
  - file: /packages/@tinacms/fields/src/components/TextArea.ts
    details: Shows textarea field interface and config options
---

{{ WarningCallout text="This is an advanced-use feature, and likely not something you'll need to configure. What you probably want is the [content types reference](/docs/reference/types/)" }}

The `textarea` field represents a multi-line text input. It should be used for content values that are long strings: for example, a page description.

![tinacms-textarea-field](/img/fields/textarea.png)

## Options

```typescript
interface TextareaConfig {
  name: string
  component: 'textarea'
  label?: string
  description?: string
}
```

| Option        | Description                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------------- |
| `component`   | The name of the plugin component. Always 'textarea'.                                            |
| `name`        | The path to some value in the data being edited.                                                |
| `label`       | A human readable label for the field. Defaults to the name. _(Optional)_                        |
| `description` | Description that expands on the purpose of the field or prompts a specific action. _(Optional)_ |

> This interfaces only shows the keys unique to the textarea field.
>
> Visit the [Field Config](/docs/reference/toolkit/fields) docs for a complete list of options.

## Example: A Blog Post Description

Below is an example of how a `textarea` field could be used to edit the description of a blog post.

```javascript
const BlogPostForm = {
  fields: [
    {
      name: 'description',
      component: 'textarea',
      label: 'Description',
      description: 'Enter the post description here',
    },
  ],
}
```
