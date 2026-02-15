import React from 'react'
import client from '../../../tina/__generated__/client'
import SSGPostClientPage from './client-page'

type Props = { params: Promise<{ filename: string }> }

export async function generateStaticParams() {
  const pages = await client.queries.ssgPostConnection()
  const paths = pages.data?.ssgPostConnection?.edges?.map((edge) => ({
    filename: edge?.node?._sys?.filename?.replace(/\.(md|mdx)$/, ''),
  }))

  return paths || []
}

export default async function SSGPostFile({ params }: Props) {
  const { filename } = await params
  const relativePath = `${filename}.md`
  const tinaProps = await client.queries.ssgPost({ relativePath })

  return <SSGPostClientPage {...tinaProps} />
}
