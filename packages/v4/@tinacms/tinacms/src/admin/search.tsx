import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@tinacms/ui/components/dialog';
import { Button } from '@tinacms/ui/components/button';
import { SearchBox } from '@tinacms/ui/components/search-box';
import { useEffect, useState } from 'react';
import type { SliceState } from '../core/plugin';
import { useTinaStore } from '../editor/hooks';

export interface SearchHit {
  ref: string;
  snippet?: string;
}

interface SearchProvider {
  search: (query: string) => Promise<SearchHit[]>;
}

const isSearchProvider = (
  slice: SliceState | undefined
): slice is SliceState & SearchProvider =>
  slice !== undefined && typeof slice.search === 'function';

export function useSearchProvider(): SearchProvider | null {
  const slice = useTinaStore((state) => state.search);
  return isSearchProvider(slice) ? slice : null;
}

// The rich-text editor binds Cmd+K to its link dialog, so Search never takes
// the chord from inside it.
const inRichText = (target: EventTarget | null): boolean =>
  target instanceof Element && target.closest('[data-slate-editor]') !== null;

function SearchDialog({
  provider,
  open,
  onOpenChange,
}: {
  provider: SearchProvider;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  useEffect(() => {
    if (!query) {
      setHits([]);
      return;
    }
    let current = true;
    provider.search(query).then(
      (found) => {
        if (current) setHits(found);
      },
      () => {
        if (current) setHits([]);
      }
    );
    return () => {
      current = false;
    };
  }, [provider, query]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size='lg' showCloseButton>
        <DialogTitle>Search</DialogTitle>
        <SearchBox
          label='Search'
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery('')}
          autoFocus
        />
        <ul aria-label='Search results' className='m-0 list-none p-0'>
          {hits.map((hit) => (
            <li key={hit.ref} className='py-1.5 text-base'>
              <span className='font-medium'>{hit.ref}</span>
              {hit.snippet ? (
                <span className='block text-sm text-muted-foreground'>
                  {hit.snippet}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

/** The Top bar's Search control. Renders nothing when no search provider is mounted. */
export function SearchControl() {
  const provider = useSearchProvider();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!provider) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'k' || !(event.metaKey || event.ctrlKey)) return;
      if (inRichText(event.target)) return;
      event.preventDefault();
      setOpen(true);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [provider]);
  if (!provider) return null;
  return (
    <>
      <Button
        variant='outline'
        size='sm'
        icon='search'
        shortcut='⌘K'
        aria-keyshortcuts='Meta+K Control+K'
        onClick={() => setOpen(true)}
      >
        Search
      </Button>
      <SearchDialog provider={provider} open={open} onOpenChange={setOpen} />
    </>
  );
}
