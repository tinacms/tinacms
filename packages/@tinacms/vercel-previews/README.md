## Getting started

## Setting up your data for visual editing

There are two ways to indicate that field is editable.

### Data Attributes

If an element has a `[data-vercel-edit-info]` attribute on it, it will be considered editable. In this scenario, the attribute should be set to the stringified JSON of the schema for the field.

#### The `vercelEditInfo` helper

When using the `withMetadata` helper, Tina populates the result's data with embedded
metadata. This metadata is opaque and isn't something you should worry about knowing.
To added it to the `[data-vercel-edit-info]` attribute, use the `vercelEditInfo`
utility function:

```tsx
// pages/[slug].tsx
import { useTina } from 'tinacms/dist/react'
import { vercelEditInfo } from '@tinacms/vercel-previews/dist/react'

export const Post = (props) => {
  const { data } = useTina(props)

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
              data-vercel-edit-info={vercelEditInfo(props, 'message')}
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
