import React from 'react';
import { LeftArrowIcon } from '@toolkit/icons';
import { IconButton } from '@toolkit/styles';
import { cn } from '@utils/cn';

// Fixed issue where dirname was being used in the frontend
function dirname(path): string | undefined {
  const pattern = new RegExp('(?<prevDir>.*)/');
  return path.match(pattern)?.groups?.prevDir;
}

interface BreadcrumbProps {
  directory?: string;
  setDirectory: (_directory: string) => void;
}

const BreadcrumbButton = ({ className = '', ...props }) => (
  <button
    className={cn(
      'capitalize transition-colors duration-150 border-0 bg-transparent hover:text-blue-500',
      className
    )}
    {...props}
  />
);

const BreadcrumbItem = ({ className = '', ...props }) => (
  <p className={cn('capitalize', className)} {...props} />
);

export function Breadcrumb({ directory = '', setDirectory }: BreadcrumbProps) {
  const directoryParts = directory.split('/');

  let prevDir: string = dirname(directory) || '';
  if (prevDir === '.') {
    prevDir = '';
  }

  return (
    <div className='w-full flex items-center text-[16px] text-gray-300'>
      {directoryParts.length > 1 && (
        <IconButton
          variant='ghost'
          className='mr-2'
          onClick={() => setDirectory(prevDir)}
        >
          <LeftArrowIcon
            className={`w-7 h-auto fill-gray-300 hover:fill-gray-900 transition duration-150 ease-out`}
          />
        </IconButton>
      )}
      {directoryParts.map((part, index) => {
        return directoryParts.length === index + 1 ? (
          <BreadcrumbItem
            key={index}
            className='pl-1.5 font-bold text-gray-500'
          >
            {part === '' ? 'Media' : part}
          </BreadcrumbItem>
        ) : (
          <>
            <BreadcrumbButton
              key={index}
              onClick={() =>
                setDirectory(directoryParts.slice(0, index + 1).join('/'))
              }
              className='pl-1.5 text-gray-300'
            >
              {part === '' ? 'Media' : part}
            </BreadcrumbButton>
            <span className='pl-1.5 text-gray-300'>/</span>
          </>
        );
      })}
    </div>
  );
}
