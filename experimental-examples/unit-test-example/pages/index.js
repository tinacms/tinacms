import React from 'react'
import { useGraphqlForms, getStaticPropsForTina } from 'tinacms'

export default function Page(props) {
  const eventList = React.useRef([])

  /**
   * Generates test file output when forms are saved
   */
  const handleSubmit = React.useCallback(() => {
    const template = `/**
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

const query = \`${query}\`

const events = ${JSON.stringify(eventList.current, null, 2)}

import { testRunner } from '../runner'
// @ts-ignore jest: Cannot find name 'test'
test('formifies the query and responds correctly to events', async () => {
  await testRunner(query, events, __dirname)
})
    `
    navigator.clipboard.writeText(template)
    console.log('events copied to clipboard')
  }, [])

  const [data] = useGraphqlForms({
    query,
    variables,
    data: props.data,
    eventList: eventList.current,
    onSubmit: handleSubmit,
  })
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}

export const getStaticProps = async () => {
  const tinaProps = await getStaticPropsForTina({
    query,
    variables,
  })

  return {
    props: {
      ...tinaProps,
    },
  }
}

const variables = {}

const query = `#graphql
query GetBlockPageDocument {
  document(collection: "author", relativePath: "author1.mdx") {
    ...on Author {
      name
    }
  }
}
`
