import { useCallback } from 'react';
import { useTinaQuery } from '@/src/hooks/use-tina-query';
import { useTina, tinaField } from 'tinacms/dist/react';
import { Blocks } from '@/src/components/blocks';
import { Loading } from '@/src/loading';
import client from '@/tina/__generated__/client';

export default function Home() {
  const queryFn = useCallback(
    () => client.queries.page({ relativePath: 'home.md' }),
    []
  );
  const result = useTinaQuery(queryFn);

  if (result.loading) return <Loading />;
  if (result.error || !result.data) return <div className='p-6 text-red-600'>Error loading home page</div>;

  return <HomeClient data={result.data} query={result.query} variables={result.variables} />;
}

function HomeClient(props: { data: any; query: string; variables: Record<string, unknown> }) {
  const { data } = useTina({ ...props });
  const page = data?.page;
  if (!page) return <div className='p-6 text-red-600'>No page data found</div>;

  return (
    <div data-tina-field={tinaField(page, 'blocks')}>
      {page.blocks && page.blocks.length > 0 ? (
        <Blocks blocks={page.blocks} />
      ) : (
        <div className='p-6 text-gray-600 dark:text-gray-400'>No blocks to display</div>
      )}
    </div>
  );
}
