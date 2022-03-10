import Head from 'next/head'
import { Chain, Zeus } from '../../zeus'
import { heroTemplate, blockHeroQuery, HeroWithSlantImage } from './hero'
import {
  TwoWideGrid,
  ThreeWideGrid,
  FourWideGrid,
  blockFeatureQuery,
  featureTemplate,
} from './feature'
import {
  blockFullScreenHeaderQuery,
  blockFullScreenLogoQuery,
  FullScreenHeaderWithBackground,
  FullScreenLogo,
  fullScreenLogoTemplate,
  fullScreenHeaderTemplate,
} from './header'
import {
  StatsWithImage,
  blockStatsWithImageQuery,
  statsWithImageTemplate,
} from './stats'
import { Nav, navQuery } from '../../components/nav'
import { Footer, footerQuery } from '../../components/footer'
import {
  blockComparisonTable,
  pageBlocksComparisonTableTemplate,
  Pricing,
} from './pricing'
import { blockSlideshowQuery, slideshowTemplate, Slideshow } from './slideshow'
import { blockNewsQuery, newsTemplate, News } from './news'
import { localeQuery } from '../locale-info'

import type { TinaCollection, TinaField } from 'tinacms'

const textFields: TinaField[] = [
  {
    label: 'Title',
    name: 'title',
    type: 'string' as const,
    required: true,
  },
  {
    label: 'Sub-Title',
    name: 'subTitle',
    type: 'string',
  },
  {
    label: 'Description',
    name: 'description',
    type: 'rich-text' as const,
    required: true,
  },
]

const textFieldsSeo: TinaField[] = [
  {
    label: 'Title',
    name: 'title',
    type: 'string' as const,
    // required: true,
  },
  {
    label: 'Image',
    name: 'image',
    type: 'string',
  },
  {
    label: 'Description',
    name: 'description',
    type: 'string' as const,
    required: true,
  },
]

export const blockTemplate = (): TinaCollection => {
  return {
    label: 'Page',
    name: 'page',
    path: 'content/pages',
    fields: [
      {
        label: 'Title',
        name: 'title',
        required: true,
        type: 'string',
      },
      {
        label: 'Link',
        name: 'link',
        required: true,
        type: 'string',
      },
      {
        label: 'SEO',
        name: 'seo',
        type: 'object',
        fields: textFieldsSeo,
      },
      {
        label: 'Blocks',
        name: 'blocks',
        type: 'object',
        list: true,
        templates: [
          newsTemplate(textFields),
          statsWithImageTemplate(textFields),
          heroTemplate(textFields),
          slideshowTemplate(textFields),
          pageBlocksComparisonTableTemplate(textFields),
          featureTemplate(textFields),
          fullScreenLogoTemplate(),
          fullScreenHeaderTemplate(textFields),
        ],
      },
    ],
  }
}

type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (
  ...args: any
) => Promise<infer R>
  ? R
  : any
type HomeProps = AsyncReturnType<typeof run>

export default function Home(props: HomeProps) {
  if (!props) {
    return null
  }
  const seo = props.data.getPageDocument.data.seo

  return (
    <>
      <Head>
        <title>{props.data.getPageDocument.data.title}</title>
        {seo && (
          <>
            <meta property="og:title" content={seo.title} />
            <meta
              name="description"
              property="og:description"
              content={seo.description}
            />
            {/* @ts-ignore */}
            <meta property="og:image" content={seo.image} />
          </>
        )}
      </Head>

      <div>
        {props.data.getNavigationDocument.data && (
          <Nav {...props.data.getNavigationDocument.data} />
        )}
        {props.data.getPageDocument.data.blocks?.map((block, i) => {
          return <Block key={i} {...block} />
        })}
        {props.data.getFooterDocument.data && (
          <Footer {...props.data.getFooterDocument.data} />
        )}
      </div>
    </>
  )
}

const Block = (
  block: HomeProps['data']['getPageDocument']['data']['blocks'][number]
) => {
  switch (block.__typename) {
    case 'PageBlocksFullScreenLogo':
      return <FullScreenLogo {...block} />
    case 'PageBlocksHero':
      return <HeroWithSlantImage {...block} />
    case 'PageBlocksNews':
      return <News {...block} />
    case 'PageBlocksFeature':
      if (block.featureStyle === '2-wide-grid') {
        return <TwoWideGrid {...block} />
      } else if (block.featureStyle === '3-column') {
        return <ThreeWideGrid {...block} />
      } else {
        return <FourWideGrid {...block} />
      }
    case 'PageBlocksStatsWithImage':
      return <StatsWithImage {...block} />
    case 'PageBlocksFullScreenHeader':
      return <FullScreenHeaderWithBackground {...block} />
    case 'PageBlocksSlideshow':
      return <Slideshow {...block} />
    case 'PageBlocksComparisonTable':
      return <Pricing {...block} />

    default:
      // @ts-ignore
      throw new Error(`Unknown block ${block.__typename}`)
  }
}

export const getStaticProps = async ({
  relativePath,
}: {
  relativePath: string
}) => {
  try {
    return { props: await run({ variables: { relativePath } }) }
  } catch (e) {
    console.log(e)
    return {
      props: JSON.parse(JSON.stringify(e)).response,
    }
  }
}
const chain = Chain('http://localhost:4001/graphql')

export const request = () => {
  const queryChain = chain('query')
  const chainWithQueryString = {
    query: async <
      T extends Parameters<typeof queryChain>[0],
      B extends Parameters<typeof queryChain>[1]
    >(
      queryObject: T,
      variables?: B
    ) => {
      return {
        query: Zeus('query', queryObject),
        data: await queryChain(queryObject, variables),
      }
    },
  }
  return chainWithQueryString
}

const chainWithQueryString = request()

const run = async ({ variables }) => {
  return chainWithQueryString.query(
    {
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
      getPageDocument: [
        { relativePath: variables.relativePath },
        {
          id: true,
          data: {
            title: true,
            seo: {
              // @ts-ignore not sure why it's not getting updated
              title: true,
              description: true,
              image: true,
            },
            blocks: {
              __typename: true,
              '...on PageBlocksComparisonTable': blockComparisonTable,
              '...on PageBlocksHero': blockHeroQuery,
              '...on PageBlocksFeature': blockFeatureQuery,
              '...on PageBlocksNews': blockNewsQuery,
              '...on PageBlocksFullScreenLogo': blockFullScreenLogoQuery,
              '...on PageBlocksFullScreenHeader': blockFullScreenHeaderQuery,
              '...on PageBlocksStatsWithImage': blockStatsWithImageQuery,
              '...on PageBlocksSlideshow': blockSlideshowQuery,
            },
          },
        },
      ],
    },
    variables
  )
}
