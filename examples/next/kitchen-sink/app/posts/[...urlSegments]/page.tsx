import React from 'react';
import { notFound } from 'next/navigation';
import client from '@/tina/__generated__/client';
import PostClientPage from './client-page';

export const revalidate = 300;

import { formatDate } from '@/lib/utils';

export default async function PostPage({
  params,
}: {
  params: Promise<{ urlSegments: string[] }>;
}) {
  const resolvedParams = await params;
  const filepath = resolvedParams.urlSegments.join('/');

  let data: Awaited<ReturnType<typeof client.queries.post>>;
  try {
    data = await client.queries.post({ relativePath: `${filepath}.md` });
  } catch {
    notFound();
  }

  return (
    <PostClientPage
      {...data}
      formattedDate={formatDate(data.data?.post?.date)}
    />
  );
}

export async function generateStaticParams() {
  const allPosts = await client.queries.postConnection({ first: 1000 });

  const params =
    allPosts.data?.postConnection.edges?.flatMap((edge) => {
      const crumbs = edge?.node?._sys?.breadcrumbs;
      if (!Array.isArray(crumbs) || crumbs.length === 0) return [];
      return [{ urlSegments: crumbs as string[] }];
    }) || [];

  return params;
}
