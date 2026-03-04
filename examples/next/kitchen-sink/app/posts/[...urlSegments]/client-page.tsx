'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { sanitizeImageSrc, titleColorClasses } from '@/lib/utils';
import { useTina } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { useLayout } from '@/components/layout/layout-context';
import { Section } from '@/components/layout/section';
import { Container } from '@/components/layout/container';
import { customComponents } from '@/components/markdown-components';

interface PostClientPageProps {
  data: any;
  variables: any;
  query: string;
  formattedDate?: string;
}

export default function PostClientPage(props: PostClientPageProps) {
  const { theme } = useLayout();
  const { data } = useTina({ ...props });
  const post = data.post;

  if (!post) {
    return (
      <div className='py-12 px-6 text-center text-gray-600 dark:text-gray-400'>
        No post found
      </div>
    );
  }

  const formattedDate = props.formattedDate ?? '';
  const titleColour = titleColorClasses[theme.color] || titleColorClasses.blue;

  // Derive author page URL from the author reference
  const authorFilename = post.author?._sys?.filename;

  return (
    <Section className='flex-1'>
      <Container width='small' className='flex-1 pb-2' size='large'>
        <h2 className='w-full relative mb-8 text-6xl font-extrabold tracking-normal text-center title-font'>
          <span
            className={`bg-clip-text text-transparent bg-gradient-to-r ${titleColour}`}
          >
            {post.title}
          </span>
        </h2>
        <div className='flex items-center justify-center mb-16'>
          {post.author && (
            <>
              {post.author.avatar && (
                <div className='flex-shrink-0 mr-4'>
                  <Image
                    width={56}
                    height={56}
                    className='object-cover rounded-full shadow-sm'
                    src={sanitizeImageSrc(post.author.avatar)}
                    alt={post.author.name || ''}
                  />
                </div>
              )}
              {authorFilename ? (
                <Link
                  href={`/authors/${authorFilename}`}
                  className='text-base font-medium text-gray-600 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-300 transition-colors underline-offset-2 hover:underline'
                >
                  {post.author.name}
                </Link>
              ) : (
                <p className='text-base font-medium text-gray-600 dark:text-gray-200'>
                  {post.author.name}
                </p>
              )}
              <span className='font-bold text-gray-200 dark:text-gray-500 mx-2'>
                —
              </span>
            </>
          )}
          <p className='text-base text-gray-400 dark:text-gray-300'>
            {formattedDate}
          </p>
        </div>
      </Container>
      {post.heroImg && (
        <div className='px-4 w-full'>
          <div className='relative max-w-2xl mx-auto'>
            <Image
              src={sanitizeImageSrc(post.heroImg)}
              alt={post.title}
              width={600}
              height={400}
              priority
              className='mb-14 block rounded-lg w-full h-auto'
            />
          </div>
        </div>
      )}
      <Container className='flex-1 pt-4' width='small' size='large'>
        <div className='prose dark:prose-dark w-full max-w-none'>
          <TinaMarkdown components={customComponents} content={post._body} />
        </div>
      </Container>
    </Section>
  );
}
