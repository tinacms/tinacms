import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='min-h-[50vh] flex flex-col items-center justify-center gap-4 px-6 py-24'>
      <h1 className='text-6xl font-bold tracking-tight text-gray-900 dark:text-gray-100'>
        404
      </h1>
      <p className='text-xl text-gray-600 dark:text-gray-400'>
        Not found — the page you requested could not be located.
      </p>
      <Link
        href='/'
        className='mt-4 rounded-md bg-theme-500 px-5 py-2 text-white font-medium hover:bg-theme-600 transition'
      >
        Return home
      </Link>
    </div>
  );
}
