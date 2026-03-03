import React from 'react'
import { notFound } from 'next/navigation'
import client from '@/tina/__generated__/client'
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
    <ClientPage {...data} />
  )
}

export async function generateStaticParams() {
  const allPages = await client.queries.pageConnection({ first: 1000 })

  const params = (allPages.data?.pageConnection.edges ?? [])
    .map((edge: any) => ({
      urlSegments: edge?.node?._sys.breadcrumbs || [],
    }))
    .filter((x: any) => x.urlSegments.length >= 1)
    .filter((x: any) => !x.urlSegments.every((s: string) => s === 'home'))

  return params
}
