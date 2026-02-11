import React from 'react'
import client from '../../../tina/__generated__/client'
import { Json } from '../../../components/json'

type Props = { params: { filename: string[] } }

export default async function DocFile({ params }: Props) {
  const parts = params.filename || []
  const relativePath = `${parts.join('/')}.md`
  const props = await client.queries.documentation({ relativePath })

  return (
    <main className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <Json src={props} />
      </div>
    </main>
  )
}

// Compatibility export for pages-style tests
export async function getStaticProps({ params }: { params: { filename: string[] } }) {
  const parts = params.filename || []
  const variables = { relativePath: `${parts.join('/')}.md` }
  const props = await client.queries.documentation(variables)
  return { props: { ...props, variables } }
}
