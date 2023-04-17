

```ts
import client from '../../tina/__generated__/client'
import { useTina } from 'tinacms/dist/react'
import { editField, useEditEvent, expandQueryWithMetadata } from '@tinacms/preview-helpers'

const MyBlogComponent = props => {
  return (<div>
    <h1>{props.title}</h1>
    <img  data-vercel-edit-info={editField(props, 'image')} src={props.image} />
  </div>)
}

export const Page = props => {
  const { data } = useTina(props)
  useEditEvent("/admin")

  return <MyBlogComponent {...data} />
}

export const getStaticProps = async ({ params }) => {
  const variables = { relativePath: `${params.filename}.md` }
  let props = await client.queries.documentation(variables)

  if (process.env.VERCEL_ENV === 'preview') {
    props = await expandQueryWithMetadata(props, client)
  }
  return {
    props: { ...props, variables },
  }
}
```
