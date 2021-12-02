import { getStaticPropsForTina } from 'tinacms'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { Layout } from '../components/Layout'
export default function Home(props) {
  const content = props.data.getPageDocument.data.body
  return (
    <Layout>
      <TinaMarkdown
        content={content}
        components={{
          component1: (props) => <div>{JSON.stringify(props)}</div>,
          component2: (props) => <div>{JSON.stringify(props)}</div>,
        }}
      />
    </Layout>
  )
}

export const getStaticProps = async () => {
  const tinaProps = await getStaticPropsForTina({
    query: `{
    getPageDocument(relativePath: "home.mdx"){
      data{
        body
      }
    }
  }`,
    variables: {},
  })

  return {
    props: {
      ...tinaProps,
    },
  }
}
