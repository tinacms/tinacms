import { staticRequest } from 'tinacms'
import client from '../tina/__generated__/client'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { Layout } from '../components/Layout'
import { useTina } from 'tinacms/dist/react'

const query = `query PageQuery {
  page(relativePath: "home.mdx"){
    body
  }
}`
export default function Home(props) {
  const { data } = useTina({
    query,
    variables: {},
    data: props.data,
  })

  const content = data.page.body
  return (
    <Layout>
      <TinaMarkdown content={content} />
    </Layout>
  )
}

export const getStaticProps = async () => {
  const variables = {}
  let data = {}
  try {
    data = await client.request({
      query,
      variables,
    })
  } catch {
    // swallow errors related to document creation
  }

  return {
    props: {
      query,
      variables,
      data: data.data,
      //myOtherProp: 'some-other-data',
    },
  }
}
