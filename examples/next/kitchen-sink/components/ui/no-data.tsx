/**
 * Fallback displayed when a detail page has no data.
 */
export function NoData({ message = 'No data' }: { message?: string }) {
  return (
    <div className='py-12 px-6 text-center text-gray-500 dark:text-gray-400'>
      {message}
    </div>
  );
}
