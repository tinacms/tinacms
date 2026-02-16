'use client'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { customComponents } from '@/components/markdown-components'

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
      <main className="py-12 px-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-1000">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-8">{data.documentation.title}</h1>
          <div className="prose prose-lg dark:prose-dark max-w-none">
            <TinaMarkdown components={customComponents} content={data.documentation.body} />
          </div>
          {data.documentation.tags && data.documentation.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {data.documentation.tags.map((tagRef: any, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
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
