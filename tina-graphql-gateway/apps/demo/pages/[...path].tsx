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

import { useGraphqlForms, useDocumentCreatorPlugin } from 'tina-graphql-gateway'
import type * as Tina from '../.tina/__generated__/types'
import { Sidebar } from '../components/sidebar'

const query = (gql) => gql`
  query ContentQuery($collection: String!, $relativePath: String!) {
    getDocument(collection: $collection, relativePath: $relativePath) {
      ... on Posts_Document {
        id
        data {
          ... on Post_Doc_Data {
            title
          }
        }
      }
      ... on Authors_Document {
        id
        data {
          ... on Author_Doc_Data {
            name
            description
            _body
          }
        }
      }
    }
  }
`

export const getServerSideProps = async ({ params, ...rest }): Promise<any> => {
  if (typeof params.path === 'string') {
    throw new Error('Expected an array of strings for path slugs')
  }
  return {
    props: {
      queryVars: {
        collection: params.path[0],
        relativePath: params.path.slice(1).join('/'),
      },
    },
  }
}

const Home = (props: any) => {
  const [payload, isLoading] = useGraphqlForms<{
    getDocument: Tina.SectionDocumentUnion
  }>({
    query,
    variables: props.queryVars,
    formify: ({ formConfig, createForm, skip }) => {
      // return skip();
      return createForm(formConfig)
    },
  })
  useDocumentCreatorPlugin((args) =>
    window.location.assign(
      `/${args.collection.slug}/${args.breadcrumbs.join('/')}.md`
    )
  )

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <Sidebar relativePath="" />
      <pre>
        {isLoading ? (
          <span>Loading...</span>
        ) : (
          <>
            <code>{JSON.stringify(payload.getDocument.data, null, 2)}</code>
          </>
        )}
      </pre>
    </div>
  )
}

export default Home
