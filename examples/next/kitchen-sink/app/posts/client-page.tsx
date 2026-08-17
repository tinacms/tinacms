'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { sanitizeImageSrc, cardLinkClasses, cn } from '@/lib/utils';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { BiRightArrowAlt } from 'react-icons/bi';
import { Section } from '@/components/layout/section';
import { Container } from '@/components/layout/container';
import type {
  PostConnectionQuery,
  PostConnectionQueryVariables,
} from '@/tina/__generated__/types';

// Server-side pre-formats dates before passing to this client component
type PostNode = NonNullable<
  NonNullable<PostConnectionQuery['postConnection']['edges']>[number]
>['node'] & { formattedDate?: string };

interface PostsClientPageProps {
  data: PostConnectionQuery;
  variables?: PostConnectionQueryVariables;
  query?: string;
}

export default function PostsClientPage(props: PostsClientPageProps) {
  const posts = (props.data?.postConnection?.edges ?? []).flatMap(
    (edge): PostNode[] => (edge?.node ? [edge.node as PostNode] : [])
  );

  return (
    <Section className='flex-1'>
      <Container size='large' width='small'>
        <h2 className='text-4xl font-extrabold tracking-tight mb-12 text-center title-font text-gray-800 dark:text-gray-50'>
          Posts
        </h2>
        {posts.map((post) => {
          const formattedDate = post.formattedDate ?? '';
          const postUrl = `/posts/${post?._sys.breadcrumbs?.join('/') || post?._sys.filename}`;
          const avatarSrc = post.author?.avatar
            ? sanitizeImageSrc(post.author.avatar)
            : '';

          return (
            <Link
              key={post._sys.filename}
              href={postUrl}
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
                    <Image
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
