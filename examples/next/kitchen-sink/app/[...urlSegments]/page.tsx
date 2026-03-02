import React from 'react'
import { notFound } from 'next/navigation'
import client from '@/tina/__generated__/client'
import Layout from '@/components/layout/layout'
import ClientPage from './client-page'

export const revalidate = 300

export default async function Page({
  params,
}: {
  params: Promise<{ urlSegments: string[] }>
}) {
  const resolvedParams = await params
  const filepath = resolvedParams.urlSegments.join('/')

  let data
  try {
    data = await client.queries.page({
      relativePath: `${filepath}.mdx`,
    })
  } catch (error) {
    notFound()
  }

  return (
    <Layout rawPageData={data}>
      <ClientPage {...data} />
    </Layout>
  )
}

export async function generateStaticParams() {
  let pages = await client.queries.pageConnection()
  const allPages = pages

  if (!allPages.data.pageConnection.edges) {
    return []
  }

  while (pages.data.pageConnection.pageInfo.hasNextPage) {
    pages = await client.queries.pageConnection({
      after: pages.data.pageConnection.pageInfo.endCursor,
    })

    if (!pages.data.pageConnection.edges) {
      break
    }

    allPages.data.pageConnection.edges.push(...pages.data.pageConnection.edges)
  }

  const params = allPages.data?.pageConnection.edges
    .map((edge: any) => ({
      urlSegments: edge?.node?._sys.breadcrumbs || [],
    }))
    .filter((x: any) => x.urlSegments.length >= 1)
    .filter((x: any) => !x.urlSegments.every((s: string) => s === 'home'))

  return params
}
