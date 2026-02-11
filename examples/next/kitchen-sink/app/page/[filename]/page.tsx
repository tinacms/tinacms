import React from 'react'
import client from '../../../tina/__generated__/client'
import { Json } from '../../../components/json'

type Props = { params: { filename: string } }

export default async function PageFile({ params }: Props) {
  const relativePath = `${params.filename}.md`
  const props = await client.queries.page({ relativePath })

  return (
    <main className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <Json src={props} />
      </div>
    </main>
  )
}

// Compatibility export for pages-style tests
export async function getStaticProps({ params }: { params: { filename: string } }) {
  const relativePath = `${params.filename}.md`
  const props = await client.queries.page({ relativePath })
  return { props: { ...props, variables: { relativePath } } }
}

export async function getStaticPaths() {
  const connection = await client.queries.pageConnection()
  return {
    paths: connection.data.pageConnection.edges.map((post: any) => ({ params: { filename: post.node._sys.filename } })),
    fallback: 'blocking',
  }
}
