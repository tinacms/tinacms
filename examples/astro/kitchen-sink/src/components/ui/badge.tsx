import { cn } from '@/lib/utils';

/**
 * Small pill badge for tags, hobbies, and similar lists.
 */
export function Badge({
  children,
  size = 'md',
}: {
  children: React.ReactNode;
  size?: 'sm' | 'md';
}) {
  const sizeClasses = size === 'sm' ? 'text-sm px-2 py-1' : 'px-3 py-1';
  return (
    <span
      className={cn(
        sizeClasses,
        'bg-theme-50 dark:bg-theme-700/20 text-theme-700 dark:text-theme-200 rounded-full'
      )}
    >
      {children}
    </span>
  );
}
