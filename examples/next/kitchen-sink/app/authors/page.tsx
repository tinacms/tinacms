import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import client from '../../tina/__generated__/client';
import { sanitizeImageSrc, cardLinkClasses } from '@/lib/utils';
import { PageSection } from '@/components/layout/page-section';
import { Badge } from '@/components/ui/badge';

export const revalidate = 300;

export default async function AuthorsPage() {
  const connection = await client.queries.authorConnection();
  const authors = connection.data.authorConnection.edges ?? [];

  return (
    <PageSection title='Authors'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        {authors.map((edge: any) => {
          const avatarSrc = edge.node.avatar ? sanitizeImageSrc(edge.node.avatar) : '';

          return (
            <Link
              key={edge.node._sys.filename}
              href={`/authors/${edge.node._sys.filename}`}
              className={`${cardLinkClasses} px-6 sm:px-8 py-8`}
            >
              <div className='flex items-center gap-4 mb-4'>
                {avatarSrc && (
                  <Image
                    src={avatarSrc}
                    alt={edge.node.name}
                    width={56}
                    height={56}
                    className='object-cover rounded-full shadow-sm'
                  />
                )}
                <h2 className='text-2xl font-semibold text-gray-700 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-all duration-150'>
                  {edge.node.name}
                </h2>
              </div>

              {edge.node.description && (
                <p className='text-gray-600 dark:text-gray-400 line-clamp-2 opacity-70'>
                  {edge.node.description}
                </p>
              )}

              {edge.node.hobbies && edge.node.hobbies.length > 0 && (
                <div className='mt-4 flex flex-wrap gap-2'>
                  {edge.node.hobbies.map((hobby: string, idx: number) => (
                    <Badge key={idx} size='sm'>
                      {hobby}
                    </Badge>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </PageSection>
  );
}
