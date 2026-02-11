import React from 'react'
import client from '../../../tina/__generated__/client'
import { Json } from '../../../components/json'

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

// Compatibility export for pages-style tests
export async function getStaticProps({ params }: { params: { filename: string[] } | { filename: string } }) {
  const fname = (params as any).filename
  const parts = Array.isArray(fname) ? fname : [fname]
  const variables = { relativePath: `${parts.join('/')}.mdx` }
  const props = await client.queries.post(variables)
  return { props: { ...props, variables } }
}
