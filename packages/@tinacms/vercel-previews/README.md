## Getting started

## Setting up your data for visual editing

There are two ways to indicate that a field is editable.

### Data Attributes

If an element has a `[data-vercel-edit-info]` attribute on it, it will be considered editable. To make it easier to manage, Tina provides a helper function:

#### The `vercelEditInfo` helper

```tsx
// pages/[slug].tsx
import { useTina } from 'tinacms/dist/react'
import { vercelEditInfo } from '@tinacms/vercel-previews/dist/react'

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

### Encoded Strings

If an element’s `textContent` contains an encoded string, it will be considered editable.
This feature is not enabled by default, to enable:

> NOTE: Most likely, you won't want all of your fields to be encoded, the encoding process
> only applies to string values, but it alters them in a way that makes them unusable for
> anything other than rendering. Take note of the `encodeAtPath` callback function, which
> controls whether a value at the given path recieves the encoding info.

#### Add the plugin to the TinaCMS config:

```js
// tina/config.ts
export default defineConfig({
  cmsCallback: (cms) => {
    cms.plugins.add(createSourceMapEncoder(encodeAtPath))

    return cms
  },
})

// Export this so it can be re-used in the next section
export const encodeAtPath = (path, value) => {
  if (path === 'page.blocks.0.headline') {
    console.log(path)
    return true
  }
  return false
}
```

### Use the `withSourceMaps` helper

```js
// pages/[slug].tsx
import { encodeAtPath } from '../tina/config'

export const getStaticProps = async ({ params }) => {
  const tinaProps = await client.queries.contentQuery({
    relativePath: `${params.filename}.md`,
  })
  return {
    props: withSourceMaps(tinaProps, { encodeStrings: true, encodeAtPath }),
  }
}
```

## Listen for clicks on a visual element

When a user clicks to edit a visual element, Tina will redirect to the same URL
within an iframe, and will select the appropriate form and field for editing. After
the first redirect, subsequent clicks will no longer redirect, but will activate
the selected field.

To set this up, register the hook, provide the redirect URL you set up
in your `tina/config.ts` file:

```jsx
// pages/[slug].tsx
import { useEditOpen } from '@tinacms/vercel-previews/dist/react'

export default function Page(props) {
  const { data } = useTina(props)
  useEditOpen('/admin')

  return <MyPage {...data} />
}
```
