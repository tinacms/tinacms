'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { sanitizeImageSrc, titleColorClasses } from '@/lib/utils';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { BiRightArrowAlt } from 'react-icons/bi';
import { useLayout } from '@/components/layout/layout-context';
import { Section } from '@/components/layout/section';
import { Container } from '@/components/layout/container';

interface PostsClientPageProps {
  data: any;
  variables?: any;
  query?: string;
}

export default function PostsClientPage(props: PostsClientPageProps) {
  const { theme } = useLayout();
  const posts = props.data?.postConnection?.edges || [];

  return (
    <Section className='flex-1'>
      <Container size='large' width='small'>
        <h2 className='text-4xl font-extrabold tracking-tight mb-12 text-center title-font text-gray-800 dark:text-gray-50'>
          Posts
        </h2>
        {posts.map((postData: any) => {
          const post = postData.node;
          const formattedDate = post.formattedDate || '';
          const postUrl = `/posts/${post._sys.breadcrumbs?.join('/') || post._sys.filename}`;

          return (
            <Link
              key={post._sys.filename}
              href={postUrl}
              data-testid={`post-card-${post._sys.filename}`}
              className='group block px-6 sm:px-8 md:px-10 py-10 mb-8 last:mb-0 bg-gray-50 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-1000 rounded shadow-sm transition-all duration-150 ease-out hover:shadow-md hover:to-gray-50 dark:hover:to-gray-800'
            >
              <h3
                className={`text-gray-700 dark:text-white text-3xl lg:text-4xl font-semibold title-font mb-5 transition-all duration-150 ease-out ${
                  titleColorClasses[theme.color] || titleColorClasses.blue
                }`}
              >
                {post._values?.title || post.title}{' '}
                <span className='inline-block opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out'>
                  <BiRightArrowAlt className='inline-block h-8 -mt-1 ml-1 w-auto opacity-70' />
                </span>
              </h3>
              {(post._values?.excerpt || post.excerpt) && (
                <div className='prose dark:prose-dark w-full max-w-none mb-5 opacity-70'>
                  <TinaMarkdown
                    content={post._values?.excerpt || post.excerpt}
                  />
                </div>
              )}
              <div
                className='flex items-center'
                data-testid={`post-author-${post._sys.filename}`}
              >
                {post.author?.avatar && (
                  <div className='flex-shrink-0 mr-2'>
                    <Image
                      width={40}
                      height={40}
                      className='object-cover rounded-full shadow-sm'
                      src={sanitizeImageSrc(post.author.avatar)}
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
