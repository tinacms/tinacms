'use client'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { customComponents } from '@/components/markdown-components'

type TinaProps = {
  query: string
  variables: Record<string, any>
  data: any
}

export default function AuthorClientPage(props: TinaProps) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })

  if (data?.author) {
    return (
      <main className="py-12 px-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-1000">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
            {data.author.image && (
              <img
                src={data.author.image}
                alt={data.author.name}
                className="w-32 h-32 rounded-full mb-4 object-cover border-4 border-blue-500 dark:border-blue-400"
              />
            )}
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50">{data.author.name}</h1>
          </div>

          {data.author.bio && (
            <div className="prose prose-lg dark:prose-dark max-w-none mb-8">
              <TinaMarkdown components={customComponents} content={data.author.bio} />
            </div>
          )}

          {data.author.hobbies && data.author.hobbies.length > 0 && (
            <div className="mt-8 p-6 bg-blue-50 dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Hobbies</h3>
              <div className="flex flex-wrap gap-2">
                {data.author.hobbies.map((hobby: any, idx: number) => {
                  const hobbyText = typeof hobby === 'string' ? hobby : hobby?.name || hobby?.title || String(hobby);
                  return (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                    >
                      {hobbyText}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    )
  }

  return <div>No data</div>
}
