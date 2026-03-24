import { Blocks } from '@/components/blocks';
import type { TinaPageProps } from '@/lib/types';
import React from 'react';
import { tinaField, useTina } from 'tinacms/dist/react';

export default function PageRenderer(props: TinaPageProps<any>) {
  const { data } = useTina({ ...props });
  const page = data?.page;

  if (!page) {
    return <div className='p-6 text-red-600'>Error: No page data found</div>;
  }

  return (
    <div data-tina-field={tinaField(page, 'blocks')}>
      {page.blocks && page.blocks.length > 0 ? (
        <Blocks blocks={page.blocks} />
      ) : (
        <div className='p-6 text-gray-600 dark:text-gray-400'>
          No blocks to display
        </div>
      )}
    </div>
  );
}
