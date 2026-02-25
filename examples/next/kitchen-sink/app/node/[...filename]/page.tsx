import React from 'react'
import client from '../../../tina/__generated__/client'

type Props = { params: Promise<{ filename: string[] }> }

export default async function NodeFile({ params }: Props) {
  const { filename } = await params
  const id = (filename || []).join('/')
  const props = await client.queries.NodeQuery({ id })

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
