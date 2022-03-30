import Head from 'next/head'
import { Chain, Zeus } from '../../zeus'
import { News } from '../../components/news'
import { Nav, navQuery } from '../../components/nav'
import { Footer, footerQuery } from '../../components/footer'
import { request } from '../../components/blocks'
import { localeQuery } from '../../components/locale-info'

type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (
  ...args: any
) => Promise<infer R>
  ? R
  : any
type HomeProps = AsyncReturnType<typeof getStaticProps>['props']

export default function Home(props: HomeProps) {
  if (!props.data.getNewsDocument) {
    return null
  }
  return (
    <>
      <Head>
        <title>{props.data.getNewsDocument.data.title}</title>
        <meta
          property="og:title"
          content={props.data.getNewsDocument.data.title}
        />
        <meta name="description" property="og:description" content={''} />
        <meta
          property="og:image"
          content={props.data.getNewsDocument.data.image}
        />
      </Head>

      <main>
        {props.data.getNavigationDocument.data && (
          <Nav {...props.data.getNavigationDocument.data} />
        )}
        <News {...props.data.getNewsDocument.data} />
        {props.data.getFooterDocument.data && (
          <Footer {...props.data.getFooterDocument.data} />
        )}
      </main>
    </>
  )
}

export const getStaticProps = async ({
  params,
}: {
  params: { filename: string }
}) => {
  const { filename } = params
  const props = await request().query({
    getLocaleInfoDocument: [
      {
        relativePath: 'main.md',
      },
      localeQuery,
    ],
    getNavigationDocument: [{ relativePath: 'main.md' }, navQuery],
    getFooterDocument: [{ relativePath: 'main.md' }, footerQuery],
    getThemeDocument: [
      { relativePath: 'main.json' },
      {
        dataJSON: true,
      },
    ],
    getNewsDocument: [
      { relativePath: `${filename}.md` },
      {
        data: {
          title: true,
          image: true,
          subTitle: true,
          body: true,
        },
      },
    ],
  })
  return {
    props,
  }
}

export const getStaticPaths = async () => {
  const chain = Chain('http://localhost:4001/graphql', {})
  const paths = await chain('query')({
    getNewsList: [
      {},
      {
        edges: {
          node: {
            sys: {
              filename: true,
            },
          },
        },
      },
    ],
  })
  const paths2 = paths.getNewsList.edges.map((edge) => {
    return { params: { filename: edge.node.sys.filename } }
  })
  const paths3 = []
  ;['en-us', 'en-gb', 'en-au'].forEach((locale) => {
    paths2.forEach((p2) => {
      paths3.push({ ...p2, locale })
    })
  })
  return {
    paths: paths3,
    fallback: 'blocking',
  }
}
