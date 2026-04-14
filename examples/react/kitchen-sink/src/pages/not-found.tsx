import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center py-24 px-6 text-center'>
      <h1 className='text-6xl font-extrabold text-gray-800 dark:text-gray-50 mb-4'>
        404
      </h1>
      <p className='text-xl text-gray-600 dark:text-gray-400 mb-8'>
        Page not found
      </p>
      <Link
        to='/'
        className='px-6 py-3 bg-theme-500 text-white rounded-lg hover:bg-theme-600 transition-colors'
      >
        Go home
      </Link>
    </div>
  );
}
