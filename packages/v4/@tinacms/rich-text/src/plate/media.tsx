import { FileIcon, Trash2Icon } from 'lucide-react';
import type React from 'react';

export interface Media {
  id: string;
  filename: string;
  src?: string;
}

export const isImage = (filename: string): boolean =>
  /\.(gif|jpg|jpeg|tiff|png|svg|webp|avif)(\?.*)?$/i.test(filename);

export const StyledImage = ({ src }: { src: string }) => (
  <img
    src={src}
    alt=''
    className={`m-0 block h-auto max-h-48 max-w-full overflow-hidden rounded bg-gray-200 object-contain shadow lg:max-h-64 ${
      /\.svg$/.test(src) ? 'min-w-[12rem]' : ''
    }`}
  />
);

export const StyledFile = ({ src }: { src: string }) => (
  <div className='flex w-full max-w-full flex-1 items-center justify-start gap-3'>
    <div className='flex h-12 w-12 flex-none justify-center rounded border border-gray-100 bg-white shadow'>
      <FileIcon className='h-full w-3/5 text-gray-300' />
    </div>
    <span className='w-full flex-1 truncate break-words text-left text-base text-gray-500'>
      {src}
    </span>
  </div>
);

export const DeleteImageButton = ({
  onClick,
}: {
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}) => (
  <button
    type='button'
    onClick={onClick}
    className='flex-none rounded border border-gray-100 bg-white p-1.5 shadow'
  >
    <Trash2Icon className='h-auto w-5 caret-transparent' />
  </button>
);
