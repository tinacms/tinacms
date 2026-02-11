import React from 'react'
import client from '../../../../tina/__generated__/client'
import { Json } from '../../../../components/json'

type Props = { params: { collection: string; filename: string } }

export default async function CollectionFile({ params }: Props) {
  const relativePath = `${params.filename}.md`
  const props = await client.queries.collection({ collection: params.collection, relativePath })

  return (
    <main className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <Json src={props} />
      </div>
    </main>
  )
}

// Compatibility export for pages-style tests
export async function getServerSideProps({ params }: { params: { collection: string; filename: string } }) {
  const collections = await client.queries.CollectionQuery()
  const collection = collections.data.collections.find(({ name }: any) => name === params.collection)
  const variables = {
    collection: params.collection,
    relativePath: `${params.filename}.${collection.format}`,
  }
  const props = await client.queries.DocumentQuery(variables)
  return { props: { ...props, variables } }
}
