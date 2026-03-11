import React from 'react';
import Link from 'next/link';
import client from '../../tina/__generated__/client';
import { cardLinkClasses } from '@/lib/utils';
import { PageSection } from '@/components/layout/page-section';

export const revalidate = 300;

export default async function DocumentationPage() {
  const connection = await client.queries.documentationConnection();
  const docs = (connection.data.documentationConnection.edges ?? []).flatMap(
    (edge) => (edge?.node ? [edge.node] : [])
  );

  return (
    <PageSection title='Documentation'>
      <div className='space-y-6'>
        {docs.map((doc) => (
          <Link
            key={doc._sys.filename}
            href={`/documentation/${doc._sys.breadcrumbs?.join('/') || doc._sys.filename}`}
            className={`${cardLinkClasses} px-6 sm:px-8 py-8`}
          >
            <h2 className='text-2xl font-semibold text-gray-700 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-all duration-150 title-font'>
              {doc.title || doc._sys.filename}
            </h2>
          </Link>
        ))}
      </div>
    </PageSection>
  );
}
