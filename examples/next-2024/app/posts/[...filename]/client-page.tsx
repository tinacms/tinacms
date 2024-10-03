'use client'
import type { PostQuery } from '@/tina/__generated__/types'
import mermaid from 'mermaid'
import { useEffect, useRef } from 'react'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'

export const useMermaidElement = () => {
  const mermaidRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mermaidRef.current) {
      mermaid.initialize({ startOnLoad: true })
      mermaid.run()
    }
  }, [])

  return {
    mermaidRef,
  }
}

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
            const { mermaidRef } = useMermaidElement()
            return (
              <div contentEditable={false}>
                <div ref={mermaidRef}>
                  <pre className="mermaid">{props?.value}</pre>
                </div>
              </div>
            )
          },
        }}
      />
      <code>
        <pre>{JSON.stringify(data.post, null, 2)}</pre>
      </code>
    </>
  )
}
