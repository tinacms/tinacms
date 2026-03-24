import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { customComponents } from '@/components/markdown-components';
import { GradientTitle } from '@/components/ui/gradient-title';
import { NoData } from '@/components/ui/no-data';
import type { TinaPageProps } from '@/lib/types';
import { sanitizeImageSrc } from '@/lib/utils';
import React from 'react';
import { tinaField, useTina } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';

interface BlogDetailProps extends TinaPageProps<any> {
  formattedPubDate?: string;
  formattedUpdatedDate?: string;
}

export default function BlogDetail(props: BlogDetailProps) {
  const { data } = useTina({ ...props });
  const blog = data.blog;

  if (!blog) {
    return <NoData message='No blog post found' />;
  }

  const formattedDate = props.formattedPubDate ?? '';
  const formattedUpdatedDate = props.formattedUpdatedDate ?? '';
  const avatarSrc = blog.author?.avatar
    ? sanitizeImageSrc(blog.author.avatar)
    : '';
  const heroSrc = blog.heroImage ? sanitizeImageSrc(blog.heroImage) : '';

  return (
    <Section className='flex-1'>
      <Container width='small' size='large'>
        <GradientTitle data-tina-field={tinaField(blog, 'title')}>
          {blog.title}
        </GradientTitle>

        {blog.description && (
          <p
            className='text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6 text-center'
            data-tina-field={tinaField(blog, 'description')}
          >
            {blog.description}
          </p>
        )}

        <div
          className='flex items-center justify-center gap-3 mb-16'
          data-tina-field={tinaField(blog, 'author')}
        >
          {avatarSrc && (
            <img
              src={avatarSrc}
              alt={blog.author?.name || ''}
              width={40}
              height={40}
              className='rounded-full object-cover flex-shrink-0 shadow-sm'
            />
          )}
          <div className='flex flex-col items-start'>
            {blog.author?.name && (
              <span className='text-sm font-medium text-gray-700 dark:text-gray-200'>
                {blog.author.name}
              </span>
            )}
            <div className='flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500'>
              {formattedDate && (
                <span data-tina-field={tinaField(blog, 'pubDate')}>
                  Published {formattedDate}
                </span>
              )}
              {formattedUpdatedDate &&
                formattedUpdatedDate !== formattedDate && (
                  <>
                    <span className='text-gray-200 dark:text-gray-700'>·</span>
                    <span data-tina-field={tinaField(blog, 'updatedDate')}>
                      Updated {formattedUpdatedDate}
                    </span>
                  </>
                )}
            </div>
          </div>
        </div>
      </Container>

      {heroSrc && (
        <div
          className='px-4 w-full'
          data-tina-field={tinaField(blog, 'heroImage')}
        >
          <div className='relative max-w-2xl mx-auto'>
            <img
              src={heroSrc}
              alt={blog.title}
              width={600}
              height={400}
              className='mb-14 block rounded-lg w-full h-auto'
            />
          </div>
        </div>
      )}

      <Container className='flex-1 pt-4' width='small' size='large'>
        <div
          className='prose dark:prose-dark w-full max-w-none'
          data-tina-field={tinaField(blog, '_body')}
        >
          <TinaMarkdown components={customComponents} content={blog._body} />
        </div>
      </Container>
    </Section>
  );
}
