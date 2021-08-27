# react-tinacms-editor

This package provides a WYSIWYM Editor for HTML and Markdown. This editor can be used as a [Field Plugin](https://tinacms.org/docs/plugins/fields) or as an [Inline Field](https://tinacms.org/docs/ui/inline-editing) in websites built with [TinaCMS](https://tinacms.org).

> Note: The `react-tinacms-editor` package is quite large. Whether you're using the [Field Plugin](https://tinacms.org/docs/plugins/fields) or the [Inline Field](#example-dynamic-imports) it is recommended that you use dynamic imports to reduce your JS bundle size.

## Install

```
yarn add react-tinacms-editor
```

## Field Plugins

This package provides two field plugins for TinaCMS: `MarkdownFieldPlugin` and `HtmlFieldPlugin`.

### Registering the Plugins
This is the simplest approach to registering plugins:

```js
import { MarkdownFieldPlugin, HtmlFieldPlugin } from 'react-tinacms-editor'

cms.plugins.add(MarkdownFieldPlugin)
cms.plugins.add(HtmlFieldplugin)
```

The `react-tinacms-editor` is a large package so it is recommended that [load the plugins dynamicallyj](https://tinacms.org/docs/plugins/fields):

```js
import("react-tinacms-editor").then(
  ({ MarkdownFieldPlugin, HtmlFieldPlugin }) => {
    cms.plugins.add(MarkdownFieldPlugin)
    cms.plugins.add(HtmlFieldplugin)
  }
)
```



### Field Plugin Options

```typescript
interface Config {
  component: 'markdown' | 'html'
  name: string
  label?: string
  description?: string
}
```

| Option        | Description                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------------- |
| `component`   | The name of the plugin component. Either `'markdown'` or `'html'`.                                          |
| `name`        | The path to some value in the data being edited.                                                |
| `label`       | A human readable label for the field. Defaults to the `name`. _(Optional)_                      |
| `description` | Description that expands on the purpose of the field or prompts a specific action. _(Optional)_ |

### Example: Using Field Plugins in Forms

Once registered you will be able to use the plugins in your [Forms](https://tinacms.org/docs/forms):

```js
const formConfig = {
  fields: [
    {
      name: "description",
      label: "Description",
      component: "html",
    },
    {
      name: "body",
      label: "Blog Body",
      component: "markdown",
    }
  ]
}
```

These will both show up in your sidebar looking roughly like this:

![tinacms-markdown-field](https://tinacms.org/img/fields/markdown.png)

## Contributing 

For a deeper understanding of the Wysiwyg editor and inner-workings of the `react-tinacms-editor` package, checkout the [contributor documentation](https://github.com/tinacms/tinacms/tree/main/packages/react-tinacms-editor/editor-docs)
