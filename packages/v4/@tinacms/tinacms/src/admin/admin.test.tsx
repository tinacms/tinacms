import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import type { ContentProvider, DocumentEntry } from '../core/content/contract';
import { definePlugin } from '../core/plugin';
import type { TinaDocument } from '../core/schema/types';
import type { AdminScreenProps } from '../core/screen/contract';
import { useFormId } from '../editor/hooks';
import { draftKey, readDraft } from '../form/drafts';
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

beforeEach(() => {
  saved.length = 0;
  listCalls.length = 0;
  getCalls.length = 0;
  window.location.hash = '';
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
    expect(await screen.findByText(/No collection named/)).toBeInTheDocument();
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
      await screen.findByRole('button', { name: /second\.mdx/ })
    );
    expect(await screen.findByLabelText(/^Title\b/)).toHaveValue('Second');

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
    expect(screen.getByRole('button', { name: 'Discard' })).toBeDisabled();
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
      await screen.findByRole('button', { name: /^Save\s?, 1 error$/ })
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

    await user.click(screen.getByRole('button', { name: 'Discard' }));

    await waitFor(() =>
      expect(screen.getByLabelText(/^Title\b/)).toHaveValue('Hello')
    );
    expect(screen.getByRole('status')).toHaveTextContent('No changes');
    expect(reloadIsBlocked()).toBe(false);
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
        .map((button) => button.getAttribute('aria-label'))
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

    await screen.findByRole('list', { name: 'Posts documents' });
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
  it('lists the entries plugins contribute, in order, skipping unmet dependencies', async () => {
    renderAdmin();
    const menu = await screen.findByRole('list', { name: 'Global navigation' });
    expect(
      within(menu)
        .getAllByRole('listitem')
        .map((item) => item.textContent)
    ).toEqual(['Media', 'Switch branch', 'Docs']);
  });

  it('lists the entries of a group under its heading', async () => {
    renderAdmin();
    const menu = await screen.findByRole('list', { name: 'Help' });
    expect(
      within(menu)
        .getAllByRole('listitem')
        .map((item) => item.textContent)
    ).toEqual(['Guides']);
  });

  it('places a group between the ungrouped entries by its order', async () => {
    renderAdmin();
    const [first, ...rest] = await screen.findAllByRole('list', {
      name: 'Global navigation',
    });
    expect(rest).toHaveLength(0);
    const heading = screen.getByText('Help');
    expect(
      first.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      heading.compareDocumentPosition(screen.getByText('Changelog')) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('does not link a screen that no entry targets', async () => {
    renderAdmin();
    const menu = await screen.findByRole('list', { name: 'Global navigation' });
    expect(within(menu).queryByText('Unlinked')).not.toBeInTheDocument();
  });

  it('opens a url entry in a new tab', async () => {
    renderAdmin();
    const link = await screen.findByRole('link', { name: 'Docs' });
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

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));

    // The label of a dirty field also carries its unsaved marker.
    expect(await screen.findByLabelText(/^Title/)).toHaveValue('Hello!');
  });
});

describe('TinaAdmin form continuity', () => {
  it('keeps the collection list mounted across opening a document', async () => {
    const user = userEvent.setup();
    renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    const before = await screen.findByRole('list', { name: 'Posts documents' });

    await user.click(await screen.findByRole('button', { name: /hello\.mdx/ }));
    await screen.findByLabelText(/^Title\b/);

    expect(screen.getByRole('list', { name: 'Posts documents' })).toBe(before);
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
    const dialog = await screen.findByRole('alertdialog', {
      name: 'Resume your unsaved edits?',
    });

    await user.click(
      within(dialog).getByRole('button', { name: 'Resume edits' })
    );
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(await screen.findByRole('textbox', { name: /^Title/ })).toHaveValue(
      'Mine'
    );
  });

  it('discards the stale draft from the dialog', async () => {
    storeStaleDraft();
    const user = await openHello();
    const dialog = await screen.findByRole('alertdialog');

    await user.click(
      within(dialog).getByRole('button', { name: 'Discard draft' })
    );
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(screen.getByLabelText(/^Title\b/)).toHaveValue('Hello');
    expect(readDraft(helloFormId)).toBeUndefined();
  });
});

describe('TinaAdmin after a save that changes the document', () => {
  it('keeps the afterSave failure message visible', async () => {
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
      'The document was saved, but an afterSave hook failed.'
    );
    vi.restoreAllMocks();
  });
});
