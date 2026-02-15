'use client'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'

type TinaProps = {
  query: string
  variables: Record<string, any>
  data: any
}

export default function SSGPostClientPage(props: TinaProps) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })

  if (data?.ssgPost) {
    return (
      <main className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">{data.ssgPost.title}</h1>
          <div className="prose prose-lg max-w-none">
            <TinaMarkdown content={data.ssgPost.body} />
          </div>
        </div>
      </main>
    )
  }

  return <div>No data</div>
}
