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
  if (!props.data.page) {
    return null
  }
  const seo = props.data.page.seo

  return (
    <>
      <Head>
        <title>{props.data.page.title}</title>
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
        {props.data.navigation && <Nav {...props.data.navigation} />}
        {props.data.page.blocks?.map((block, i) => {
          return (
            // <div key={i} data-tinafield={getTinaField(block)}>
            <div key={i}>
              <Block {...block} />
            </div>
          )
        })}
        {props.data.footer && <Footer {...props.data.footer} />}
      </div>
    </>
  )
}

const Block = (block: HomeProps['data']['page']['blocks'][number]) => {
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
    const res = await run({ variables: { relativePath } })
    return { props: res }
  } catch (e) {
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
      page: [
        { relativePath: variables.relativePath },
        {
          id: true,
          title: true,
          seo: {
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
      ],
    },
    variables
  )
}
