import React from 'react'
import client from '../../tina/__generated__/client'

export default async function TagsPage() {
  const connection = await client.queries.tagConnection()
  const tags = connection.data.tagConnection.edges

  return (
    <main className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Tags</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map((edge: any) => (
            <a
              key={edge.node._sys.filename}
              href={`/tags/${edge.node._sys.filename}`}
              className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-lg transition-shadow"
            >
              <h2 className="text-lg font-semibold text-gray-900">
                {edge.node.title}
              </h2>
              {edge.node.description && (
                <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                  {edge.node.description}
                </p>
              )}
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}
