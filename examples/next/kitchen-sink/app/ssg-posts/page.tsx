import React from 'react'
import client from '../../tina/__generated__/client'
import { Json } from '../../components/json'

export default async function SSGPosts() {
  const connection = await client.queries.ssgPostConnection()
  const posts = connection.data.ssgPostConnection.edges

  return (
    <main className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {posts.map((edge: any) => (
          <div key={edge.node._sys.filename} className="mb-6">
            <h2 className="text-xl font-semibold">{edge.node._sys.filename}</h2>
            <Json src={edge.node} />
          </div>
        ))}
      </div>
    </main>
  )
}
