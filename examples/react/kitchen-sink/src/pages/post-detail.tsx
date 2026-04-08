import React, { useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { sanitizeImageSrc, formatDate } from '@/src/lib/utils';
import { useTina, tinaField } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { Section } from '@/src/components/layout/section';
import { Container } from '@/src/components/layout/container';
import { customComponents } from '@/src/components/markdown-components';
import { GradientTitle } from '@/src/components/ui/gradient-title';
import { NoData } from '@/src/components/ui/no-data';
import { Loading } from '@/src/loading';
import { useTinaQuery } from '@/src/hooks/use-tina-query';
import client from '@/tina/__generated__/client';

export default function PostDetail() {
  const location = useLocation();
  const segments = location.pathname.replace(/^\/posts\//, '').split('/').filter(Boolean);
  const filepath = segments.join('/');

  const queryFn = useCallback(
    () => client.queries.post({ relativePath: `${filepath}.md` }),
    [filepath]
  );
  const result = useTinaQuery(queryFn);

  if (result.loading) return <Loading />;
  if (result.error || !result.data) return <NoData message='Post not found' />;

  return <PostClient data={result.data} query={result.query} variables={result.variables} />;
}

function PostClient(props: { data: any; query: string; variables: Record<string, unknown> }) {
  const { data } = useTina({ ...props });
  const post = data.post;

  if (!post) return <NoData message='No post found' />;

  const formattedDate = post.date ? formatDate(post.date) : '';
  const authorFilename = post.author?._sys?.filename;
  const avatarSrc = post.author?.avatar ? sanitizeImageSrc(post.author.avatar) : '';
  const heroSrc = post.heroImg ? sanitizeImageSrc(post.heroImg) : '';

  return (
    <Section className='flex-1'>
      <Container width='small' className='flex-1 pb-2' size='large'>
        <GradientTitle as='h2' data-tina-field={tinaField(post, 'title')}>
          {post.title}
        </GradientTitle>
        <div
          className='flex items-center justify-center mb-16'
          data-tina-field={tinaField(post, 'author')}
        >
          {post.author && (
            <>
              {avatarSrc && (
                <div className='flex-shrink-0 mr-4'>
                  <img
                    width={56}
                    height={56}
                    className='object-cover rounded-full shadow-sm'
                    src={avatarSrc}
                    alt={post.author.name || ''}
                  />
                </div>
              )}
              {authorFilename ? (
                <Link
                  to={`/authors/${authorFilename}`}
                  className='text-base font-medium text-gray-600 hover:text-theme-600 dark:text-gray-200 dark:hover:text-theme-300 transition-colors underline-offset-2 hover:underline'
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
          <p
            className='text-base text-gray-400 dark:text-gray-300'
            data-tina-field={tinaField(post, 'date')}
          >
            {formattedDate}
          </p>
        </div>
      </Container>
      {heroSrc && (
        <div
          className='px-4 w-full'
          data-tina-field={tinaField(post, 'heroImg')}
        >
          <div className='relative max-w-2xl mx-auto'>
            <img
              src={heroSrc}
              alt={post.title}
              className='mb-14 block rounded-lg w-full h-auto'
            />
          </div>
        </div>
      )}
      <Container className='flex-1 pt-4' width='small' size='large'>
        <div
          className='prose dark:prose-dark w-full max-w-none'
          data-tina-field={tinaField(post, '_body')}
        >
          <TinaMarkdown components={customComponents} content={post._body} />
        </div>
      </Container>
    </Section>
  );
}
