import React from 'react'
import client from '../../../tina/__generated__/client'
import DocumentationClientPage from './client-page'

type Props = { params: Promise<{ filename: string[] }> }

export async function generateStaticParams() {
  const pages = await client.queries.documentationConnection()
  const paths = pages.data?.documentationConnection?.edges?.flatMap((edge) => {
    const breadcrumbs = edge?.node?._sys?.breadcrumbs
    return breadcrumbs ? [{ filename: breadcrumbs }] : []
  })

  return paths || []
}

export default async function DocFile({ params }: Props) {
  const { filename } = await params
  const parts = filename || []
  const relativePath = `${parts.join('/')}.md`
  const tinaProps = await client.queries.documentation({ relativePath })

  return (
    <DocumentationClientPage
      query={tinaProps.query}
      variables={tinaProps.variables}
      data={JSON.parse(JSON.stringify(tinaProps.data))}
    />
  )
}
