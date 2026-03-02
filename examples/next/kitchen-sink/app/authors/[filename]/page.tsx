import React from 'react'
import client from '../../../tina/__generated__/client'
import Layout from '@/components/layout/layout'
import AuthorClientPage from './client-page'

type Props = { params: Promise<{ filename: string }> }

export async function generateStaticParams() {
  const pages = await client.queries.authorConnection()
  const paths = pages.data?.authorConnection?.edges?.map((edge) => ({
    filename: edge?.node?._sys?.filename?.replace(/\.(md|mdx|json)$/, ''),
  }))

  return paths || []
}

export default async function AuthorFile({ params }: Props) {
  const { filename } = await params
  const relativePath = `${filename}.md`
  const tinaProps = await client.queries.author({ relativePath })

  return (
    <Layout rawPageData={tinaProps}>
      <AuthorClientPage
        query={tinaProps.query}
        variables={tinaProps.variables}
        data={JSON.parse(JSON.stringify(tinaProps.data))}
      />
    </Layout>
  )
}
