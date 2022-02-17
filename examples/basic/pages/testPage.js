// This page can be deleted

import { useTina } from 'tinacms/dist/edit-state'
import { Layout } from '../components/Layout'
const query = `{
    getPageDocument(relativePath: "home.mdx"){
      data{
        body
      }
    }
  }`

const TestPage = () => {
  const { data, isLoading } = useTina({
    query,
    variables: {},
    data: async ({ query, variables }) => {
      const res = await fetch(
        'https://content.tinajs.io/content/4c042232-9a0b-4864-bb35-2f25250bb141/github/main',
        {
          method: 'POST',
          body: JSON.stringify({ query, variables }),
          headers: {
            'X-API-KEY': 'd64b9be0beb3fb78ace5ac7e23818dc7b978f6c4',
            'Content-Type': 'application/json',
          },
        }
      )
      const data = await res.json()
      return data
    },
  })

  if (isLoading) {
    return <div>Loading...</div>
  }
  return (
    <Layout>
      <pre>
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </Layout>
  )
}

export default TestPage
