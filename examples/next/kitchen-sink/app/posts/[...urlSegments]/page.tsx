import React from 'react'
import client from '@/tina/__generated__/client'
import PostClientPage from './client-page'

export const revalidate = 300

import { formatDate } from '@/lib/utils'

export default async function PostPage({
  params,
}: {
  params: Promise<{ urlSegments: string[] }>
}) {
  const resolvedParams = await params
  const filepath = resolvedParams.urlSegments.join('/')
  const data = await client.queries.post({
    relativePath: `${filepath}.mdx`,
  })

  return (
    <PostClientPage {...data} formattedDate={formatDate(data.data?.post?.date)} />
  )
}

export async function generateStaticParams() {
  const allPosts = await client.queries.postConnection({ first: 1000 })

  const params =
    allPosts.data?.postConnection.edges?.map((edge: any) => ({
      urlSegments: edge?.node?._sys?.breadcrumbs,
    })) || []

  return params
}
