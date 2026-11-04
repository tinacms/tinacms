import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@tinacms/ui/components/dialog';
import { Button } from '@tinacms/ui/components/button';
import { SearchBox } from '@tinacms/ui/components/search-box';
import { useEffect, useMemo, useState } from 'react';
import {
  type SearchHit,
  type SearchProvider,
  isSearchProvider,
} from '../core/search/contract';
import { useTinaStore } from '../editor/hooks';
import { useAdminScreens, useGlobalNav } from './hooks';
import { MEDIA_SCREEN, openNavTarget, toolsEntries } from './rail';
import { useAdminRoute } from './use-admin-route';

function useSearchProvider(): SearchProvider | null {
  const slice = useTinaStore((state) => state.search);
  return isSearchProvider(slice) ? slice : null;
}

// The rich-text editor binds Cmd+K to its link dialog, so Search never takes
// the chord from inside it.
const inRichText = (target: EventTarget | null): boolean =>
  target instanceof Element && target.closest('[data-slate-editor]') !== null;

interface NavigationResult {
  label: string;
  run: () => void;
}

// The rail's places and the plugin entries, as one list a query can narrow.
function useNavigationResults(): NavigationResult[] {
  const { navigate } = useAdminRoute();
  const globalNav = useGlobalNav();
  const screens = useAdminScreens();
  return useMemo(() => {
    const hasMedia = screens.some(({ name }) => name === MEDIA_SCREEN);
    const places: NavigationResult[] = [
      { label: 'Home', run: () => navigate({ view: 'home' }) },
      { label: 'Collections', run: () => navigate({ view: 'collections' }) },
      {
        label: 'Media',
        run: () =>
          navigate(
            hasMedia
              ? { view: 'screen', screen: MEDIA_SCREEN, segments: [] }
              : { view: 'media' }
          ),
      },
      { label: 'Tools', run: () => navigate({ view: 'tools' }) },
      { label: 'Settings', run: () => navigate({ view: 'settings' }) },
    ];
    const plugins = [
      ...toolsEntries(globalNav),
      ...globalNav.flatMap(({ group, entries }) => (group ? entries : [])),
    ]
      .filter(({ target }) => target.kind !== 'url')
      .map(({ label, target }) => ({
        label,
        run: () => openNavTarget(target, navigate),
      }));
    return [...places, ...plugins];
  }, [navigate, globalNav, screens]);
}

function SearchDialog({
  provider,
  open,
  onOpenChange,
}: {
  provider: SearchProvider | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const navigation = useNavigationResults();
  const matching = navigation.filter(({ label }) =>
    label.toLowerCase().includes(query.trim().toLowerCase())
  );
  useEffect(() => {
    if (!query || !provider) {
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
        <h3 className='text-sm font-semibold text-muted-foreground'>
          Navigation
        </h3>
        <ul aria-label='Navigation results' className='m-0 list-none p-0'>
          {matching.map(({ label, run }) => (
            <li key={label}>
              <button
                type='button'
                className='w-full cursor-pointer rounded-sm px-2 py-1.5 text-left text-base hover:bg-muted'
                onClick={() => {
                  onOpenChange(false);
                  run();
                }}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
        {provider ? (
          <>
            <h3 className='text-sm font-semibold text-muted-foreground'>
              Content search
            </h3>
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
          </>
        ) : (
          <p className='text-sm text-muted-foreground'>
            Full-text search needs a search provider.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** The Top bar's Search control. It always shows; content search joins it when a provider is mounted. */
export function SearchControl() {
  const provider = useSearchProvider();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'k' || !(event.metaKey || event.ctrlKey)) return;
      if (inRichText(event.target)) return;
      event.preventDefault();
      setOpen(true);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
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
