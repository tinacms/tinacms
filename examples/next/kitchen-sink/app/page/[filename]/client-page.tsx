'use client'

import { useTina } from 'tinacms/dist/react'
import BlockRenderer from '@/components/blocks'
import { Section } from '@/components/layout/section'

type TinaProps = {
  query: string
  variables: Record<string, any>
  data: any
}

export default function PageClientComponent(props: TinaProps) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })

  const page = data?.page
  if (!page) {
    return <div className="p-6 text-red-600">Error: No page data found</div>
  }

  // Render blockPage template
  if (page._template === 'blockPage') {
    return (
      <>
        <Section>
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900">
              {page.title}
            </h1>
          </div>
        </Section>
        <BlockRenderer blocks={page.blocks} />
      </>
    )
  }

  // Render showcase template
  if (page._template === 'showcase') {
    return (
      <main className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            {page.title}
          </h1>
          {page.items && page.items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {page.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-gray-700 mb-4">
                      {item.description}
                    </p>
                  )}
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full rounded"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    )
  }

  return (
    <div className="p-6 bg-yellow-50 text-yellow-900 rounded">
      Unknown template type: {page._template}
    </div>
  )
}
