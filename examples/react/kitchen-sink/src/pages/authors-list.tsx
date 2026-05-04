import React from 'react';
import { Link } from 'react-router-dom';
import { cn, sanitizeImageSrc, cardLinkClasses } from '@/src/lib/utils';
import { PageSection } from '@/src/components/layout/page-section';
import { Badge } from '@/src/components/ui/badge';
import { Loading } from '@/src/loading';
import { useCallback } from 'react';
import { useTinaQuery } from '@/src/hooks/use-tina-query';
import client from '@/tina/__generated__/client';

export default function AuthorsList() {
  const queryFn = useCallback(() => client.queries.authorConnection(), []);
  const result = useTinaQuery(queryFn);

  if (result.loading) return <Loading />;
  if (result.error || !result.data)
    return (
      <div className='py-12 text-center text-gray-500'>No authors found</div>
    );

  const authors = (result.data?.authorConnection?.edges ?? []).flatMap(
    (edge: any) => (edge?.node ? [edge.node] : [])
  );

  return (
    <PageSection title='Authors'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        {authors.map((author: any) => {
          const avatarSrc = author.avatar
            ? sanitizeImageSrc(author.avatar)
            : '';

          return (
            <Link
              key={author._sys.filename}
              to={`/authors/${author._sys.filename}`}
              className={cn(cardLinkClasses, 'px-6 sm:px-8 py-8')}
            >
              <div className='flex items-center gap-4 mb-4'>
                {avatarSrc && (
                  <img
                    src={avatarSrc}
                    alt={author.name ?? ''}
                    width={56}
                    height={56}
                    className='object-cover rounded-full shadow-sm'
                  />
                )}
                <h2 className='text-2xl font-semibold text-gray-700 dark:text-white group-hover:text-theme-600 dark:group-hover:text-theme-300 transition-all duration-150'>
                  {author.name}
                </h2>
              </div>

              {author.description && (
                <p className='text-gray-600 dark:text-gray-400 line-clamp-2 opacity-70'>
                  {author.description}
                </p>
              )}

              {author.hobbies && author.hobbies.length > 0 && (
                <div className='mt-4 flex flex-wrap gap-2'>
                  {author.hobbies.map((hobby: string | null, idx: number) =>
                    hobby ? (
                      <Badge key={idx} size='sm'>
                        {hobby}
                      </Badge>
                    ) : null
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </PageSection>
  );
}
