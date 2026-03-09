'use client';
import Image from 'next/image';
import { useTina } from 'tinacms/dist/react';
import { sanitizeImageSrc } from '@/lib/utils';
import type { TinaPageProps } from '@/lib/types';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { customComponents } from '@/components/markdown-components';
import { Section } from '@/components/layout/section';
import { Container } from '@/components/layout/container';
import { GradientTitle } from '@/components/ui/gradient-title';
import { NoData } from '@/components/ui/no-data';

type BlogClientProps = TinaPageProps & {
  formattedPubDate?: string;
  formattedUpdatedDate?: string;
};

export default function BlogClientPage(props: BlogClientProps) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });

  if (data?.blog) {
    const formattedDate = props.formattedPubDate ?? '';
    const formattedUpdatedDate = props.formattedUpdatedDate ?? '';

    return (
      <Section className='flex-1'>
        <Container width='small' size='large'>
          <GradientTitle>{data.blog.title}</GradientTitle>

          {data.blog.description && (
            <p className='text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6 text-center'>
              {data.blog.description}
            </p>
          )}

          <div className='flex items-center justify-center gap-3 mb-16'>
            {data.blog.author?.avatar && (
              <Image
                src={sanitizeImageSrc(data.blog.author.avatar)}
                alt={data.blog.author?.name || ''}
                width={40}
                height={40}
                className='rounded-full object-cover flex-shrink-0 shadow-sm'
              />
            )}
            <div className='flex flex-col items-start'>
              {data.blog.author?.name && (
                <span className='text-sm font-medium text-gray-700 dark:text-gray-200'>
                  {data.blog.author.name}
                </span>
              )}
              <div className='flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500'>
                {formattedDate && <span>Published {formattedDate}</span>}
                {formattedUpdatedDate &&
                  formattedUpdatedDate !== formattedDate && (
                    <>
                      <span className='text-gray-200 dark:text-gray-700'>
                        ·
                      </span>
                      <span>Updated {formattedUpdatedDate}</span>
                    </>
                  )}
              </div>
            </div>
          </div>
        </Container>

        {data.blog.heroImage && (
          <div className='px-4 w-full'>
            <div className='relative max-w-2xl mx-auto'>
              <Image
                src={sanitizeImageSrc(data.blog.heroImage)}
                alt={data.blog.title}
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
            <TinaMarkdown
              components={customComponents}
              content={data.blog._body}
            />
          </div>
        </Container>
      </Section>
    );
  }

  return <NoData message='No blog post found' />;
}
