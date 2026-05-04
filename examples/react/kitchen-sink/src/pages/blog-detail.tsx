import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { sanitizeImageSrc, formatDate } from '@/src/lib/utils';
import { useTina, tinaField } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { customComponents } from '@/src/components/markdown-components';
import { Section } from '@/src/components/layout/section';
import { Container } from '@/src/components/layout/container';
import { GradientTitle } from '@/src/components/ui/gradient-title';
import { NoData } from '@/src/components/ui/no-data';
import { Loading } from '@/src/loading';
import { useTinaQuery } from '@/src/hooks/use-tina-query';
import client from '@/tina/__generated__/client';

export default function BlogDetail() {
  const { filename } = useParams<{ filename: string }>();
  const relativePath = `${filename}.md`;

  const queryFn = useCallback(
    () => client.queries.blog({ relativePath }),
    [relativePath]
  );
  const result = useTinaQuery(queryFn);

  if (result.loading) return <Loading />;
  if (result.error || !result.data)
    return <NoData message='Blog post not found' />;

  return (
    <BlogClient
      data={result.data}
      query={result.query}
      variables={result.variables}
    />
  );
}

function BlogClient(props: {
  data: any;
  query: string;
  variables: Record<string, unknown>;
}) {
  const { data } = useTina({ ...props });

  if (!data?.blog) return <NoData message='No blog post found' />;

  const formattedDate = data.blog.pubDate ? formatDate(data.blog.pubDate) : '';
  const formattedUpdatedDate = data.blog.updatedDate
    ? formatDate(data.blog.updatedDate)
    : '';
  const avatarSrc = data.blog.author?.avatar
    ? sanitizeImageSrc(data.blog.author.avatar)
    : '';
  const heroSrc = data.blog.heroImage
    ? sanitizeImageSrc(data.blog.heroImage)
    : '';

  return (
    <Section className='flex-1'>
      <Container width='small' size='large'>
        <GradientTitle data-tina-field={tinaField(data.blog, 'title')}>
          {data.blog.title}
        </GradientTitle>

        {data.blog.description && (
          <p
            className='text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6 text-center'
            data-tina-field={tinaField(data.blog, 'description')}
          >
            {data.blog.description}
          </p>
        )}

        <div
          className='flex items-center justify-center gap-3 mb-16'
          data-tina-field={tinaField(data.blog, 'author')}
        >
          {avatarSrc && (
            <img
              src={avatarSrc}
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
              {formattedDate && (
                <span data-tina-field={tinaField(data.blog, 'pubDate')}>
                  Published {formattedDate}
                </span>
              )}
              {formattedUpdatedDate &&
                formattedUpdatedDate !== formattedDate && (
                  <>
                    <span className='text-gray-200 dark:text-gray-700'>·</span>
                    <span data-tina-field={tinaField(data.blog, 'updatedDate')}>
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
          data-tina-field={tinaField(data.blog, 'heroImage')}
        >
          <div className='relative max-w-2xl mx-auto'>
            <img
              src={heroSrc}
              alt={data.blog.title}
              className='mb-14 block rounded-lg w-full h-auto'
            />
          </div>
        </div>
      )}

      <Container className='flex-1 pt-4' width='small' size='large'>
        <div
          className='prose dark:prose-dark w-full max-w-none'
          data-tina-field={tinaField(data.blog, '_body')}
        >
          <TinaMarkdown
            components={customComponents}
            content={data.blog._body}
          />
        </div>
      </Container>
    </Section>
  );
}
