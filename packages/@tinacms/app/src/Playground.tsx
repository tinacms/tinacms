import { createGraphiQLFetcher } from '@graphiql/toolkit'
import { GraphiQL } from 'graphiql'

import 'graphiql/graphiql.css'

const fetcher = createGraphiQLFetcher({
  url: 'http://localhost:4001/graphql',
})

const Playground = () => (
  <div style={{ height: '100vh' }}>
    <GraphiQL fetcher={fetcher} />
  </div>
)

export default Playground
