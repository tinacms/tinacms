import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useTina, tinaField } from 'tinacms/dist/react';
import { Blocks } from '@/src/components/blocks';
import { NoData } from '@/src/components/ui/no-data';
import { Loading } from '@/src/loading';
import { useTinaQuery } from '@/src/hooks/use-tina-query';
import client from '@/tina/__generated__/client';

export default function DynamicPage() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  const filepath = segments.join('/');

  const queryFn = useCallback(
    () => client.queries.page({ relativePath: `${filepath}.md` }),
    [filepath]
  );
  const result = useTinaQuery(queryFn);

  if (result.loading) return <Loading />;
  if (result.error || !result.data) return <NoData message='Page not found' />;

  return (
    <PageClient
      data={result.data}
      query={result.query}
      variables={result.variables}
    />
  );
}

function PageClient(props: {
  data: any;
  query: string;
  variables: Record<string, unknown>;
}) {
  const { data } = useTina({ ...props });
  const page = data?.page;

  if (!page) return <NoData message='No page data found' />;

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
