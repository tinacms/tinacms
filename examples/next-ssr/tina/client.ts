import { createClient } from 'tinacms/dist/client'
import { queries } from './__generated__/types'
export const client = createClient({
  url: 'http://localhost:4001/graphql',
  token: 'null',
  queries,
})
export default client
