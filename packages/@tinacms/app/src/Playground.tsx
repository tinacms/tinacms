import { createGraphiQLFetcher } from '@graphiql/toolkit'
import { GraphiQL } from 'graphiql'

import 'graphiql/graphiql.min.css'

const fetcher = createGraphiQLFetcher({
  url: __API_URL__,
})

const Playground = () => (
  <div style={{ height: '100vh' }}>
    <GraphiQL fetcher={fetcher} />
  </div>
)

export default Playground
