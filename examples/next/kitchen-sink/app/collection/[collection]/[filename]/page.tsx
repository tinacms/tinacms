import React from 'react';
import { notFound } from 'next/navigation';
import client from '../../../../tina/__generated__/client';

type Props = { params: Promise<{ collection: string; filename: string }> };

export default async function CollectionFile({ params }: Props) {
  if (process.env.NODE_ENV === 'production') {
    // Prevent accidental public data exposure from debug endpoint in production
    notFound();
  }
  const { collection, filename } = await params;
  const relativePath = `${filename}.mdx`;

  let tinaProps;
  try {
    tinaProps = await client.queries.DocumentQuery({
      collection,
      relativePath,
    });
  } catch {
    notFound();
  }

  return (
    <main className='py-12 px-6'>
      <div className='max-w-5xl mx-auto'>
        <pre className='bg-gray-100 p-4 rounded overflow-auto'>
          {JSON.stringify(tinaProps.data, null, 2)}
        </pre>
      </div>
    </main>
  );
}
