import { cn } from '@/lib/utils';

/**
 * Themed gradient heading used on detail pages (authors, blogs, posts, etc.).
 * Centralises the repeated h1/h2 + gradient-text pattern.
 */
export function GradientTitle({
  children,
  size = '6xl',
  as: Tag = 'h1',
  className = '',
  ...rest
}: {
  children: React.ReactNode;
  size?: '5xl' | '6xl';
  as?: 'h1' | 'h2';
  className?: string;
} & React.HTMLAttributes<HTMLHeadingElement>) {
  const sizeClasses = size === '5xl' ? 'text-5xl' : 'text-6xl';
  return (
    <Tag
      className={cn(
        'w-full relative mb-8 font-extrabold tracking-normal text-center title-font',
        sizeClasses,
        className
      )}
      {...rest}
    >
      <span className='bg-clip-text text-transparent bg-gradient-to-r from-theme-400 to-theme-600 dark:from-theme-300 dark:to-theme-500'>
        {children}
      </span>
    </Tag>
  );
}
