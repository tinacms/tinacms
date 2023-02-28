import { getStaticPropsForTina } from 'tinacms'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { useTina } from 'tinacms/dist/react'
import { Layout } from '../components/Layout'
export default function Home(props) {
  const { data } = useTina({ ...props })
  const { heading, subtitle, body } = data.page
  return (
    <Layout>
      <h1 data-test="heading">{heading}</h1>
      <div data-test="subtitle">{subtitle}</div>
      <hr />
      <div data-test="rich-text-body">
        <TinaMarkdown
          content={body}
          components={{
            component1: (props) => <div>{JSON.stringify(props)}</div>,
            component2: (props) => <div>{JSON.stringify(props)}</div>,
          }}
        />
      </div>
    </Layout>
  )
}

export const getStaticProps = async () => {
  const tinaProps = await getStaticPropsForTina({
    query: `{
      page(relativePath: "home.mdx"){
        body
        heading
        subtitle
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
