import React from 'react'
import client from '../../../tina/__generated__/client'
import Layout from '@/components/layout/layout'
import TagClientPage from './client-page'

type Props = { params: Promise<{ filename: string }> }

export async function generateStaticParams() {
  const pages = await client.queries.tagConnection()
  const paths = pages.data?.tagConnection?.edges?.map((edge) => ({
    filename: edge?.node?._sys?.filename?.replace(/\.(md|mdx|json)$/, ''),
  }))

  return paths || []
}

export default async function TagFile({ params }: Props) {
  const { filename } = await params
  const relativePath = `${filename}.json`
  const tinaProps = await client.queries.tag({ relativePath })

  return (
    <Layout rawPageData={tinaProps}>
      <TagClientPage
        query={tinaProps.query}
        variables={tinaProps.variables}
        data={JSON.parse(JSON.stringify(tinaProps.data))}
      />
    </Layout>
  )
}
