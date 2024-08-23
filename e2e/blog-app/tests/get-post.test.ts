import { client } from '../tina/__generated__/client'
import { it, expect } from 'vitest'

it('get-post', async () => {
  const result = await client.queries.posts({
    relativePath: 'post1.md',
  })
  expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(
    'snaps/get-post.json'
  )
})
