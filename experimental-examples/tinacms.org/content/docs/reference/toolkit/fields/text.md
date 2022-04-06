---
title: Text Field
next: /docs/reference/toolkit/fields/textarea
consumes:
  - file: /packages/@tinacms/fields/src/plugins/TextFieldPlugin.tsx
    details: Shows text field interface and config options
  - file: /packages/@tinacms/fields/src/components/TextField.ts
    details: Shows text field interface and config options
---

{{ WarningCallout text="This is an advanced-use feature, and likely not something you'll need to configure. What you probably want is the [content types reference](/docs/reference/types/)" }}

The `text` field represents a single line text input. It should be used for content values that are short strings: for example, a page title.

![tinacms-text-field](/img/fields/text.png)

## Options

```typescript
interface TextConfig extends FieldConfig {
  component: 'text'
  name: string
  label?: string
  description?: string
  placeholder?: string
}
```

| Option        | Description                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------------- |
| `component`   | The name of the plugin component. Always `'text'`.                                              |
| `name`        | The path to some value in the data being edited.                                                |
| `label`       | A human readable label for the field. Defaults to the `name`. _(Optional)_                      |
| `description` | Description that expands on the purpose of the field or prompts a specific action. _(Optional)_ |
| `placeholder` | Placeholder text to appear in the input when it empty. _(Optional)_                             |

> This interfaces only shows the keys unique to the text field.
>
> Visit the [Field Config](/docs/reference/toolkit/fields) docs for a complete list of options.

## Example: Blog Post Title

Below is an example of how a `text` field could be used to edit the title of a blog post.

```javascript
const BlogPostForm = {
  fields: [
    {
      component: 'text',
      name: 'title',
      label: 'Title',
      description: 'Enter the title of the post here',
      placeholder: '...',
    },
  ],
}
```
