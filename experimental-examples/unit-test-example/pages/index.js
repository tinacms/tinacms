import React from 'react'
import { useGraphqlForms, getStaticPropsForTina } from 'tinacms'

export default function Page(props) {
  const eventList = React.useRef([])

  /**
   * Generates test file output when forms are saved
   */
  const handleSubmit = React.useCallback(() => {
    const template = `/**

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
