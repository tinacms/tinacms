import React from 'react';
import { notFound } from 'next/navigation';
import client from '../../../tina/__generated__/client';

type Props = { params: Promise<{ filename: string[] }> };

export default async function NodeFile({ params }: Props) {
  const { filename } = await params;
  const parts = Array.isArray(filename) ? filename : [filename];
  const id = parts.join('/');

  let tinaProps;
  try {
    tinaProps = await client.queries.NodeQuery({ id });
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
