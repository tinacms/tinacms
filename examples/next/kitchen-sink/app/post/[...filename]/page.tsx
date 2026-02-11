import React from 'react'
import client from '../../../tina/__generated__/client'
import { Json } from '../../../components/json'

type Props = { params: { filename: string[] } }

export default async function PostFile({ params }: Props) {
  const parts = params.filename || []
  const relativePath = `${parts.join('/')}.mdx`
  const props = await client.queries.post({ relativePath })

  return (
    <main className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <Json src={props} />
      </div>
    </main>
  )
}

// Compatibility export for tests that import `getStaticProps` from the pages-style API.
export async function getStaticProps({ params }: { params: { filename: string[] } }) {
  const parts = params.filename || []
  const variables = { relativePath: `${parts.join('/')}.mdx` }
  const props = await client.queries.post(variables)
  return {
    props: { ...props, variables },
  }
}
