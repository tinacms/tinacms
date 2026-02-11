import React from 'react'
import client from '../../../../tina/__generated__/client'
import { Json } from '../../../../components/json'

type Props = { params: { filename: string[] } }

export default async function NodeFile({ params }: Props) {
  const id = `${(params.filename || []).join('/')}.md`
  const props = await client.queries.NodeQuery({ id })

  return (
    <main className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <Json src={props} />
      </div>
    </main>
  )
}
