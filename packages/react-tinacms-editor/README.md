# react-tinacms-editor

This package provides a WYSIWYM Editor for HTML and Markdown. This editor can be used as a [Field Plugin](https://tinacms.org/docs/plugins/fields) or as an [Inline Field](https://tinacms.org/docs/ui/inline-editing) in websites built with [TinaCMS](https://tinacms.org).

> Note: The `react-tinacms-editor` package is quite large. Whether you're using the [Field Plugin](https://tinacms.org/docs/plugins/fields) or the [Inline Field](#example-dynamic-imports) it is recommended that you use dynamic imports to reduce your JS bundle size.

## InlineWysiwyg

The `InlineWysiwyg` is a React [inline editing component](https://tinacms.org/docs/ui/inline-editing) for Markdown and HTML.


### Options

| Key           | Description                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------- |
| `name`        | The path to some value in the data being edited.                                             |
| `children`    | Child components to render.                                                                  |
| `sticky?`     | A boolean determining whether the Wysiwyg Toolbar 'sticks' to the top of the page on scroll. |
| `format?`     | This value denotes whether Markdown or HTML will be rendered.                                |
| `imageProps?` | Configures how images in the Wysiwyg are uploaded and rendered.                              |

### Interface

```typescript
interface InlineWysiwygConfig {
  name: string
  children: any
  sticky?: boolean
  format?: 'markdown' | 'html'
  imageProps?: WysiwysImageProps
}

interface WysiwygImageProps {
  upload?: (files: File[]) => Promise<string[]>
  previewUrl?: (url: string) => string
}
```

### Example: Basic Usage

Below is an example of how an `InlineWysiwyg` field could be defined in an [Inline Form](/docs/ui/inline-editing).

```jsx
import ReactMarkdown from 'react-markdown'
import { useForm, usePlugin } from 'tinacms'
import { InlineForm } from 'react-tinacms-inline'
import { InlineWysiwyg } from 'react-tinacms-editor'

// Example 'Page' Component
export function Page(props) {
  const [data, form] = useForm(props.data)
  usePlugin(form)
  return (
    <InlineForm form={form}>
      <InlineWysiwyg name="markdownBody" format="markdown">
        <ReactMarkdown source={data.markdownBody} />
      </InlineWysiwyg>
    </InlineForm>
  )
}
```

### Example: Dynamic Imports

The `react-tinacms-editor` is a large package so it is recommended that you make sure it's only being loaded when necessary.

**my-app/src/components/InlineWysiwyg.js**
```js
import React from 'react'
import { useCMS } from 'tinacms'

export function InlineWysiwyg(props) {
  const cms = useCMS()
  const [{ InlineWysiwyg }, setEditor] = React.useState({})

  React.useEffect(() => {
    if (!InlineWysiwyg && cms.enabled) {
      import('react-tinacms-editor').then(setEditor)
    }
  }, [cms.enabled])

  if (InlineWysiwyg) {
    return (
      <InlineWysiwyg {...props}/>
    )
  }

  return props.children
}
```

> #### Why do I have to load the editor dynamically myself?
> Code splitting and dynamic imports are handled by the website's JavaScript bundlers (e.g. rollup, webpack, etc.). Since the package does not load itself into the application, it is unfortunately not possible to provide this behaviour in the package itself.