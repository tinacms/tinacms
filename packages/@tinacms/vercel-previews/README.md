## Getting started

## Setting up your data for visual editing

There are two ways to indicate that a field is editable.

### String encoding

```tsx
// pages/[slug].tsx
import { useTina } from 'tinacms/dist/react'
import { useVisualEditing } from '@tinacms/vercel-previews'

export const Post = (props) => {
  const { data: tinaData } = useTina(props)
  const data = useVisualEditing({
    data: tinaData,
    // metadata is derived from the query and variables
    query: props.query,
    variables: props.variables,
    // When clicking on an editable element for the first time, redirect to the TinaCMS app
    redirect: '/admin',
    // Only enable visual editing on preview deploys
    enabled: props.visualEditingEnabled
    // stringEncoding automatically adds metadata to strings
    stringEncoding: true,
    // Alternatively, you can skip some strings from being encoded
    stringEncoding: {
      skipPaths: (path) => {
        if ('page.blocks.0.image' === path) {
          return true
        }

        return false
      }
    }
  })

  return (
    <div>
      <h1>
        {data.title}
      </h1>
    </div>
  )
}
```

### Data Attributes

String encoding can break things like links or images. If you decide to turn string encoding off you can still enable
visual editing with the `[data-vercel-edit-info]` attribute.

If an element has a `[data-vercel-edit-info]` attribute on it, it will be considered editable.
This is obviously more work than the string encoding, but to make it easier to manage, Tina provides a helper function:

#### The `vercelEditInfo` helper

```tsx
// pages/[slug].tsx
import { useTina } from 'tinacms/dist/react'
import { vercelEditInfo, useVisualEditing } from '@tinacms/vercel-previews'

export const Post = (props) => {
  const { data: tinaData } = useTina(props)
  const data = useVisualEditing({
    data: tinaData,
    // metadata is derived from the query and variables
    query: props.query,
    variables: props.variables,
    // When clicking on an editable element for the first time, redirect to the TinaCMS app
    redirect: '/admin',
    // Only enable visual editing on preview deploys
    enabled: props.visualEditingEnabled
    // stringEncoding automatically adds metadata to strings
    stringEncoding: false
  })

  return (
    <div>
      <h1 data-vercel-edit-info={vercelEditInfo(data, 'title')}>
        {data.title}
      </h1>
    </div>
  )
}
```

For deeper objects, the API is the same, notice in this example we can also mark the
`div` wrapping the "actions" in a selectable field

```jsx
export const NewsletterBlock = (props) => {
  return (
    <div>
      <p data-vercel-edit-info={vercelEditInfo(props, 'message')}>
        {props.message}
      </p>
      <div data-vercel-edit-info={vercelEditInfo(props, 'actions')}>
        {props.actions.map((action) => {
          return (
            <button
              // notice here that the first value is the action object
              data-vercel-edit-info={vercelEditInfo(action, 'message')}
              {...action}
            />
          )
        })}
      </div>
    </div>
  )
}
```
