'use client'

import { useTina } from 'tinacms/dist/react'
import { Blocks } from '@/components/blocks'
import { Section, Container } from '@/components/layout'
import RichText from '@/lib/richText'

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
  // Determine template name. GraphQL returns `__typename` (PageBlockPage | PageShowcase)
  const template = (page as any)._template ?? (page.__typename === 'PageBlockPage' ? 'blockPage' : page.__typename === 'PageShowcase' ? 'showcase' : undefined)

  // Render blockPage template
  if (template === 'blockPage') {
    return (
      <>
        {page.blocks && page.blocks.length > 0 ? (
          <Blocks blocks={page.blocks} />
        ) : (
          <div className="p-6 text-gray-600 dark:text-gray-400">No blocks to display</div>
        )}
      </>
    )
  }
  // Render showcase template
  if (template === 'showcase') {
    return (
      <main className="py-12 px-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-1000">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-8">
            {page.title}
          </h1>
          {page.items && page.items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {page.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-2">
                    {item.title}
                  </h3>
                  {item.description && (
                    <div className="text-gray-700 dark:text-gray-300 mb-4">
                      <RichText content={item.description} />
                    </div>
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
