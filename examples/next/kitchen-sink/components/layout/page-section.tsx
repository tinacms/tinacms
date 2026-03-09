import React from 'react';

/**
 * Lightweight server-compatible wrapper used by listing pages (authors, tags, etc.)
 * Mirrors the default Section + Container styles without requiring client-side context.
 */
export function PageSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className='flex-1 relative transition duration-150 ease-out body-font overflow-hidden text-gray-800 dark:text-gray-50 bg-gradient-to-tl from-gray-50 dark:from-gray-900 via-transparent to-transparent'>
      <div className='max-w-5xl mx-auto px-6 sm:px-8 py-24'>
        <h1 className='text-4xl font-extrabold tracking-tight mb-12 text-center title-font'>
          {title}
        </h1>
        {children}
      </div>
    </section>
  );
}
