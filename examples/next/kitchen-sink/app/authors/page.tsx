import React from 'react'
import Link from 'next/link'
import client from '../../tina/__generated__/client'
import Layout from '@/components/layout/layout'

export default async function AuthorsPage() {
  const connection = await client.queries.authorConnection()
  const authors = connection.data.authorConnection.edges

  return (
    <Layout>
      <section className="flex-1 relative transition duration-150 ease-out body-font overflow-hidden text-gray-800 dark:text-gray-50 bg-gradient-to-tl from-gray-50 dark:from-gray-900 via-transparent to-transparent">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-24">
          <h1 className="text-4xl font-extrabold tracking-tight mb-12 text-center title-font">Authors</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {authors.map((edge: any) => (
              <Link
                key={edge.node._sys.filename}
                href={`/authors/${edge.node._sys.filename}`}
                className="group block px-6 sm:px-8 py-8 bg-gray-50 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-1000 rounded shadow-sm transition-all duration-150 ease-out hover:shadow-md hover:to-gray-50 dark:hover:to-gray-800"
              >
                <div className="flex items-center gap-4 mb-4">
                  {edge.node.avatar && (
                    <img
                      src={edge.node.avatar}
                      alt={edge.node.name}
                      className="h-14 w-14 object-cover rounded-full shadow-sm"
                    />
                  )}
                  <h2 className="text-2xl font-semibold text-gray-700 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-all duration-150">
                    {edge.node.name}
                  </h2>
                </div>
                {edge.node.description && (
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2 opacity-70">{edge.node.description}</p>
                )}
                {edge.node.hobbies && edge.node.hobbies.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {edge.node.hobbies.map((hobby: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-sm px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                      >
                        {hobby}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}
