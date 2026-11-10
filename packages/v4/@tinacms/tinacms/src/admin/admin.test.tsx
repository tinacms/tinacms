import { QueryClient } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from '@tinacms/ui/components/toast';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import type { ContentProvider, DocumentEntry } from '../core/content/contract';
import { definePlugin } from '../core/plugin';
import type { TinaDocument } from '../core/schema/types';
import type { AdminScreenProps } from '../core/screen/contract';
import { useFormId } from '../editor/hooks';
import { draftKey, readDraft, readWaitingDrafts } from '../form/drafts';
import { toFormId, useFormStore } from '../form/form-store';
import { required } from '../plugins/fields';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import coreValidatorsPlugin from '../plugins/validators/core-validators.plugin';
import { TinaAdmin } from './admin';
import { useAdminRoute } from './use-admin-route';

const saved: { path: string; value: TinaDocument }[] = [];

const store: Record<string, DocumentEntry[]> = {
  post: [
    {
      path: 'content/posts/hello.mdx',
      document: { title: 'Hello' },
    },
    {
      path: 'content/posts/second.mdx',
      document: { title: 'Second' },
    },
  ],
  page: [{ path: 'content/pages/about.mdx', document: { title: 'About' } }],
};

const provider: ContentProvider = {
  list: async (collection) =>
    (store[collection] ?? []).map(({ path }) => ({ path })),
  get: async (collection, path) =>
    (store[collection] ?? []).find((entry) => entry.path === path) ?? null,
  update: async (collection, path, value) => {
    saved.push({ path, value });
    const entry = { path, document: { ...value } };
    store[collection] = (store[collection] ?? []).map((candidate) =>
      candidate.path === path ? entry : candidate
    );
    return entry;
  },
};

const listCalls: string[] = [];
const getCalls: string[] = [];

const contentPlugin = definePlugin({
  name: 'test:content',
  provides: ['content'],
  client: async () => ({
    default: {
      slice: () => ({
        list: (collection: string) => {
          listCalls.push(collection);
          return provider.list(collection);
        },
        get: (collection: string, path: string) => {
          getCalls.push(path);
          return provider.get(collection, path);
        },
        update: provider.update,
      }),
    },
  }),
});

function MediaScreen({ segments }: AdminScreenProps) {
  const { navigate } = useAdminRoute();
  return (
    <div>
      <p>media library at /{segments.join('/')}</p>
      <button
        type='button'
        onClick={() =>
          navigate({ view: 'screen', screen: 'media', segments: ['photos'] })
        }
      >
        Open photos
      </button>
    </div>
  );
}

const NavIcon = () => null;
const navAction = vi.fn();

const screenPlugin = definePlugin({
  name: 'test:media-screen',
  client: async () => ({
    default: {
      screens: [
        { name: 'media', label: 'Media', component: MediaScreen },
        { name: 'unlinked', label: 'Unlinked', component: MediaScreen },
      ],
      slots: {
        navGroups: [{ id: 'help', label: 'Help', order: 20 }],
        globalNav: [
          {
            label: 'Guides',
            icon: NavIcon,
            target: { kind: 'url', href: 'https://tina.io/guides' },
            group: 'help',
          },
          {
            label: 'Docs',
            icon: NavIcon,
            target: { kind: 'url', href: 'https://tina.io/docs' },
            order: 10,
          },
          {
            label: 'Changelog',
            icon: NavIcon,
            target: { kind: 'url', href: 'https://tina.io/changelog' },
            order: 30,
          },
          {
            label: 'Media',
            icon: NavIcon,
            target: { kind: 'screen', screen: 'media' },
          },
          {
            label: 'Switch branch',
            icon: NavIcon,
            target: { kind: 'action', run: navAction },
            order: 5,
          },
          {
            label: 'Search',
            icon: NavIcon,
            target: { kind: 'url', href: 'https://example.com' },
            dependsOn: ['search'],
          },
        ],
      },
    },
  }),
});

vi.mock('@tinacms/ui/components/toast', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@tinacms/ui/components/toast')>();
  return {
    ...original,
    toast: Object.assign(vi.fn(original.toast), {
      dismiss: original.toast.dismiss,
    }),
  };
});

const config = asResolvedConfig({
  plugins: [
    contentPlugin,
    screenPlugin,
    stringFieldPlugin,
    coreValidatorsPlugin,
  ],
  schema: {
    collections: [
      {
        name: 'post',
        label: 'Posts',
        path: 'content/posts',
        format: 'mdx',
        fields: [
          {
            name: 'title',
            label: 'Title',
            type: 'string',
            validators: [required()],
          },
        ],
      },
      {
        name: 'page',
        label: 'Pages',
        path: 'content/pages',
        format: 'mdx',
        fields: [{ name: 'title', label: 'Title', type: 'string' }],
      },
    ],
  },
});

const renderAdmin = (preview?: React.ReactNode) =>
  render(
    <TinaAdmin
      config={config}
      queryClient={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
      preview={preview}
    />
  );

function PreviewProbe() {
  return <p>previewing {useFormId()}</p>;
}

const reloadIsBlocked = (): boolean => {
  const unload = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(unload);
  return unload.defaultPrevented;
};

type User = ReturnType<typeof userEvent.setup>;

const openDiscardConfirm = async (user: User) => {
  await user.click(screen.getByRole('button', { name: 'Document actions' }));
  await user.click(
    await screen.findByRole('menuitem', { name: 'Discard unsaved edits' })
  );
  return screen.findByRole('alertdialog', {
    name: /^Discard unsaved edits to /,
  });
};

const FIXTURES: Record<string, DocumentEntry[]> = {
  post: [
    {
      path: 'content/posts/hello.mdx',
      document: { title: 'Hello' },
    },
    {
      path: 'content/posts/second.mdx',
      document: { title: 'Second' },
    },
  ],
  page: [{ path: 'content/pages/about.mdx', document: { title: 'About' } }],
};

afterEach(() => {
  vi.useRealTimers();
});

beforeEach(() => {
  saved.length = 0;
  listCalls.length = 0;
  getCalls.length = 0;
  window.location.hash = '#/collections';
  useFormStore.setState({ forms: {} });
  for (const [collection, entries] of Object.entries(FIXTURES)) {
    store[collection] = entries.map((entry) => ({ ...entry }));
  }
});

describe('TinaAdmin', () => {
  it('lists every collection the schema declares, and nothing else', async () => {
    renderAdmin();
    const menu = await screen.findByRole('list', { name: 'Collections' });
    expect(
      within(menu)
        .getAllByRole('button')
        .map((button) => button.textContent)
    ).toEqual(['Posts', 'Pages']);
  });

  it('opens a collection, then a document, and edits it', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));

    const input = await screen.findByLabelText(/^Title\b/);
    expect(input).toHaveValue('Hello');

    await user.type(input, '!');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(saved).toHaveLength(1));
    expect(saved[0]).toEqual({
      path: 'content/posts/hello.mdx',
      value: { title: 'Hello!' },
    });
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Saved')
    );
    expect(input).toHaveValue('Hello!');
  });

  it('keeps a document with a validation error from saving, and shows the error after a save is tried', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    const input = await screen.findByLabelText(/^Title\b/);

    await user.clear(input);
    expect(screen.queryByRole('alert')).toBeNull();

    await user.click(screen.getByRole('button', { name: /^Save/ }));
    const alerts = await screen.findAllByRole('alert');
    expect(alerts[0]).toHaveTextContent('Title is required');
  });

  it('opens the document a deep link names', async () => {
    window.location.hash = '#/collections/post/content%2Fposts%2Fsecond.mdx';
    renderAdmin();
    expect(await screen.findByLabelText(/^Title\b/)).toHaveValue('Second');
  });

  it('navigating writes a shareable hash', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: 'Pages' }));
    await waitFor(() =>
      expect(window.location.hash).toBe('#/collections/page')
    );
  });

  it('reports a collection the schema does not have', async () => {
    window.location.hash = '#/collections/ghost';
    renderAdmin();
    expect(
      await screen.findByRole('heading', { name: 'Collection not found' })
    ).toBeVisible();
    expect(screen.getByText(/No collection named/)).toBeInTheDocument();
    await userEvent.click(
      screen.getAllByRole('button', { name: 'Close' }).at(-1) as HTMLElement
    );
    await waitFor(() => expect(window.location.hash).toBe('#/'));
  });

  it('reports a document a deep link names that does not exist', async () => {
    window.location.hash = '#/collections/post/content%2Fposts%2Fghost.mdx';
    renderAdmin();
    expect(await screen.findByText(/No document named/)).toBeInTheDocument();
  });

  it('does not report a document a deep link names that does exist', async () => {
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    renderAdmin();
    expect(await screen.findByLabelText(/^Title\b/)).toHaveValue('Hello');
    expect(screen.queryByText(/No document named/)).not.toBeInTheDocument();
  });

  it('renders the preview inside the open document form scope', async () => {
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    renderAdmin(<PreviewProbe />);
    expect(await screen.findByText(/^previewing /)).toBeInTheDocument();
  });

  it('shows no preview until a document is open', async () => {
    renderAdmin(<PreviewProbe />);
    await screen.findByRole('list', { name: 'Collections' });
    expect(screen.queryByText(/^previewing /)).not.toBeInTheDocument();
  });

  it('still badges a document as unsaved after navigating away from it', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    await user.type(await screen.findByLabelText(/^Title\b/), '!');

    await user.click(
      screen.getByRole('button', { name: 'Return to navigator' })
    );
    await user.click(
      await screen.findByRole('button', { name: /second\.mdx/ })
    );
    expect(await screen.findByLabelText(/^Title\b/)).toHaveValue('Second');

    await user.click(
      screen.getByRole('button', { name: 'Return to navigator' })
    );
    const helloEntry = await screen.findByRole('button', {
      name: /hello\.mdx/,
    });
    expect(helloEntry).toHaveTextContent('Unsaved');
  });
});

describe('TinaAdmin Save button', () => {
  const openHello = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    return screen.findByLabelText(/^Title\b/);
  };

  it('is disabled while the form is clean', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await openHello(user);
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Document actions' }));
    expect(
      await screen.findByRole('menuitem', { name: 'Discard unsaved edits' })
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('is busy while saving: one save, and it keeps focus', async () => {
    const user = userEvent.setup();
    let finish: () => void = () => {};
    const update = vi
      .spyOn(provider, 'update')
      .mockImplementationOnce(async (collection, path, value) => {
        await new Promise<void>((resolve) => {
          finish = resolve;
        });
        return { path, document: { ...value } };
      });
    renderAdmin();
    const input = await openHello(user);
    await user.type(input, '!');
    const save = screen.getByRole('button', { name: 'Save' });
    save.focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(save).toHaveAttribute('aria-disabled', 'true'));
    await user.keyboard('{Enter}');
    expect(update).toHaveBeenCalledTimes(1);
    expect(save).toHaveFocus();
    finish();
    await waitFor(() =>
      expect(
        screen
          .getByRole('button', { name: 'Save' })
          .querySelector('.lucide-loader-circle')
      ).toBeNull()
    );
    update.mockRestore();
  });

  it('shows how many fields hold an error', async () => {
    const user = userEvent.setup();
    renderAdmin();
    const input = await openHello(user);
    await user.clear(input);
    await user.click(screen.getByRole('button', { name: /^Save/ }));
    expect(
      await screen.findByRole('button', { name: 'Resolve 1 error' })
    ).toBeVisible();
  });
});

describe('TinaAdmin unsaved changes', () => {
  it('blocks a reload while edits are unsaved, and lets it through once they are saved', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    await screen.findByLabelText(/^Title\b/);
    expect(reloadIsBlocked()).toBe(false);

    await user.type(screen.getByLabelText(/^Title\b/), '!');
    expect(reloadIsBlocked()).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(saved).toHaveLength(1));
    await waitFor(() => expect(reloadIsBlocked()).toBe(false));
  });

  it('blocks a reload for a document that another one is open over', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    await user.type(await screen.findByLabelText(/^Title\b/), '!');

    await user.click(
      screen.getByRole('button', { name: 'Return to navigator' })
    );
    await user.click(
      await screen.findByRole('button', { name: /second\.mdx/ })
    );
    await waitFor(() =>
      expect(screen.getByLabelText(/^Title\b/)).toHaveValue('Second')
    );
    expect(reloadIsBlocked()).toBe(true);
  });

  it('stops blocking the reload when the admin unmounts', async () => {
    const user = userEvent.setup();
    const { unmount } = renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    expect(reloadIsBlocked()).toBe(true);

    unmount();
    expect(reloadIsBlocked()).toBe(false);
  });

  it('discards unsaved edits back to the loaded document', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    expect(screen.getByRole('status')).toHaveTextContent('Unsaved');

    const dialog = await openDiscardConfirm(user);
    expect(dialog).toHaveAccessibleName('Discard unsaved edits to “Hello!”?');
    expect(dialog).toHaveTextContent(
      'The document goes back to its last saved version. Discarded edits can’t be brought back.'
    );
    await user.click(within(dialog).getByRole('button', { name: 'Discard' }));

    await waitFor(() =>
      expect(screen.getByLabelText(/^Title\b/)).toHaveValue('Hello')
    );
    expect(screen.getByRole('status')).toHaveTextContent('No changes');
    expect(reloadIsBlocked()).toBe(false);
  });

  it('opens the discard confirm on Cancel, and Cancel keeps the edits and returns focus to the menu button', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    await user.type(await screen.findByLabelText(/^Title\b/), '!');

    const dialog = await openDiscardConfirm(user);
    expect(
      within(dialog).getByRole('button', { name: 'Cancel' })
    ).toHaveFocus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(screen.getByLabelText(/^Title\b/)).toHaveValue('Hello!');
    expect(
      screen.getByRole('button', { name: 'Document actions' })
    ).toHaveFocus();
  });
});

describe('TinaAdmin content reads', () => {
  it('names the documents of a collection without reading any of them', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    const menu = await screen.findByRole('list', { name: 'Posts documents' });

    expect(
      within(menu)
        .getAllByRole('button')
        .map((button) => button.textContent)
    ).toEqual(['hello.mdx', 'second.mdx']);
    expect(getCalls).toEqual([]);
  });

  it('reads only the document it opens', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    await screen.findByLabelText(/^Title\b/);

    expect(getCalls).toEqual(['content/posts/hello.mdx']);
  });

  it('reads a collection once when two components ask for it', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await screen.findByRole('button', { name: /hello\.mdx/ });

    expect(listCalls.filter((name) => name === 'post')).toEqual(['post']);
  });

  it('does not read a collection again on returning to it', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await screen.findByRole('button', { name: /hello\.mdx/ });
    await user.click(await screen.findByRole('button', { name: 'Pages' }));
    await screen.findByRole('button', { name: /about\.mdx/ });
    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await screen.findByRole('button', { name: /hello\.mdx/ });

    expect(listCalls).toEqual(['post', 'page']);
  });

  it('does not report a document missing while it is still loading', async () => {
    let resolveGet: (entry: DocumentEntry | null) => void = () => {};
    const pending = new Promise<DocumentEntry | null>((resolve) => {
      resolveGet = resolve;
    });
    const reading = vi.spyOn(provider, 'get').mockReturnValueOnce(pending);
    window.location.hash = '#/collections/post/content%2Fposts%2Fghost.mdx';
    renderAdmin();

    await waitFor(() => expect(reading).toHaveBeenCalled());
    expect(screen.queryByText(/No document named/)).not.toBeInTheDocument();

    resolveGet(null);
    expect(await screen.findByText(/No document named/)).toBeInTheDocument();
    reading.mockRestore();
  });

  it('reports a collection that failed to load', async () => {
    const user = userEvent.setup();
    const failing = vi
      .spyOn(provider, 'list')
      .mockRejectedValueOnce(new Error('data layer offline'));
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));

    expect(await screen.findByText(/data layer offline/)).toBeInTheDocument();
    expect(screen.queryByText('No documents yet.')).not.toBeInTheDocument();
    failing.mockRestore();
  });

  it('reports a document it cannot read', async () => {
    const failing = vi
      .spyOn(provider, 'get')
      .mockRejectedValueOnce(new Error('could not be parsed'));
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    renderAdmin();

    const message = await screen.findByText(/Cannot read/);
    expect(message).toHaveTextContent('could not be parsed');
    failing.mockRestore();
  });

  it('shows a save in the document list without re-reading the collection', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(saved).toHaveLength(1));
    expect(listCalls).toEqual(['post']);
  });
});

describe('TinaAdmin global nav', () => {
  it('sorts ungrouped entries and groups together by order in the rail, skipping unmet dependencies (ADR-027)', async () => {
    renderAdmin();
    const rail = await screen.findByRole('navigation', { name: 'Content' });
    await screen.findByRole('list', { name: 'Help' });
    const shown = ['Switch branch', 'Docs', 'Guides', 'Changelog'];
    expect(
      [...rail.querySelectorAll('[data-rail-row]')]
        .map((row) => row.getAttribute('aria-label') ?? '')
        .filter((label) => shown.includes(label))
    ).toEqual(shown);
  });

  it('lists the entries of a group under its heading in the rail', async () => {
    renderAdmin();
    const menu = await screen.findByRole('list', { name: 'Help' });
    expect(
      within(menu)
        .getAllByRole('listitem')
        .map((item) => item.textContent)
    ).toEqual(['Guides (opens in a new tab)']);
  });

  it('does not link a screen that no entry targets', async () => {
    renderAdmin();
    const rail = await screen.findByRole('navigation', { name: 'Content' });
    expect(within(rail).queryByText('Unlinked')).not.toBeInTheDocument();
  });

  it('opens a url entry in a new tab', async () => {
    renderAdmin();
    const link = await screen.findByRole('link', { name: /^Docs/ });
    expect(link).toHaveAttribute('href', 'https://tina.io/docs');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('runs an action entry', async () => {
    const user = userEvent.setup();
    navAction.mockClear();
    renderAdmin();
    await user.click(
      await screen.findByRole('button', { name: 'Switch branch' })
    );
    expect(navAction).toHaveBeenCalledOnce();
  });

  it('shows an empty Tools pane when no plugin adds an entry', async () => {
    const user = userEvent.setup();
    render(
      <TinaAdmin
        config={asResolvedConfig({
          ...config,
          plugins: config.plugins.filter((plugin) => plugin !== screenPlugin),
        })}
        queryClient={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      />
    );
    await user.click(await screen.findByRole('button', { name: 'Tools' }));
    const pane = await screen.findByRole('complementary', {
      name: 'Tools panel',
    });
    expect(within(pane).getByText('No tools installed.')).toBeVisible();
  });

  it('opens a Settings pane beside the rail', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: 'Settings' }));
    const pane = await screen.findByRole('complementary', {
      name: 'Settings panel',
    });
    expect(within(pane).getByText('No settings yet.')).toBeVisible();
    await user.click(within(pane).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(window.location.hash).toBe('#/'));
  });
});

describe('TinaAdmin screens', () => {
  it('opens a screen and writes a shareable hash', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Media' }));

    expect(await screen.findByText(/media library at/)).toBeInTheDocument();
    await waitFor(() => expect(window.location.hash).toBe('#/screens/media'));
  });

  it('gives a screen its own route segments', async () => {
    window.location.hash = '#/screens/media/photos/2026';
    renderAdmin();
    expect(
      await screen.findByText('media library at /photos/2026')
    ).toBeInTheDocument();
  });

  it('lets a screen navigate within itself', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Media' }));
    await user.click(
      await screen.findByRole('button', { name: 'Open photos' })
    );

    expect(
      await screen.findByText('media library at /photos')
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(window.location.hash).toBe('#/screens/media/photos')
    );
  });

  it('renders a replacement screen at the replaced name', async () => {
    window.location.hash = '#/screens/media';
    render(
      <TinaAdmin
        config={asResolvedConfig({
          ...config,
          plugins: [
            ...config.plugins,
            definePlugin({
              name: 'test:media-v2',
              provides: ['screen'],
              overrides: [{ capability: 'screen', key: 'media' }],
              client: async () => ({
                default: {
                  screens: [
                    {
                      name: 'media',
                      label: 'Media',
                      component: () => <p>replacement media</p>,
                    },
                  ],
                },
              }),
            }),
          ],
        })}
        queryClient={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      />
    );
    expect(await screen.findByText('replacement media')).toBeInTheDocument();
  });

  it('reports a screen no plugin registered', async () => {
    window.location.hash = '#/screens/ghost';
    renderAdmin();
    expect(await screen.findByText(/No screen named/)).toBeInTheDocument();
  });

  it('closes the open collection when a screen opens', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await screen.findByRole('list', { name: 'Posts documents' });

    await user.click(await screen.findByRole('button', { name: 'Media' }));
    await screen.findByText(/media library at/);

    expect(
      screen.queryByRole('list', { name: 'Posts documents' })
    ).not.toBeInTheDocument();
  });

  it('keeps unsaved edits across a visit to a screen', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    await user.type(await screen.findByLabelText(/^Title\b/), '!');

    await user.click(await screen.findByRole('button', { name: 'Media' }));
    await screen.findByText(/media library at/);

    await user.click(
      await screen.findByRole('button', { name: 'Collections' })
    );
    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));

    // The label of a dirty field also carries its unsaved marker.
    expect(await screen.findByLabelText(/^Title/)).toHaveValue('Hello!');
  });
});

describe('TinaAdmin stale drafts', () => {
  const helloFormId = toFormId('content/posts/hello.mdx');
  const storeStaleDraft = () =>
    localStorage.setItem(
      draftKey(helloFormId),
      JSON.stringify({
        version: 2,
        values: { title: 'Mine' },
        baseline: { title: 'Old' },
      })
    );

  const openHello = async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    return user;
  };

  it('asks to resume or discard before the form can be edited', async () => {
    storeStaleDraft();
    const user = await openHello();
    const card = (
      await screen.findByText('Resume your unsaved edits?')
    ).closest<HTMLElement>('[data-slot="toast"]');
    if (!card) throw new Error('The Resume prompt is not a toast');
    expect(card).toBeVisible();
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(within(card).queryByRole('button', { name: 'Dismiss' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Resume' }));
    await waitFor(() =>
      expect(screen.queryByText('Resume your unsaved edits?')).toBeNull()
    );
    expect(await screen.findByRole('textbox', { name: /^Title/ })).toHaveValue(
      'Mine'
    );
  });

  it('keeps one Resume prompt while the editor types under it', async () => {
    storeStaleDraft();
    const user = await openHello();
    await screen.findByText('Resume your unsaved edits?');
    await user.type(screen.getByLabelText(/^Title\b/), 'abc');
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.getAllByRole('button', { name: 'Resume' })).toHaveLength(1);
    const shown = vi
      .mocked(toast)
      .mock.calls.filter(
        ([options]) => options.title === 'Resume your unsaved edits?'
      );
    expect(shown.length).toBeGreaterThan(0);
    expect(new Set(shown.map(([options]) => options.id))).toEqual(
      new Set([`resume-draft:${helloFormId}`])
    );
  });

  it('asks again before it discards the stale draft', async () => {
    storeStaleDraft();
    const user = await openHello();
    await screen.findByText('Resume your unsaved edits?');

    await user.click(screen.getByRole('button', { name: 'Discard' }));
    const dialog = await screen.findByRole('alertdialog', {
      name: 'Discard earlier unsaved edits to “Hello”?',
    });
    expect(dialog).toHaveTextContent(
      'Discarded edits can’t be brought back. What you typed since stays.'
    );
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(readWaitingDrafts(helloFormId)).toHaveLength(1);
    expect(screen.getByText('Resume your unsaved edits?')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Discard' }));
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Discard',
      })
    );
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(screen.getByLabelText(/^Title\b/)).toHaveValue('Hello');
    expect(readWaitingDrafts(helloFormId)).toEqual([]);
    expect(readDraft(helloFormId)).toBeUndefined();
  });
});

describe('TinaAdmin draft recovery contract', () => {
  const hello = toFormId('content/posts/hello.mdx');
  const second = toFormId('content/posts/second.mdx');
  const store = (id: typeof hello, values: object, baseline: object) =>
    localStorage.setItem(
      draftKey(id),
      JSON.stringify({ version: 2, values, baseline })
    );
  const openDoc = async (name: RegExp) => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: name }));
    return user;
  };

  it('row 2: a draft on the same file version waits, with the kept words and the Status bar line', async () => {
    store(hello, { title: 'Mine' }, { title: 'Hello' });
    await openDoc(/hello\.mdx/);
    expect(
      await screen.findByText('Kept in this browser since your last visit.')
    ).toBeVisible();
    expect(screen.getByLabelText(/^Title\b/)).toHaveValue('Hello');
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(
      within(screen.getByRole('contentinfo')).getByText(
        'Unsaved edits kept in this browser'
      )
    ).toBeVisible();
  });

  it('shows no No-changes chip while the prompt waits, and brings it back after Discard', async () => {
    store(hello, { title: 'Mine' }, { title: 'Hello' });
    const user = await openDoc(/hello\.mdx/);
    await screen.findByText('Resume your unsaved edits?');
    expect(screen.getByRole('status')).not.toHaveTextContent('No changes');
    await user.click(screen.getByRole('button', { name: 'Discard' }));
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Discard',
      })
    );
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('No changes')
    );
  });

  it('shows Unsaved while typing under the prompt and Saved after Save', async () => {
    store(hello, { title: 'Mine' }, { title: 'Hello' });
    const user = await openDoc(/hello\.mdx/);
    await screen.findByText('Resume your unsaved edits?');
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    expect(screen.getByRole('status')).toHaveTextContent('Unsaved');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Saved')
    );
  });

  it('row 3: a draft of an older file says the document changed', async () => {
    store(hello, { title: 'Mine' }, { title: 'Old' });
    await openDoc(/hello\.mdx/);
    expect(
      await screen.findByText(
        'The document changed since. Resume puts your edits on top.'
      )
    ).toBeVisible();
  });

  it('row 9: a collision re-shows the toast with the leftover words', async () => {
    store(hello, { title: 'Earlier' }, { title: 'Hello' });
    const user = await openDoc(/hello\.mdx/);
    await screen.findByText('Resume your unsaved edits?');
    await user.type(screen.getByLabelText(/^Title\b/), ' now');
    await user.click(screen.getByRole('button', { name: 'Resume' }));
    expect(
      await screen.findByText('Your earlier edit to Title is still kept.')
    ).toBeVisible();
    expect(screen.getByLabelText(/^Title\b/)).toHaveValue('Hello now');
    await user.click(screen.getByRole('button', { name: 'Resume' }));
    expect(screen.getByLabelText(/^Title\b/)).toHaveValue('Earlier');
  });

  it('rows 11 and 12: Cancel returns focus to the toast Discard and the toast does nothing while the confirm is open', async () => {
    store(hello, { title: 'Mine' }, { title: 'Hello' });
    const user = await openDoc(/hello\.mdx/);
    await screen.findByText('Resume your unsaved edits?');
    const discard = screen.getByRole('button', { name: 'Discard' });
    await user.click(discard);
    const dialog = await screen.findByRole('alertdialog');
    discard.click();
    expect(readWaitingDrafts(hello)).toHaveLength(1);
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(discard).toHaveFocus();
    expect(readWaitingDrafts(hello)).toHaveLength(1);
  });

  it('row 13: Discard unsaved edits leaves the waiting copy and the toast', async () => {
    store(hello, { title: 'Mine' }, { title: 'Hello' });
    const user = await openDoc(/hello\.mdx/);
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    const dialog = await openDiscardConfirm(user);
    await user.click(within(dialog).getByRole('button', { name: 'Discard' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(readWaitingDrafts(hello)).toHaveLength(1);
    expect(screen.getByText('Resume your unsaved edits?')).toBeVisible();
  });

  it('row 14: Save keeps the waiting copy, the toast and the Review count', async () => {
    store(hello, { title: 'Mine' }, { title: 'Hello' });
    const user = await openDoc(/hello\.mdx/);
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    );
    expect(readWaitingDrafts(hello)).toHaveLength(1);
    await waitFor(() =>
      expect(screen.getByText('Resume your unsaved edits?')).toBeVisible()
    );
  });

  it('row 16: a direct move to another document shows that document toast', async () => {
    store(hello, { title: 'Mine' }, { title: 'Hello' });
    store(second, { title: 'Theirs' }, { title: 'Second' });
    const user = await openDoc(/hello\.mdx/);
    await screen.findByText('Resume your unsaved edits?');
    await user.click(
      screen.getByRole('button', { name: 'Return to navigator' })
    );
    await user.click(
      await screen.findByRole('button', { name: /second\.mdx/ })
    );
    expect(await screen.findByLabelText(/^Title\b/)).toHaveValue('Second');
    await waitFor(() =>
      expect(screen.getByText('Resume your unsaved edits?')).toBeVisible()
    );
    const ids = vi
      .mocked(toast)
      .mock.calls.map(([options]) => options.id)
      .filter((id) => String(id).startsWith('resume-draft:'));
    expect(new Set(ids)).toEqual(
      new Set([`resume-draft:${hello}`, `resume-draft:${second}`])
    );
  });

  it('row 11: the confirm takes focus when a field held it', async () => {
    store(hello, { title: 'Mine' }, { title: 'Hello' });
    const user = await openDoc(/hello\.mdx/);
    await screen.findByText('Resume your unsaved edits?');
    await user.click(screen.getByLabelText(/^Title\b/));
    await user.click(screen.getByRole('button', { name: 'Discard' }));
    const dialog = await screen.findByRole('alertdialog');
    await waitFor(() =>
      expect(
        within(dialog).getByRole('button', { name: 'Cancel' })
      ).toHaveFocus()
    );
  });

  it('a Save failed toast goes when a later save lands', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const dismiss = vi.spyOn(toast, 'dismiss');
    vi.spyOn(provider, 'update').mockRejectedValueOnce(new Error('offline'));
    const user = await openDoc(/hello\.mdx/);
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(vi.mocked(toast)).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.stringMatching(/^save-failed:/),
          tone: 'error',
        })
      )
    );
    expect(dismiss).not.toHaveBeenCalledWith(
      expect.stringMatching(/^save-failed:/)
    );
    dismiss.mockClear();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(dismiss).toHaveBeenCalledWith(
        expect.stringMatching(/^save-failed:/)
      )
    );
  });

  it('Expand all and Collapse all show in the form menu, disabled when no field has cards', async () => {
    const user = await openDoc(/hello\.mdx/);
    await user.click(
      await screen.findByRole('button', { name: 'Document menu' })
    );
    expect(
      await screen.findByRole('menuitem', { name: 'Expand all' })
    ).toHaveAttribute('aria-disabled', 'true');
    expect(
      screen.getByRole('menuitem', { name: 'Collapse all' })
    ).toHaveAttribute('aria-disabled', 'true');
    expect(
      screen.getByRole('menuitem', { name: 'Copy file path' })
    ).toBeVisible();
  });

  it.each([
    [
      'a provider response',
      new Error(
        'Content request update failed (500): {"error":{"code":"op-failed","message":"Operation failed."}}'
      ),
    ],
    [
      'an error with a stack',
      Object.assign(new Error('boom at tina/hooks.ts:21'), {
        stack: 'Error: boom\n    at slug (tina/hooks.ts:21:9)',
      }),
    ],
    ['a plain string', 'op-failed {"x":500}'],
  ])(
    'a save that rejects with %s shows fixed words and Retry, and logs the text',
    async (_, rejection) => {
      const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(provider, 'update').mockRejectedValueOnce(rejection);
      const user = await openDoc(/hello\.mdx/);
      await user.type(await screen.findByLabelText(/^Title\b/), '!');
      await user.click(screen.getByRole('button', { name: 'Save' }));
      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent("Couldn't save. Something went wrong.");
      expect(alert).toHaveTextContent(
        'Your edits are kept. Try again in a few seconds.'
      );
      expect(alert).not.toHaveTextContent(/500|\{|op-failed|hooks\.ts/);
      expect(
        within(alert).getByRole('button', { name: 'Retry' })
      ).toBeVisible();
      expect(
        document.querySelector('[data-slot=form-bar] [role=alert]')
      ).toBeNull();
      expect(
        JSON.stringify(logged.mock.calls, (_k, v) => {
          if (v instanceof Error) return v.message;
          return v;
        })
      ).toMatch(/op-failed|boom/);
    }
  );

  it('Retry saves again and a good retry clears the toast', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(provider, 'update').mockRejectedValueOnce(new Error('offline'));
    const user = await openDoc(/hello\.mdx/);
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    const alert = await screen.findByRole('alert');
    await user.click(within(alert).getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });

  it('Retry is gone once the editor leaves the document, so it cannot write elsewhere', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const update = vi
      .spyOn(provider, 'update')
      .mockRejectedValueOnce(new Error('offline'));
    update.mockClear();
    const user = await openDoc(/hello\.mdx/);
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByRole('alert');
    await user.click(
      screen.getByRole('button', { name: 'Return to navigator' })
    );
    await user.click(
      await screen.findByRole('button', { name: /second\.mdx/ })
    );
    await screen.findByLabelText(/^Title\b/);
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
    expect(update).toHaveBeenCalledTimes(1);
    expect(readDraft(hello)?.values).toMatchObject({
      title: expect.stringMatching(/!$/),
    });
  });

  it('Retry clicked right after leaving does nothing to the store or the disk', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const update = vi
      .spyOn(provider, 'update')
      .mockRejectedValueOnce(new Error('offline'));
    update.mockClear();
    const user = await openDoc(/hello\.mdx/);
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    const retry = within(await screen.findByRole('alert')).getByRole('button', {
      name: 'Retry',
    });
    await user.click(
      screen.getByRole('button', { name: 'Return to navigator' })
    );
    await user.click(retry);
    expect(update).toHaveBeenCalledTimes(1);
    expect(readDraft(hello)?.values).toMatchObject({
      title: expect.stringMatching(/!$/),
    });
  });

  it('Retry clicked on another document never writes the first one into it', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const update = vi
      .spyOn(provider, 'update')
      .mockRejectedValueOnce(new Error('offline'));
    update.mockClear();
    const user = await openDoc(/hello\.mdx/);
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    const retry = within(await screen.findByRole('alert')).getByRole('button', {
      name: 'Retry',
    });
    await user.click(
      screen.getByRole('button', { name: 'Return to navigator' })
    );
    await user.click(
      await screen.findByRole('button', { name: /second\.mdx/ })
    );
    await screen.findByLabelText(/^Title\b/);
    await user.click(retry);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('Retry after leaving and coming back saves what is typed now', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const update = vi
      .spyOn(provider, 'update')
      .mockRejectedValueOnce(new Error('offline'));
    update.mockClear();
    const user = await openDoc(/hello\.mdx/);
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    const retry = within(await screen.findByRole('alert')).getByRole('button', {
      name: 'Retry',
    });
    await user.click(
      screen.getByRole('button', { name: 'Return to navigator' })
    );
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    await user.type(await screen.findByLabelText(/^Title\b/), '?');
    await user.click(retry);
    await waitFor(() => expect(update).toHaveBeenCalledTimes(2));
    expect(update.mock.calls[1][2]).toMatchObject({
      title: expect.stringMatching(/\?$/),
    });
  });

  it('rows 22 and 26: with the move-aside write failing, the warning shows and no screen says kept', async () => {
    store(hello, { title: 'Mine' }, { title: 'Hello' });
    const real = localStorage.setItem.bind(localStorage);
    const spy = vi
      .spyOn(localStorage, 'setItem')
      .mockImplementation((key, value) => {
        if (key.endsWith('#waiting')) throw new DOMException('full');
        real(key, value);
      });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    await openDoc(/hello\.mdx/);
    await waitFor(() =>
      expect(
        screen.getByText('Edits can’t be stored in this browser')
      ).toBeVisible()
    );
    expect(readDraft(hello)?.values).toEqual({ title: 'Mine' });
    expect(
      within(screen.getByRole('contentinfo')).queryByText(
        'Unsaved edits kept in this browser'
      )
    ).toBeNull();
    spy.mockRestore();
  });
});

describe('TinaAdmin after a save that changes the document', () => {
  it('keeps the afterSave failure toast visible', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const storing = definePlugin({
      name: 'test:content',
      provides: ['content'],
      client: async () => ({
        default: {
          slice: () => ({
            list: provider.list,
            get: provider.get,
            update: async (
              _collection: string,
              path: string,
              value: TinaDocument
            ) => ({
              path,
              document: { ...value, title: String(value.title).toUpperCase() },
            }),
          }),
        },
      }),
    });
    const failingAudit = definePlugin({
      name: 'test:hooks',
      provides: ['hooks'],
      hooks: ['audit'],
      client: async () => ({
        default: {
          hooks: {
            audit: () => ({
              afterSave: () => {
                throw new Error('audit endpoint down');
              },
            }),
          },
        },
      }),
    });
    const user = userEvent.setup();
    render(
      <TinaAdmin
        config={asResolvedConfig({
          plugins: [storing, failingAudit, stringFieldPlugin],
          schema: {
            collections: [
              {
                name: 'post',
                label: 'Posts',
                path: 'content/posts',
                format: 'mdx',
                hooks: [{ name: 'audit' }],
                fields: [{ name: 'title', label: 'Title', type: 'string' }],
              },
            ],
          },
        })}
        queryClient={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      />
    );

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByDisplayValue('HELLO!')).toBeInTheDocument();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The document was saved. An afterSave hook failed.'
    );
    vi.restoreAllMocks();
  });
});

describe('TinaAdmin leaving a document with unsaved edits', () => {
  const editHello = async (user: ReturnType<typeof userEvent.setup>) => {
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    renderAdmin();
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
  };

  it('leaves at once, then says the edits are kept in this browser and offers Open', async () => {
    const user = userEvent.setup();
    await editHello(user);
    await user.click(screen.getByRole('button', { name: 'Home' }));
    await waitFor(() => expect(window.location.hash).toBe('#/'));
    expect(
      await screen.findByText('Edits to “Hello!” are kept in this browser')
    ).toBeVisible();
    expect(screen.queryByText(/^Still unsaved on/)).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() =>
      expect(window.location.hash).toBe(
        '#/collections/post/content%2Fposts%2Fhello.mdx'
      )
    );
  });

  it('names a document by its file when the title is cleared', async () => {
    const user = userEvent.setup();
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    renderAdmin();
    const title = await screen.findByLabelText(/^Title\b/);
    await user.clear(title);
    await user.type(title, ' ');
    await user.click(screen.getByRole('button', { name: 'Home' }));
    expect(
      await screen.findByText('Edits to “hello.mdx” are kept in this browser')
    ).toBeVisible();
  });

  it('shows one notice per document and closes it when the document opens again', async () => {
    const user = userEvent.setup();
    await editHello(user);
    await user.click(screen.getByRole('button', { name: 'Home' }));
    await screen.findByText('Edits to “Hello!” are kept in this browser');
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await screen.findByLabelText(/^Title\b/);
    await waitFor(() =>
      expect(screen.queryByText(/are kept in this browser/)).toBeNull()
    );
    await user.click(
      screen.getAllByRole('button', { name: 'Home' }).at(0) as HTMLElement
    );
    await screen.findByText('Edits to “Hello!” are kept in this browser');
    expect(screen.getAllByText(/are kept in this browser/)).toHaveLength(1);
  });

  it('stays quiet when the document has no unsaved edits', async () => {
    const user = userEvent.setup();
    window.location.hash = '#/collections/post/content%2Fposts%2Fhello.mdx';
    renderAdmin();
    await screen.findByLabelText(/^Title\b/);
    await user.click(screen.getByRole('button', { name: 'Home' }));
    await waitFor(() => expect(window.location.hash).toBe('#/'));
    expect(screen.queryByText(/are kept in this browser/)).toBeNull();
  });
});

describe('TinaAdmin rail', () => {
  const railButtons = async () => {
    const rail = await screen.findByRole('navigation', { name: 'Content' });
    return within(
      within(rail).getByRole('list', { name: 'Navigation' })
    ).getAllByRole('button');
  };

  it('lists Home, Collections, Media, Tools and Settings, and no collection or document', async () => {
    renderAdmin();
    const buttons = await railButtons();
    expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual([
      'Home',
      'Collections',
      'Media',
    ]);
    const rail = screen.getByRole('navigation', { name: 'Content' });
    expect(
      within(within(rail).getByRole('list', { name: 'Tools and settings' }))
        .getAllByRole('button')
        .map((button) => button.getAttribute('aria-label'))
    ).toEqual(['Tools', 'Settings']);
    expect(within(rail).queryByText('Posts')).toBeNull();
  });

  it('lands on Home, with Home marked and no navigator open', async () => {
    window.location.hash = '';
    renderAdmin();
    expect(await screen.findByRole('button', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(
      screen.queryByRole('complementary', { name: 'Navigator' })
    ).toBeNull();
  });

  it('says so when the filtered navigator has no unsaved documents', async () => {
    window.location.hash = '#/collections?unsaved';
    renderAdmin();
    expect(await screen.findByText('No unsaved documents.')).toBeVisible();
  });

  it('shows only the documents with unsaved edits when the navigator is filtered', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    await user.click(screen.getByRole('button', { name: 'Collections' }));
    await screen.findByRole('complementary', { name: 'Navigator' });
    await user.click(screen.getByRole('button', { name: 'Collections menu' }));
    await user.click(
      await screen.findByRole('menuitem', { name: 'Show unsaved only' })
    );
    await waitFor(() =>
      expect(window.location.hash).toBe('#/collections?unsaved')
    );
    const list = await screen.findByRole('list', { name: 'Unsaved documents' });
    expect(
      await within(list).findByRole('button', { name: /hello\.mdx/ })
    ).toBeVisible();
    expect(
      within(list).queryByRole('button', { name: /second\.mdx/ })
    ).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Collections menu' }));
    await user.click(
      await screen.findByRole('menuitem', { name: 'Show all documents' })
    );
    await waitFor(() => expect(window.location.hash).toBe('#/collections'));
  });

  it.each([
    ['tools', 'Tools'],
    ['settings', 'Settings'],
  ])(
    'marks %s selected on a deep link and asks for an entry',
    async (hash, name) => {
      window.location.hash = `#/${hash}`;
      renderAdmin();
      expect(await screen.findByRole('button', { name })).toHaveAttribute(
        'aria-current',
        'page'
      );
      expect(screen.getByText('Pick an entry to open it.')).toBeVisible();
    }
  );

  it('opens the collections beside the rail, not inside it', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(
      await screen.findByRole('button', { name: 'Collections' })
    );
    const navigator = await screen.findByRole('complementary', {
      name: 'Navigator',
    });
    expect(within(navigator).getByText('Posts')).toBeVisible();
    expect(
      within(screen.getByRole('navigation', { name: 'Content' })).queryByText(
        'Posts'
      )
    ).toBeNull();
  });

  it('shows the empty collections state', async () => {
    const user = userEvent.setup();
    render(
      <TinaAdmin
        config={asResolvedConfig({
          ...config,
          schema: { collections: [] },
        })}
        queryClient={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      />
    );
    await user.click(
      await screen.findByRole('button', { name: 'Collections' })
    );
    expect(await screen.findByText('No collections yet.')).toBeVisible();
  });

  it('moves between the rows with the arrow keys, Home and End', async () => {
    const user = userEvent.setup();
    renderAdmin();
    const [home] = await railButtons();
    home.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Collections' })).toHaveFocus();
    await user.keyboard('{End}');
    const help = screen.getByRole('link', { name: /Help & docs/ });
    expect(help).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(help).not.toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(help).toHaveFocus();
    await user.keyboard('{Home}');
    expect(home).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(home).toHaveFocus();
  });

  it('moves between the rows with the arrow keys once the rail is collapsed', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(
      await screen.findByRole('button', { name: 'Toggle Sidebar' })
    );
    const [home] = await railButtons();
    home.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Collections' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Media' })).toHaveFocus();
    await user.keyboard('{ArrowUp}{Home}');
    expect(home).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('link', { name: /Help & docs/ })).toHaveFocus();
  });

  it('closes the phone rail sheet when a row is chosen', async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    try {
      const user = userEvent.setup();
      renderAdmin();
      await user.click(
        await screen.findByRole('button', { name: 'Toggle Sidebar' })
      );
      const sheet = await waitFor(() => {
        const found = document.querySelector<HTMLElement>('[data-mobile=true]');
        if (!found) throw new Error('The rail sheet is not open');
        return found;
      });
      await user.click(
        within(sheet).getByRole('button', { name: 'Collections' })
      );
      await waitFor(() => expect(sheet).not.toBeInTheDocument());
      expect(window.location.hash).toBe('#/collections');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('keeps unsaved edits when a rail row is clicked, and still blocks a reload', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    await user.type(await screen.findByLabelText(/^Title\b/), '!');

    await user.click(screen.getByRole('button', { name: /^Home/ }));
    expect(reloadIsBlocked()).toBe(true);
  });

  it('marks the last opened document in the navigator after Back', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    const [back] = within(
      await screen.findByRole('complementary', { name: 'Document form' })
    ).getAllByRole('button');
    await user.click(back);
    expect(
      await screen.findByRole('button', { name: /hello\.mdx/ })
    ).toHaveAttribute('aria-current', 'page');
  });

  it('opens Media as a pane beside the rail, and the main area keeps its route', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: 'Media' }));
    expect(await screen.findByText(/media library at/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Media library' })).toBeNull();
  });

  it('says so when a collection has no documents', async () => {
    store.page = [];
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: 'Pages' }));
    expect(await screen.findByText('No documents yet.')).toBeVisible();
  });

  it('closes an open collection when its row is clicked again, and the panel closes to Home', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await screen.findByRole('button', { name: /hello\.mdx/ });
    await user.click(screen.getByRole('button', { name: 'Posts' }));
    expect(screen.queryByRole('button', { name: /hello\.mdx/ })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(window.location.hash).toBe('#/'));
  });

  it('names a rail row in a tooltip once the rail is collapsed', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(
      await screen.findByRole('button', { name: 'Toggle Sidebar' })
    );
    await user.hover(screen.getByRole('button', { name: 'Home' }));
    await waitFor(() =>
      expect(
        document.querySelector('[data-slot="tooltip-content"]')
      ).toHaveTextContent('Home')
    );
  });

  it('opens Home and Media from their rows and writes the hash', async () => {
    const user = userEvent.setup();
    render(
      <TinaAdmin
        config={asResolvedConfig({
          ...config,
          plugins: config.plugins.filter((plugin) => plugin !== screenPlugin),
        })}
        queryClient={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      />
    );
    await user.click(await screen.findByRole('button', { name: 'Home' }));
    await waitFor(() => expect(window.location.hash).toBe('#/'));
    await user.click(screen.getByRole('button', { name: 'Media' }));
    await waitFor(() => expect(window.location.hash).toBe('#/media'));
    expect(
      within(
        await screen.findByRole('complementary', { name: 'Media' })
      ).getByText('No media library is installed.')
    ).toBeVisible();
  });

  it('lists the navigator beside the not-found panel when a document link names a collection that does not exist', async () => {
    window.location.hash = '#/collections/ghost/content%2Fposts%2Fx.mdx';
    renderAdmin();
    await screen.findByRole('heading', { name: 'Collection not found' });
    expect(
      screen.getByRole('complementary', { name: 'Navigator' })
    ).toBeVisible();
  });

  it('lets the editor discard edits kept for a document whose file is gone', async () => {
    const gone = toFormId('content/posts/deleted.mdx');
    localStorage.setItem(
      draftKey(gone),
      JSON.stringify({
        version: 2,
        values: { title: 'Kept' },
        baseline: { title: 'Deleted' },
      })
    );
    const user = userEvent.setup();
    window.location.hash = '#/collections?unsaved';
    renderAdmin();
    expect(await screen.findByText(/Its file was not found/)).toBeVisible();
    await user.click(
      screen.getByRole('button', { name: 'Discard edits to deleted.mdx' })
    );
    const dialog = await screen.findByRole('alertdialog', {
      name: 'Discard unsaved edits to “content/posts/deleted.mdx”?',
    });
    expect(dialog).toHaveTextContent(
      'The file is gone, so these edits are the only copy.'
    );
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(readDraft(gone)).toBeDefined();
    await user.click(
      screen.getByRole('button', { name: 'Discard edits to deleted.mdx' })
    );
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Discard',
      })
    );
    expect(await screen.findByText('No unsaved documents.')).toBeVisible();
    expect(readDraft(gone)).toBeUndefined();
  });

  it('lists a document whose edits wait in a stored draft after a reload', async () => {
    localStorage.setItem(
      draftKey(toFormId('content/posts/hello.mdx')),
      JSON.stringify({
        version: 2,
        values: { title: 'Kept' },
        baseline: { title: 'Hello' },
      })
    );
    window.location.hash = '#/collections?unsaved';
    renderAdmin();
    const list = await screen.findByRole('list', { name: 'Unsaved documents' });
    expect(
      await within(list).findByRole('button', { name: /hello\.mdx/ })
    ).toBeVisible();
    expect(screen.queryByText('No unsaved documents.')).toBeNull();
  });

  it('marks no document in another collection after Back', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    const [back] = within(
      await screen.findByRole('complementary', { name: 'Document form' })
    ).getAllByRole('button');
    await user.click(back);
    await user.click(await screen.findByRole('button', { name: 'Pages' }));
    const about = await screen.findByRole('button', { name: /about\.mdx/ });
    expect(about).not.toHaveAttribute('aria-current');
  });

  it('shows Loading while a collection reads, then its documents', async () => {
    let finish: (list: { path: string }[]) => void = () => {};
    const pending = new Promise<{ path: string }[]>((resolve) => {
      finish = resolve;
    });
    const reading = vi.spyOn(provider, 'list').mockReturnValueOnce(pending);
    const user = userEvent.setup();
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    expect(await screen.findByText('Loading…')).toBeVisible();
    finish([{ path: 'content/posts/hello.mdx' }]);
    expect(
      await screen.findByRole('button', { name: /hello\.mdx/ })
    ).toBeVisible();
    reading.mockRestore();
  });

  it('marks a plugin entry that targets the open screen, and opens a screen from its row', async () => {
    const linked = definePlugin({
      name: 'test:linked-screen',
      client: async () => ({
        default: {
          slots: {
            globalNav: [
              {
                label: 'Reports',
                icon: NavIcon,
                target: { kind: 'screen', screen: 'unlinked' },
              },
            ],
          },
        },
      }),
    });
    const user = userEvent.setup();
    render(
      <TinaAdmin
        config={asResolvedConfig({
          ...config,
          plugins: [...config.plugins, linked],
        })}
        queryClient={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      />
    );
    const row = await screen.findByRole('button', { name: 'Reports' });
    expect(row).not.toHaveAttribute('aria-current');
    await user.click(row);
    await waitFor(() =>
      expect(window.location.hash).toBe('#/screens/unlinked')
    );
    expect(screen.getByRole('button', { name: 'Reports' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });
});

describe('Toast tooltips', () => {
  it('opens the Dismiss tooltip after the half second the rest of the admin uses, not the 600ms default', async () => {
    renderAdmin();
    await screen.findByRole('button', { name: 'Toggle Sidebar' });
    act(() => {
      toast({ title: 'Heads up' });
    });
    const card = (await screen.findByText('Heads up')).closest(
      '[data-slot="toast"]'
    ) as HTMLElement;
    const dismiss = within(card).getByRole('button', { name: 'Dismiss' });
    vi.useFakeTimers();
    const tip = () => document.querySelector('[data-slot="tooltip-content"]');
    act(() => {
      fireEvent.pointerEnter(dismiss);
      fireEvent.pointerMove(dismiss);
      fireEvent.mouseEnter(dismiss);
      fireEvent.mouseMove(dismiss);
    });
    await act(() => vi.advanceTimersByTimeAsync(499));
    expect(tip()).toBeNull();
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(tip()).toHaveTextContent('Dismiss');
  });
});
