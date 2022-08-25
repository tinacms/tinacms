---
title: Querying Tina Content Client-side at Runtime
last_edited: '2022-04-08T10:00:00.000Z'
---

## Fetch data client-side

> Fetching content on the server (SSR), or at build time (SSG) is preferred and faster but in some cases you may still want to get data client-side at runtime.

Here's an example of data-fetching client-side, on a React site:

```jsx
import { useState, useEffect } from 'react'
import { useTina } from 'tinacms/dist/edit-state'
import { client } from '../[pathToTina]/.tina/__generated__/client'


// Variables used in the GraphQL query;
const variables = {
  relativePath: 'HelloWorld.md',
}

export default function BlogPostPage() {
  const [postQuery, setPostQuery] = useState(null)
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true)
      const postResponse = await client.queries.post({
        relativePath: 'HelloWorld.md',
      })
      setPostQuery(postResponse)
      setLoading(false)
    }
    fetchContent()
  }, [query, JSON.stringify(variables)])

  const { data } = useTina({ postQuery?.query, postQuery?.variables, data: postQuery?.data })

  if (isLoading) return <p>Loading...</p>
  if (!data) return <p>No data</p>

  return <div>{JSON.stringify(data)}</div>
}
```
