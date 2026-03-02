import React from 'react'
import Link from 'next/link'
import client from '../../tina/__generated__/client'
import Layout from '@/components/layout/layout'

export default async function DocumentationPage() {
  const connection = await client.queries.documentationConnection()
  const docs = connection.data.documentationConnection.edges

  return (
    <Layout>
      <section className="flex-1 relative transition duration-150 ease-out body-font overflow-hidden text-gray-800 dark:text-gray-50 bg-gradient-to-tl from-gray-50 dark:from-gray-900 via-transparent to-transparent">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-24">
          <h1 className="text-4xl font-extrabold tracking-tight mb-12 text-center title-font">Documentation</h1>
          <div className="space-y-6">
            {docs.map((edge: any) => (
              <Link
                key={edge.node._sys.filename}
                href={`/documentation/${edge.node._sys.breadcrumbs?.join('/') || edge.node._sys.filename}`}
                className="group block px-6 sm:px-8 py-8 bg-gray-50 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-1000 rounded shadow-sm transition-all duration-150 ease-out hover:shadow-md hover:to-gray-50 dark:hover:to-gray-800"
              >
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-all duration-150 title-font">
                  {edge.node.title || edge.node._sys.filename}
                </h2>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}
