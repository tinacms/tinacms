import React from 'react';
import Link from 'next/link';
import client from '../../tina/__generated__/client';
import { cardLinkClasses } from '@/lib/utils';
import { PageSection } from '@/components/layout/page-section';

export const revalidate = 300;

export default async function TagsPage() {
  const connection = await client.queries.tagConnection();
  const tags = connection.data.tagConnection.edges ?? [];

  return (
    <PageSection title='Tags'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {tags.map((edge: any) => (
          <Link
            key={edge.node._sys.filename}
            href={`/tags/${edge.node._sys.filename}`}
            className={`${cardLinkClasses} p-6`}
          >
            <h2 className='text-lg font-semibold text-gray-700 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-all duration-150'>
              {edge.node.name || edge.node.title}
            </h2>
          </Link>
        ))}
      </div>
    </PageSection>
  );
}
