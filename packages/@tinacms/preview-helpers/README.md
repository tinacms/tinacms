The purpose of this package is to add metadata to Tina's query result which helps to make your live site easily editable.

## Installation

Note this is not on the `main` version of Tina yet. To install:

```
yarn add @tinacms/cli@remove-form-nesting tinacms@remove-form-nesting @tinacms/preview-helpers@remove-form-nesting
```

## Usage

You'll need to add a few things to your Tina-enabled page. `expandWithMetadata`, `useEditOpen`, and optionally, the `previewField` helper.

```ts
import client from '../../tina/__generated__/client'
import { useTina } from 'tinacms/dist/react'
import { expandWithMetadata } from '@tinacms/preview-helpers'
import { previewField, useEditOpen} from '@tinacms/preview-helpers/dist/react'

const MyBlogComponent = props => {
  return (<div>
    <h1>{props.title}</h1>
    <img data-vercel-edit-info={previewField(props, 'image')} src={props.image} />
  </div>)
}

export const Page = props => {
  const { data } = useTina(props)
  // The path to your TinaCMS build
  useEditOpen("/admin")

  return <MyBlogComponent {...data} />
}

export const getStaticProps = async ({ params }) => {
  const variables = { relativePath: `${params.filename}.md` }
  let props = await client.queries.documentation(variables)

  if (process.env.VERCEL_ENV === 'preview') {
    props = await expandWithMetadata(props, client)
  }
  return {
    props: { ...props, variables },
  }
}
```

### `expandWithMetadata`

This is a utility function which will take your original query and expand it so that Tina has enough information
to generate helpful metadata. It assumes the same shape as you'll need to use when working with [contextual editing](https://tina.io/docs/contextual-editing/react/)
on any Tina-enabled site.
The metadata will be used to help identify a particular piece of data with the
appropriate form and field. _It should only be used from a server-side data loading function_.

### `useEditOpen`

This hook will listen for `edit:open` events called in the browser. When one is received, the provided argument will
be used as the redirect location for Tina, it should be set to the relative location of your Tina CMS build output (eg. `/admin`)

### `previewField`

This is a helper function which, when used with a query containing metadata, can be used to populate the DOM node with
information used by the `useEditOpen` hook.

---

In your Tina config, add the preview helper plugin to the CMS:

### `createPreviewHelper`

This is a TinaCMS plugin that keeps encoded metadata up-to-date when Tina changes
data from form inputs. You can register this in the `cmsCallback` property of your
Tina config:

```ts
const config = defineConfig({
  cmsCallback: (cms) => {
    cms.plugins.add(createPreviewHelper());

    return cms;
  },
  ... // rest of config
})
```

## Opting out of string encoding

`expandWithMetadata` includes a 3rd optional parameter to allow you to opt-out of string encoded metadata.
If you do this, you'll also want to avoid creating the CMS helper plugin in the Tina config.
