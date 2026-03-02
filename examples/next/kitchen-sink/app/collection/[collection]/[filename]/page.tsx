import React from 'react'
import client from '../../../../tina/__generated__/client'

type Props = { params: Promise<{ collection: string; filename: string }> }

export default async function CollectionFile({ params }: Props) {
  const { collection, filename } = await params
  const relativePath = `${filename}.mdx`
  const props = await client.queries.collection({ collection, relativePath })

  return (
    <main className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(props, null, 2)}
        </pre>
      </div>
    </main>
  )
}
