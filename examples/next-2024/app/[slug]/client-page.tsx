'use client'
import type { PageQuery } from '@/tina/__generated__/types'
import React from 'react'
import { tinaField, useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'

interface ClientPageProps {
  query: string
  variables: {
    relativePath: string
  }
  data: PageQuery
}

type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange'

// Highlight color styles
const highlightColorStyles: Record<HighlightColor, string> = {
  yellow: 'bg-yellow-200',
  green: 'bg-green-200',
  blue: 'bg-blue-200',
  pink: 'bg-pink-200',
  orange: 'bg-orange-200',
}

// Custom component overrides - highlight is built-in but we customize styling
const components = {
  // Custom highlight component with color support
  highlight: ({ children, color = 'yellow' }: { children: React.ReactNode; color?: HighlightColor }) => (
    <mark className={`${highlightColorStyles[color]} px-0.5`}>{children}</mark>
  ),
}

export default function PageContent(props: ClientPageProps) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1
        className="text-3xl font-bold mb-6"
        data-tina-field={tinaField(data.page, 'title')}
      >
        {data.page.title}
      </h1>

      <article
        className="prose prose-lg"
        data-tina-field={tinaField(data.page, 'body')}
      >
        <TinaMarkdown content={data.page.body} components={components} />
      </article>

      <details className="mt-8">
        <summary className="cursor-pointer text-sm text-gray-500">
          View raw data
        </summary>
        <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
          {JSON.stringify(data.page, null, 2)}
        </pre>
      </details>
    </main>
  )
}
