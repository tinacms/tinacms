'use client';

import { titleColorClasses } from '@/lib/utils';
import { useLayout } from '@/components/layout/layout-context';

/**
 * Themed gradient heading used on detail pages (authors, blogs, posts, etc.).
 * Centralises the repeated h1/h2 + gradient-text pattern.
 */
export function GradientTitle({
  children,
  size = '6xl',
  as: Tag = 'h1',
  className = '',
}: {
  children: React.ReactNode;
  size?: '5xl' | '6xl';
  as?: 'h1' | 'h2';
  className?: string;
}) {
  const { theme } = useLayout();
  const sizeClasses = size === '5xl' ? 'text-5xl' : 'text-6xl';
  return (
    <Tag
      className={`w-full relative mb-8 ${sizeClasses} font-extrabold tracking-normal text-center title-font ${className}`}
    >
      <span
        className={`bg-clip-text text-transparent bg-gradient-to-r ${titleColorClasses[theme.color] || titleColorClasses.blue}`}
      >
        {children}
      </span>
    </Tag>
  );
}
