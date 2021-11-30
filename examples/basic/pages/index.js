import { staticRequest } from 'tinacms'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { useTina } from 'tinacms/dist/edit-state'
import { Layout } from '../components/Layout'

const query = `{
  getPageDocument(relativePath: "home.mdx"){
    data{
      body
    }
  }
}`

export default function Home(props) {
  const data = useTina({ query, variables: {}, data: props.data })
  const content = data.getPageDocument.data.body
  return (
    <Layout>
      <TinaMarkdown content={content} />
    </Layout>
  )
}

export const getStaticProps = async () => {
  const data = await staticRequest({
    query,
    variables: {},
  })

  return {
    props: {
      data,
    },
  }
}
