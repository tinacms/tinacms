'use client'
import type { PostQuery } from '@/tina/__generated__/types'
import { useTina } from 'tinacms/dist/react'

interface ClientPageProps {
  query: string
  variables: {
    relativePath: string
  }
  data: PostQuery
}

export default function Post(props: ClientPageProps) {
  // data passes though in production mode and data is updated to the sidebar data in edit-mode
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })
  return (
    <code>
      <pre>{JSON.stringify(data.post, null, 2)}</pre>
    </code>
  )
}
