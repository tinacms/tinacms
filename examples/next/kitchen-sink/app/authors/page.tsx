import React from 'react'
import client from '../../tina/__generated__/client'

export default async function AuthorsPage() {
  const connection = await client.queries.authorConnection()
  const authors = connection.data.authorConnection.edges

  return (
    <main className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Authors</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {authors.map((edge: any) => (
            <a
              key={edge.node._sys.filename}
              href={`/authors/${edge.node._sys.filename}`}
              className="p-6 border border-gray-200 rounded-lg bg-white hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900">
                {edge.node.name}
              </h2>
              {edge.node.bio && (
                <p className="text-gray-600 mt-2 line-clamp-2">{edge.node.bio}</p>
              )}
              {edge.node.hobbies && edge.node.hobbies.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {edge.node.hobbies.map((hobby: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-sm px-2 py-1 bg-gray-100 text-gray-700 rounded"
                    >
                      {hobby}
                    </span>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}
