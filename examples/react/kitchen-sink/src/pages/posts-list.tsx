import React from 'react';
import { Link } from 'react-router-dom';
import {
  sanitizeImageSrc,
  cardLinkClasses,
  cn,
  formatDate,
} from '@/src/lib/utils';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { BiRightArrowAlt } from 'react-icons/bi';
import { Section } from '@/src/components/layout/section';
import { Container } from '@/src/components/layout/container';
import { Loading } from '@/src/loading';
import { useCallback } from 'react';
import { useTinaQuery } from '@/src/hooks/use-tina-query';
import client from '@/tina/__generated__/client';

export default function PostsList() {
  const queryFn = useCallback(
    () => client.queries.postConnection({ first: 1000 }),
    []
  );
  const result = useTinaQuery(queryFn);

  if (result.loading) return <Loading />;
  if (result.error || !result.data)
    return (
      <div className='py-12 text-center text-gray-500'>No posts found</div>
    );

  const posts = (result.data?.postConnection?.edges ?? []).flatMap(
    (edge: any) => (edge?.node ? [edge.node] : [])
  );

  return (
    <Section className='flex-1'>
      <Container size='large' width='small'>
        <h2 className='text-4xl font-extrabold tracking-tight mb-12 text-center title-font text-gray-800 dark:text-gray-50'>
          Posts
        </h2>
        {posts.map((post: any) => {
          const formattedDate = post.date ? formatDate(post.date) : '';
          const postUrl = `/posts/${post?._sys.breadcrumbs?.join('/') || post?._sys.filename}`;
          const avatarSrc = post.author?.avatar
            ? sanitizeImageSrc(post.author.avatar)
            : '';

          return (
            <Link
              key={post._sys.filename}
              to={postUrl}
              data-testid={`post-card-${post._sys.filename}`}
              className={cn(
                cardLinkClasses,
                'px-6 sm:px-8 md:px-10 py-10 mb-8 last:mb-0'
              )}
            >
              <h3 className='bg-gradient-to-r bg-clip-text text-transparent from-theme-400 to-theme-600 dark:from-theme-300 dark:to-theme-500 text-3xl lg:text-4xl font-semibold title-font mb-5 transition-all duration-150 ease-out'>
                {post.title}{' '}
                <span className='inline-block opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out'>
                  <BiRightArrowAlt className='inline-block h-8 -mt-1 ml-1 w-auto opacity-70' />
                </span>
              </h3>
              {post.excerpt && (
                <div className='prose dark:prose-dark w-full max-w-none mb-5 opacity-70'>
                  <TinaMarkdown content={post.excerpt} />
                </div>
              )}
              <div
                className='flex items-center'
                data-testid={`post-author-${post._sys.filename}`}
              >
                {avatarSrc && (
                  <div className='flex-shrink-0 mr-2'>
                    <img
                      width={40}
                      height={40}
                      className='object-cover rounded-full shadow-sm'
                      src={avatarSrc}
                      alt={post.author?.name || ''}
                    />
                  </div>
                )}
                {post.author?.name && (
                  <p className='text-base font-medium text-gray-600 group-hover:text-gray-800 dark:text-gray-200 dark:group-hover:text-white'>
                    {post.author.name}
                  </p>
                )}
                {formattedDate && (
                  <>
                    <span className='font-bold text-gray-200 dark:text-gray-500 mx-2'>
                      —
                    </span>
                    <p className='text-base text-gray-400 group-hover:text-gray-500 dark:text-gray-300 dark:group-hover:text-gray-150'>
                      {formattedDate}
                    </p>
                  </>
                )}
              </div>
            </Link>
          );
        })}
        {posts.length === 0 && (
          <p className='text-center text-gray-500 dark:text-gray-400 py-12'>
            No posts found.
          </p>
        )}
      </Container>
    </Section>
  );
}
