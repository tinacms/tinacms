import { Badge } from '@tinacms/ui/components/badge';
import { Button } from '@tinacms/ui/components/button';
import { Card } from '@tinacms/ui/components/card';
import { EmptyState } from '@tinacms/ui/components/empty-state';
import { SidebarInset } from '@tinacms/ui/components/sidebar';
import type { CollectionSchema } from '../core/schema/types';
import { useBranchView } from '../editor/branch';
import { useCollectionDocuments } from '../editor/content-queries';
import { useUnsavedFormIds } from '../form/form-store';
import type { AdminRoute } from './routing';

// The branch the edits save to, or the plain-file note in local mode. Nothing is guessed:
// a missing branch name leaves the line out.
function useHomeLine(): string | null {
  const branch = useBranchView();
  if (branch?.mode === 'local') {
    return 'Local files: Tina writes edits straight to disk.';
  }
  return branch?.name ? `Branch ${branch.name}` : null;
}

const countLabel = (count: number | null): string | null => {
  if (count === null) return null;
  return count === 1 ? '1 document' : `${count} documents`;
};

function CollectionCard({
  collection,
  navigate,
}: {
  collection: CollectionSchema;
  navigate: (route: AdminRoute) => void;
}) {
  const { documents, isLoading, error } = useCollectionDocuments(
    collection.name
  );
  const label = collection.label ?? collection.name;
  const count = isLoading || error ? null : documents.length;
  return (
    <Card className='h-full justify-between gap-6 p-4'>
      <button
        type='button'
        className='cursor-pointer text-left text-base font-semibold'
        onClick={() =>
          navigate({ view: 'collection', collection: collection.name })
        }
      >
        {label}
      </button>
      <div className='flex items-end justify-between gap-2'>
        <span className='text-sm text-muted-foreground'>
          {countLabel(count)}
        </span>
        <Button
          variant='outline'
          size='compact'
          disabled
          aria-label={`New ${label} document`}
        >
          + New
        </Button>
      </div>
    </Card>
  );
}

/** The landing screen: where the project stands, the unsaved documents, and every collection. */
export function HomePanel({
  collections,
  navigate,
}: {
  collections: CollectionSchema[];
  navigate: (route: AdminRoute) => void;
}) {
  const line = useHomeLine();
  const unsaved = useUnsavedFormIds().length;
  return (
    <SidebarInset className='min-w-0'>
      <div className='min-h-0 flex-1 overflow-y-auto'>
        <div className='mx-auto w-full max-w-260 px-4 py-10'>
          <div className='mb-8 flex items-start justify-between gap-4'>
            <div className='min-w-0 break-words'>
              <h2 className='text-2xl font-semibold'>Home</h2>
              {line ? (
                <p className='text-base text-muted-foreground'>{line}</p>
              ) : null}
            </div>
            {unsaved > 0 ? (
              <Button
                variant='outline'
                onClick={() =>
                  navigate({ view: 'collections', unsavedOnly: true })
                }
              >
                <Badge kind='dot' />
                Review {unsaved} unsaved
              </Button>
            ) : null}
          </div>
          {collections.length === 0 ? (
            <EmptyState text='No collections yet.' />
          ) : (
            <section aria-labelledby='home-collections'>
              <h3
                id='home-collections'
                className='mb-3 text-base font-semibold'
              >
                Collections
              </h3>
              <ul
                aria-label='Collection cards'
                className='m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-3 p-0'
              >
                {collections.map((collection) => (
                  <li key={collection.name}>
                    <CollectionCard
                      collection={collection}
                      navigate={navigate}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </SidebarInset>
  );
}
