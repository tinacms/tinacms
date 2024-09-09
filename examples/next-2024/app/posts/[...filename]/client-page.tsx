'use client'
import type { PostQuery } from '@/tina/__generated__/types'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import mermaid from 'mermaid'

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
    <>
      <TinaMarkdown
        content={data.post.body}
        components={{
          mermaid(props) {
            console.log(props)

            mermaid.initialize({
              startOnLoad: true,
            })
            ;<pre className="bg-blue-300">
              <code>{props?.value}</code>
            </pre>
          },
        }}
      />
      <code>
        <pre>{JSON.stringify(data.post, null, 2)}</pre>
      </code>
    </>
  )
}
