import { client } from '../../tina/__generated__/client'
import PostList from './client-page'

export default async function Page() {
  const pages = await client.queries.postConnection()

  return <PostList {...pages} />
}
