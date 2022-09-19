import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { Layout } from '../components/Layout'
import { useTina } from 'tinacms/dist/edit-state'
import { client } from '../.tina/__generated__/client'

const query = `{
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
  const { data } = await client.request({ query, variables })

  return {
    props: {
      query,
      variables,
      data,
      //myOtherProp: 'some-other-data',
    },
  }
}
