'use client'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'

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
      <main className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            {data.author.image && (
              <img
                src={data.author.image}
                alt={data.author.name}
                className="w-32 h-32 rounded-full mb-4 object-cover"
              />
            )}
            <h1 className="text-4xl font-bold text-gray-900">{data.author.name}</h1>
          </div>

          {data.author.bio && (
            <div className="prose prose-lg max-w-none mb-8">
              <TinaMarkdown content={data.author.bio} />
            </div>
          )}

          {data.author.hobbies && data.author.hobbies.length > 0 && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hobbies</h3>
              <div className="flex flex-wrap gap-2">
                {data.author.hobbies.map((hobby: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                  >
                    {hobby}
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
