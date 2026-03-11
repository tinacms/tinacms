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
      className={`${sizeClasses} bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full`}
    >
      {children}
    </span>
  );
}
