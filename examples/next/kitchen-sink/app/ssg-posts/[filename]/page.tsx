import React from 'react'
import client from '../../../../tina/__generated__/client'
import { Json } from '../../../../components/json'

type Props = { params: { filename: string } }

export default async function SSGPostFile({ params }: Props) {
  const relativePath = `${params.filename}.md` 
  const props = await client.queries.ssgPost({ relativePath })

  return (
    <main className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <Json src={props} />
      </div>
    </main>
  )
}
