import Head from 'next/head'
import { getStaticPropsForTina } from 'tinacms'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
export default function Home(props) {
  const content = props.data.getPageDocument.data.body
  return (
    <div>
      <Head>
        <title>Tina App</title>
        <meta name="description" content="A TinaCMS Application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <TinaMarkdown content={content} />
      </main>
    </div>
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
