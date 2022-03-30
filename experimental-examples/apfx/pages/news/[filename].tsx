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
  if (!props.data.news) {
    return null
  }
  return (
    <>
      <Head>
        <title>{props.data.news.title}</title>
        <meta property="og:title" content={props.data.news.title} />
        <meta name="description" property="og:description" content={''} />
        <meta property="og:image" content={props.data.news.image} />
      </Head>

      <main>
        {props.data.navigation && <Nav {...props.data.navigation} />}
        <News {...props.data.news} />
        {props.data.footer && <Footer {...props.data.footer} />}
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
    localeInfo: [
      {
        relativePath: 'main.md',
      },
      localeQuery,
    ],
    navigation: [{ relativePath: 'main.md' }, navQuery],
    footer: [{ relativePath: 'main.md' }, footerQuery],
    theme: [
      { relativePath: 'main.json' },
      {
        _values: true,
      },
    ],
    news: [
      { relativePath: `${filename}.md` },
      {
        title: true,
        image: true,
        subTitle: true,
        body: true,
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
    newsConnection: [
      {},
      {
        edges: {
          node: {
            _sys: {
              filename: true,
            },
          },
        },
      },
    ],
  })
  const paths2 = paths.newsConnection.edges.map((edge) => {
    return { params: { filename: edge.node._sys.filename } }
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
