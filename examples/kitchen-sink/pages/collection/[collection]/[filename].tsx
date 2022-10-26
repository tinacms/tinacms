import { InferGetServerSidePropsType } from 'next'
import { useTina } from 'tinacms/dist/react'
import client from '../../../.tina/__generated__/client'

export default function Home(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { data } = useTina(props)
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}

export const getServerSideProps = async ({
  params,
}: {
  params: { collection: string; filename: string }
}) => {
  const collections = await client.queries.CollectionQuery()
  const collection = collections.data.collections.find(
    ({ name }) => name === params.collection
  )
  const variables = {
    collection: params.collection,
    relativePath: `${params.filename}.${collection.format}`,
  }
  const props = await client.queries.DocumentQuery(variables)
  return {
    props: { ...props, variables },
  }
}
