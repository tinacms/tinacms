import React from 'react'
import client from '../../tina/__generated__/client'

export default async function DocumentationPage() {
  const connection = await client.queries.documentationConnection()
  const docs = connection.data.documentationConnection.edges

  return (
    <main className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {docs.map((edge: any) => (
          <div key={edge.node._sys.filename} className="mb-6">
            <h2 className="text-xl font-semibold">{edge.node._sys.filename}</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(edge.node, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </main>
  )
}
