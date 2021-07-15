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

import { LocalClient, useForm } from 'tina-graphql-gateway'

const client = new LocalClient()

export const getServerSideProps = async ({ params, ...rest }): Promise<any> => {
  // if (typeof params.path === "string") {
  //   throw new Error("Expected an array of strings for path slugs");
  // }

  const content = await client.requestWithForm(
    (gql) => gql`
      {
        getDocument(section: "posts", relativePath: "welcome.md") {
          __typename
          ... on Posts_Document {
            id
            data {
              __typename
              ... on Post_Doc_Data {
                title
              }
            }
          }
        }
      }
    `,
    {
      variables: {
        section: 'posts',
        relativePath: 'welcome.md',
      },
    }
  )
  return { props: content }
}

const Home = (props: any) => {
  const [{ getDocument }] = useForm({ payload: props })
  const { form, sys, ...rest } = getDocument

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <pre>
        <code>{JSON.stringify(rest, null, 2)}</code>
      </pre>
    </div>
  )
}

export default Home
