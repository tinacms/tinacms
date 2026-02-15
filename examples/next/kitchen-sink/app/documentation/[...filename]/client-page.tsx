'use client'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'

type TinaProps = {
  query: string
  variables: Record<string, any>
  data: any
}

export default function DocumentationClientPage(props: TinaProps) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })

  if (data?.documentation) {
    return (
      <main className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">{data.documentation.title}</h1>
          <div className="prose prose-lg max-w-none">
            <TinaMarkdown content={data.documentation.body} />
          </div>
          {data.documentation.tags && data.documentation.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {data.documentation.tags.map((tagRef: any, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {tagRef.reference?.title || 'Unknown'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    )
  }

  return <div>No data</div>
}
