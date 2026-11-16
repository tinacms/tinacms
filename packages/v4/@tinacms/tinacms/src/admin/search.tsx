import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@tinacms/ui/components/dialog';
import { Badge } from '@tinacms/ui/components/badge';
import { Button } from '@tinacms/ui/components/button';
import { SearchBox } from '@tinacms/ui/components/search-box';
import { useEffect, useMemo, useState } from 'react';
import {
  ContentError,
  type ContentProvider,
  type DocumentEntry,
} from '../core/content/contract';
import {
  type SearchProvider,
  type SearchRef,
  isSearchError,
  isSearchProvider,
} from '../core/search/contract';
import { useOptionalContentSlice, useTinaStore } from '../editor/hooks';
import { useUnsavedFormIds } from '../form/form-store';
import { useAdminScreens, useGlobalNav } from './hooks';
import {
  HOME_SCREEN,
  MEDIA_SCREEN,
  hasHomeEntry,
  openNavTarget,
  targetsScreen,
} from './rail';
import { useAdminRoute } from './use-admin-route';

function useSearchProvider(): SearchProvider | null {
  const slice = useTinaStore((state) => state.search);
  return isSearchProvider(slice) ? slice : null;
}

// The rich-text editor binds Cmd+K to its link dialog, so Search never takes
// the chord from inside it.
const inRichText = (target: EventTarget | null): boolean =>
  target instanceof Element && target.closest('[data-slate-editor]') !== null;

export const SEARCH_DEBOUNCE_MS = 250;
const SEARCH_LIMIT = 10;
const GENERIC_FAILURE = 'Something went wrong. Please try again.';

interface ContentResult {
  ref: SearchRef;
  title: string;
  snippet: string;
}

interface ContentSearchOutcome {
  results: ContentResult[];
  message: string | null;
}

const NO_OUTCOME: ContentSearchOutcome = { results: [], message: null };

const messageOf = (cause: unknown): string => {
  if (cause instanceof ContentError || isSearchError(cause)) {
    return cause.message;
  }
  return GENERIC_FAILURE;
};

const isNamed = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '';

// The entry's own title, then the document's `title` value, then the path.
const titleOf = (entry: DocumentEntry, path: string): string => {
  if (isNamed(entry.title)) return entry.title;
  const named = entry.document.title;
  return isNamed(named) ? named : path;
};

const isGone = (reason: unknown): boolean => {
  if (reason instanceof ContentError) return reason.code === 'not-found';
  return false;
};

// ADR-021 §2: a hit is a hint. Each one is read back from `content`, and a
// hit whose document is gone is dropped.
const searchContent = async (
  provider: SearchProvider,
  content: ContentProvider,
  query: string
): Promise<ContentSearchOutcome> => {
  let hits: Awaited<ReturnType<SearchProvider['search']>>;
  try {
    hits = await provider.search(query, { limit: SEARCH_LIMIT });
  } catch (cause) {
    return { results: [], message: messageOf(cause) };
  }
  const results: ContentResult[] = [];
  let message: string | null = null;
  const settled = await Promise.allSettled(
    hits.map(({ ref }) => content.get(ref.collection, ref.path))
  );
  settled.forEach((read, index) => {
    const { ref, snippet } = hits[index];
    if (read.status === 'fulfilled') {
      if (read.value) {
        results.push({ ref, snippet, title: titleOf(read.value, ref.path) });
      }
      return;
    }
    if (!isGone(read.reason)) message ??= messageOf(read.reason);
  });
  return { results, message };
};

interface NavigationResult {
  id: string;
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
    const places: Omit<NavigationResult, 'id'>[] = [
      ...(hasHomeEntry(globalNav)
        ? [{ label: 'Home', run: () => navigate({ view: 'home' }) }]
        : []),
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
    const plugins = globalNav
      .flatMap(({ entries }) => entries)
      .filter(
        ({ target }) =>
          target.kind !== 'url' && !targetsScreen(target, HOME_SCREEN)
      )
      .map(({ label, target }) => ({
        label,
        run: () => openNavTarget(target, navigate),
      }));
    return [...places, ...plugins].map((result, index) => ({
      ...result,
      id: `${index}`,
    }));
  }, [navigate, globalNav, screens]);
}

function SearchDialog({
  provider,
  content,
  open,
  onOpenChange,
}: {
  provider: SearchProvider | null;
  content: ContentProvider | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState('');
  const [outcome, setOutcome] = useState<ContentSearchOutcome>(NO_OUTCOME);
  const navigation = useNavigationResults();
  const unsavedPaths = new Set<string>(useUnsavedFormIds());
  const matching = navigation.filter(({ label }) =>
    label.toLowerCase().includes(query.trim().toLowerCase())
  );
  useEffect(() => {
    const text = query.trim();
    if (!text || !provider || !content) {
      setOutcome(NO_OUTCOME);
      return;
    }
    let current = true;
    const timer = setTimeout(() => {
      searchContent(provider, content, text).then((found) => {
        if (current) setOutcome(found);
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [provider, content, query]);
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
          {matching.map(({ id, label, run }) => (
            <li key={id}>
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
        {provider && content ? (
          <>
            <h3 className='text-sm font-semibold text-muted-foreground'>
              Content search
            </h3>
            {outcome.message ? (
              <p role='alert' className='text-sm text-destructive'>
                {outcome.message}
              </p>
            ) : null}
            <ul aria-label='Search results' className='m-0 list-none p-0'>
              {outcome.results.map(({ ref, title, snippet }) => (
                <li
                  key={`${ref.collection}:${ref.path}`}
                  className='py-1.5 text-base'
                >
                  <span className='flex items-center gap-2'>
                    <span className='min-w-0 [overflow-wrap:anywhere] font-medium'>
                      {title}
                    </span>
                    {unsavedPaths.has(ref.path) ? <Badge /> : null}
                  </span>
                  {snippet ? (
                    <span className='block [overflow-wrap:anywhere] text-sm text-muted-foreground'>
                      {snippet}
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
  const content = useOptionalContentSlice();
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
        className='max-md:px-2 max-md:[&_[data-slot=kbd-shortcut]]:hidden'
        onClick={() => setOpen(true)}
      >
        <span className='max-md:sr-only'>Search</span>
      </Button>
      <SearchDialog
        provider={provider}
        content={content}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
