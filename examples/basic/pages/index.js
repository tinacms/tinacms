import { staticRequest } from 'tinacms'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { Layout } from '../components/Layout'
export default function Home(props) {
  const content = props.data.getPageDocument.data.body
  return (
    <Layout>
      <TinaMarkdown content={content} />
    </Layout>
  )
}

export const getStaticProps = async () => {
  const query = `{
    getPageDocument(relativePath: "home.mdx"){
      data{
        body
      }
    }
  }`
  const variables = {}
  let data = {}
  try {
    data = await staticRequest({
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
      data,
      //myOtherProp: 'some-other-data',
    },
  }
}
