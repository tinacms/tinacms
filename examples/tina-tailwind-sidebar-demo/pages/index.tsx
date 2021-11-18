/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { Hero, hero_template } from '../components/hero'
import { Testimonial, testimonial_template } from '../components/testimonial'
import { Blocks } from '../components/PageBlocks'
import { Nav } from '../components/nav'
import { Footer } from '../components/footer'
import { Features, features_template } from '../components/features'
import { Page, ThemeDocument } from '../.tina/__generated__/types'
import { Theme } from '../components/theme'
import { gql, getStaticPropsForTina } from 'tinacms'

interface AppProps {
  data: {
    getPageDocument: { data: Page }
    getThemeDocument: ThemeDocument
  }
}
const App = ({ data }: AppProps) => {
  const { getPageDocument } = data
  const { blocks, nav, footer, navlist } = getPageDocument.data
  return (
    <div className="App">
      <Theme theme={data}>
        <div className="min-h-screen flex flex-col">
          <Nav nav={nav} />
          <div className="flex-grow flex flex-col">
            <Blocks
              blocksData={blocks}
              placeholder={
                <div className="flex-grow flex items-center justify-center transition duration-150 ease-out text-gray-700 dark:text-gray-100 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 body-font overflow-hidden">
                  <p className="opacity-30">
                    There's nothing here, try adding some page sections.
                  </p>
                </div>
              }
            />
          </div>
          <Footer
            name={nav?.wordmark?.name || ''}
            footer={footer}
            navList={navlist}
          />
        </div>
      </Theme>
      {/* {showModal && (
        <TinaModal
        data={data}
        close={() => {
          setShowModal(false);
        }}
      /> */}
      {/* )} */}
    </div>
  )
}

const PAGE_BLOCKS = {
  hero: Hero,
  testimonial: Testimonial,
  features: Features,
}

const PAGE_BLOCK_TEMPLATES = {
  hero: hero_template,
  testimonial: testimonial_template,
  features: features_template,
}

export default App

export const query = gql`
  query ContentQuery {
    getThemeDocument(relativePath: "NormalTheme.json") {
      data {
        color
        btnStyle
      }
    }
    getPageDocument(relativePath: "homepage.json") {
      id
      data {
        nav {
          wordmark {
            icon {
              color
              name
              style
            }
            name
          }
          items {
            label
            link
          }
        }
        blocks {
          __typename
          ... on PageBlocksHero {
            tagline
            headline
            paragraph
            string {
              color
            }
            image {
              src
              alt
            }
            actions {
              label
              type
              icon
            }
            style {
              color
            }
          }
          __typename
          ... on PageBlocksTestimonial {
            quote
            author
            style {
              color
            }
          }
          __typename
          ... on PageBlocksFeatures {
            items {
              icon {
                color
                name
                style
              }
              title
              text
              actions {
                label
                type
                icon
              }
            }
          }
        }
        navlist {
          __typename
          ... on PageNavlistNav {
            title
            items {
              label
              link
            }
          }
        }
        footer {
          social {
            facebook
            twitter
            instagram
            github
          }
        }
      }
    }
  }
`

export const getStaticProps = async (ctx) => {
  const tinaProps = await getStaticPropsForTina({ query, variables: {} })
  return {
    props: {
      ...tinaProps,
    },
  }
}
