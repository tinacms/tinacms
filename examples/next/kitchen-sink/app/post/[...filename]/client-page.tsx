'use client'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'

type TinaProps = {
  query: string
  variables: Record<string, any>
  data: any
}

export default function BlogPostClientPage(props: TinaProps) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })

  if (data?.post) {
    return (
      <main className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <TinaMarkdown content={data.post.body} />
        </div>
      </main>
    )
  }

  return <div>No data</div>
}
