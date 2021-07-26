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

import { LandingPage } from '../components/landing-page'
import { Wrapper } from '../components/helper-components'
import { getStaticPropsForTina, gql } from 'tinacms'

export default function HomePage(props) {
  return (
    <Wrapper data={props.data.getMarketingPagesDocument.dataJSON}>
      <LandingPage {...props.data.getMarketingPagesDocument.data} />
    </Wrapper>
  )
}

export const getStaticProps = async () => {
  const tinaProps = await getStaticPropsForTina({
    query: gql`
      query ContentQuery {
        # "index.md" is _relative_ to the "Marketing Pages" path property in your schema definition
        # you can inspect this file at "content/marketing-pages/index.md"
        getMarketingPagesDocument(relativePath: "index.md") {
          dataJSON
          data {
            blocks {
              __typename
              ... on MarketingPagesBlocksImage {
                heading
                imgDescription
                src
              }
              ... on MarketingPagesBlocksMessage {
                messageHeader
                messageBody
              }
            }
          }
        }
        getPostsDocument(relativePath: "voteForPedro.md") {
          data {
            title
            hero
            author {
              __typename
              ... on AuthorsDocument {
                data {
                  __typename
                  ... on Authors {
                    name
                    avatar
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: {},
  })
  return {
    props: {
      ...tinaProps,
    },
  }
}
