import React from 'react';
import client from '../../../tina/__generated__/client';
import AuthorClientPage from './client-page';

type Props = { params: Promise<{ filename: string }> };

export const revalidate = 300;

export async function generateStaticParams() {
  const pages = await client.queries.authorConnection();
  const paths =
    pages.data?.authorConnection?.edges?.flatMap((edge: any) => {
      const raw = edge?.node?._sys?.filename;
      if (typeof raw !== 'string') return [];
      const filename = raw.replace(/\.(md|mdx|json)$/, '');
      if (filename.length === 0) return [];
      return [{ filename }];
    }) || [];

  return paths;
}

export default async function AuthorFile({ params }: Props) {
  const { filename } = await params;
  const relativePath = `${filename}.md`;
  const tinaProps = await client.queries.author({ relativePath });

  return (
    <AuthorClientPage
      query={tinaProps.query}
      variables={tinaProps.variables}
      data={JSON.parse(JSON.stringify(tinaProps.data))}
    />
  );
}
