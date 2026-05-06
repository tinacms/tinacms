import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, sanitizeImageSrc } from '@/src/lib/utils';
import { PageSection } from '@/src/components/layout/page-section';
import { Loading } from '@/src/loading';
import { useCallback } from 'react';
import { useTinaQuery } from '@/src/hooks/use-tina-query';
import client from '@/tina/__generated__/client';

export default function BlogList() {
  const queryFn = useCallback(() => client.queries.blogConnection(), []);
  const result = useTinaQuery(queryFn);

  if (result.loading) return <Loading />;
  if (result.error || !result.data)
    return (
      <div className='py-12 text-center text-gray-500'>No blogs found</div>
    );

  const blogs = (result.data?.blogConnection?.edges ?? []).flatMap(
    (edge: any) => (edge?.node ? [edge.node] : [])
  );

  return (
    <PageSection title='Blog'>
      <div className='grid gap-8 md:grid-cols-2'>
        {blogs.map((blog: any) => {
          const href = `/blog/${blog._sys.filename}`;
          const formattedDate = blog.pubDate ? formatDate(blog.pubDate) : '';
          const heroSrc = blog.heroImage
            ? sanitizeImageSrc(blog.heroImage)
            : '';
          const avatarSrc = blog.author?.avatar
            ? sanitizeImageSrc(blog.author.avatar)
            : '';

          return (
            <Link
              key={blog._sys.filename}
              to={href}
              data-testid={`blog-card-${blog._sys.filename}`}
              className='group flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow'
            >
              {heroSrc && (
                <div className='relative w-full h-48 overflow-hidden'>
                  <img
                    src={heroSrc}
                    alt={blog.title}
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                  />
                </div>
              )}
              <div className='p-6 flex flex-col flex-1'>
                <h2 className='text-xl font-bold text-gray-900 dark:text-gray-50 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors mb-2'>
                  {blog.title}
                </h2>
                {blog.description && (
                  <p className='text-gray-600 dark:text-gray-400 text-sm line-clamp-3 flex-1'>
                    {blog.description}
                  </p>
                )}
                <div
                  className='flex items-center mt-4 gap-2'
                  data-testid={`blog-author-${blog._sys.filename}`}
                >
                  {avatarSrc && (
                    <img
                      src={avatarSrc}
                      alt={blog.author?.name || ''}
                      width={28}
                      height={28}
                      className='rounded-full object-cover flex-shrink-0'
                    />
                  )}
                  {blog.author?.name && (
                    <span className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                      {blog.author.name}
                    </span>
                  )}
                  {blog.author?.name && formattedDate && (
                    <span className='text-gray-300 dark:text-gray-600'>·</span>
                  )}
                  {formattedDate && (
                    <span className='text-xs text-gray-400 dark:text-gray-500'>
                      {formattedDate}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </PageSection>
  );
}
