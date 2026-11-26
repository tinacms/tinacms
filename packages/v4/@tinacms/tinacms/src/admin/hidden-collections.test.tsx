import { QueryClient } from '@tanstack/react-query';
import { configure } from '@testing-library/dom';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import type { DocumentEntry } from '../core/content/contract';
import { definePlugin } from '../core/plugin';
import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import { useFormStore } from '../form/form-store';
import { t } from '../index';
import referenceFieldPlugin from '../plugins/fields/reference/reference-field.plugin';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import homePlugin from '../plugins/home/home.plugin';
import { connectionOf } from '../test/connection';
import { findCollectionTree } from '../test/collection-tree';
import { TinaAdmin } from './admin';

configure({ asyncUtilTimeout: 20_000 });

const POST = 'content/posts/hello.mdx';
const SEO = 'content/seos/defaults.mdx';
const SEO_NESTED = 'content/seos/nested/inner.mdx';
const hashOf = (collection: string, path: string) =>
  `#/collections/${collection}/${encodeURIComponent(path)}`;

let files: Record<string, TinaDocument>;
let writes: string[];

const contentPlugin = definePlugin({
  name: 'test:content',
  provides: ['content'],
  client: async () => ({
    default: {
      slice: () => ({
        local: true,
        list: async (collection: string) =>
          connectionOf(
            Object.keys(files)
              .filter((path) => path.includes(`/${collection}s/`))
              .map((path) => ({
                path,
                title: String(files[path]?.title ?? ''),
                updatedAt: '2026-11-20T00:00:00Z',
              }))
          ),
        get: async (
          _collection: string,
          path: string
        ): Promise<DocumentEntry | null> =>
          files[path] ? { path, document: files[path] } : null,
        update: async (
          _collection: string,
          path: string,
          value: TinaDocument
        ) => {
          writes.push(path);
          files[path] = value;
          return { path, document: value };
        },
      }),
    },
  }),
});

const post = (extra: Partial<CollectionSchema> = {}): CollectionSchema => ({
  name: 'post',
  label: 'Posts',
  path: 'content/posts',
  format: 'mdx',
  fields: [
    t.string({ name: 'title', label: 'Title' }),
    t.reference({ name: 'seo', label: 'SEO', collections: ['seo'] }),
  ],
  ...extra,
});

const seo = (extra: Partial<CollectionSchema> = {}): CollectionSchema => ({
  name: 'seo',
  label: 'SEO defaults',
  path: 'content/seos',
  format: 'mdx',
  hidden: true,
  fields: [t.string({ name: 'title', label: 'Title' })],
  ...extra,
});

const renderAdmin = (collections: CollectionSchema[] = [post(), seo()]) =>
  render(
    <TinaAdmin
      config={asResolvedConfig({
        plugins: [
          contentPlugin,
          stringFieldPlugin,
          referenceFieldPlugin,
          homePlugin,
        ],
        schema: { collections },
      })}
      queryClient={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    />
  );

const goTo = (hash: string) =>
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new PopStateEvent('popstate'));
  });

const navigator = () =>
  screen.findByRole('complementary', { name: 'Navigator' });

const homePanel = async (name: string | RegExp) =>
  within(
    await waitFor(() => {
      const shown = screen
        .getAllByRole('main')
        .find((main) => !main.classList.contains('hidden'));
      if (!shown) throw new Error('no shown main region');
      return shown;
    })
  ).findByRole('region', { name });

const titleInput = () => screen.findByRole('textbox', { name: /^Title/ });

const stubWidth = (width: number) =>
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: width >= Number(/min-width: (\d+)px/.exec(query)?.[1] ?? 0),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));

beforeEach(() => {
  files = {
    [POST]: { title: 'Hello', seo: SEO },
    [SEO]: { title: 'Defaults' },
    [SEO_NESTED]: { title: 'Nested' },
  };
  writes = [];
  window.location.hash = '';
});

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
  useFormStore.setState({ forms: {} });
});

describe('a hidden collection in the lists', () => {
  it('is left out of the tree, the Collections view and both home panels', async () => {
    window.location.hash = '#/';
    renderAdmin([
      post(),
      seo(),
      post({ name: 'page', label: 'Pages', path: 'content/pages' }),
    ]);

    const collections = await homePanel('Collections 2');
    const tiles = within(
      within(collections).getByRole('list', { name: 'Collections' })
    ).getAllByRole('button', { name: /^(Posts|Pages|SEO defaults)$/ });
    expect(tiles.map((tile) => tile.textContent)).toEqual(['Posts', 'Pages']);

    const recent = await homePanel('Recent documents');
    const rows = await within(recent).findByRole('list', {
      name: 'Recent documents',
    });
    await waitFor(() =>
      expect(within(rows).getAllByRole('button')).toHaveLength(1)
    );
    expect(rows).toHaveTextContent('Hello');
    expect(rows).not.toHaveTextContent('Defaults');

    await goTo('#/collections');
    const tree = within(await findCollectionTree());
    expect(
      tree
        .getAllByRole('button', { name: /^(Posts|Pages|SEO defaults)$/ })
        .map((group) => group.textContent)
    ).toEqual(['Posts', 'Pages']);

    await goTo('#/collections?max');
    const table = await screen.findByRole('table', { name: 'Collections' });
    expect(
      within(table)
        .getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getAllByRole('cell')[0]?.textContent)
    ).toEqual(['Posts', 'Pages']);
  });

  it('lists a collection whose hidden is false', async () => {
    window.location.hash = '#/collections';
    renderAdmin([post(), seo({ hidden: false })]);
    const tree = within(await findCollectionTree());
    expect(
      tree.getByRole('button', { name: 'SEO defaults' })
    ).toBeInTheDocument();
  });

  it('says No collections are listed. everywhere when every collection is hidden, and still opens one by URL', async () => {
    window.location.hash = '#/';
    renderAdmin([seo()]);
    const collections = await homePanel('Collections 0');
    expect(
      within(collections).getByText('No collections are listed.')
    ).toBeVisible();

    await goTo('#/collections');
    expect(
      await within(await navigator()).findByText('No collections are listed.')
    ).toBeVisible();

    await goTo('#/collections?max');
    expect(
      await within(
        await screen.findByRole('region', { name: 'Collections' })
      ).findByText('No collections are listed.')
    ).toBeVisible();

    await goTo('#/collections/seo?max');
    expect(
      await screen.findByRole('region', { name: 'SEO defaults documents' })
    ).toBeVisible();
  });

  it('is left out of the phone navigator', async () => {
    stubWidth(390);
    window.location.hash = `${hashOf('post', POST)}?nav`;
    renderAdmin();
    const tree = within(await findCollectionTree());
    expect(tree.getByRole('button', { name: 'Posts' })).toBeInTheDocument();
    expect(tree.queryByRole('button', { name: 'SEO defaults' })).toBeNull();
  });
});

describe('a hidden collection by URL', () => {
  it('opens its table and a document form, and saves the document', async () => {
    const user = userEvent.setup();
    window.location.hash = '#/collections/seo?max';
    renderAdmin();
    const table = await screen.findByRole('region', {
      name: 'SEO defaults documents',
    });
    expect(await within(table).findByText('Defaults')).toBeVisible();
    expect(screen.queryByText('Collection not found')).toBeNull();

    await goTo(hashOf('seo', SEO));
    const title = await titleInput();
    await waitFor(() => expect(title).toHaveValue('Defaults'));
    await user.type(title, ' v2');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(writes).toEqual([SEO]));
    expect(files[SEO]).toMatchObject({ title: 'Defaults v2' });
    expect(screen.queryByText('Collection not found')).toBeNull();
  });

  it('shows the collection it opens in the tree on its plain route, at every width', async () => {
    for (const width of [1440, 900, 390]) {
      stubWidth(width);
      window.location.hash = '#/collections/seo';
      const view = renderAdmin();
      const tree = within(await findCollectionTree());
      expect(
        tree.getByRole('button', { name: 'SEO defaults' })
      ).toHaveAttribute('aria-expanded', 'true');
      expect(
        within(
          await tree.findByRole('list', { name: 'SEO defaults documents' })
        ).getByRole('button', { name: 'defaults.mdx' })
      ).toBeVisible();
      view.unmount();
    }
  });

  it('keeps the collection in the tree after Restore on its table', async () => {
    const user = userEvent.setup();
    window.location.hash = '#/collections/seo?max';
    renderAdmin();
    await screen.findByRole('region', { name: 'SEO defaults documents' });
    await user.click(screen.getByRole('button', { name: 'Restore' }));
    await waitFor(() => expect(window.location.hash).toBe('#/collections/seo'));
    const tree = within(await findCollectionTree());
    expect(tree.getByRole('button', { name: 'SEO defaults' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(
      within(
        await tree.findByRole('list', { name: 'SEO defaults documents' })
      ).getByRole('button', { name: 'defaults.mdx' })
    ).toBeVisible();
  });

  it('opens a folder of the collection', async () => {
    window.location.hash = '#/collections/seo/folder/nested';
    renderAdmin();
    const table = await screen.findByRole('region', {
      name: 'SEO defaults documents',
    });
    expect(await within(table).findByText('Nested')).toBeVisible();
  });

  it('keeps an unsaved edit in Recent documents, with no saved rows of the collection', async () => {
    const user = userEvent.setup();
    window.location.hash = hashOf('seo', SEO);
    renderAdmin();
    const title = await titleInput();
    await waitFor(() => expect(title).toHaveValue('Defaults'));
    await user.type(title, ' v2');

    await goTo('#/');
    const recent = await homePanel('Recent documents');
    const rows = await within(recent).findByRole('list', {
      name: 'Recent documents',
    });
    await waitFor(() =>
      expect(
        within(rows)
          .getAllByRole('button')
          .map((row) => row.textContent)
      ).toEqual(['DefaultsUnsaved', expect.stringMatching(/^Hello/)])
    );
  });

  it('keeps an unsaved edit in Show unsaved only and in Save all, not under documents that are gone', async () => {
    const user = userEvent.setup();
    window.location.hash = hashOf('seo', SEO);
    renderAdmin();
    const title = await titleInput();
    await waitFor(() => expect(title).toHaveValue('Defaults'));
    await user.type(title, ' v2');

    await goTo('#/collections?unsaved');
    const unsaved = await screen.findByRole('list', {
      name: 'SEO defaults unsaved documents',
    });
    expect(
      within(unsaved).getByRole('button', { name: /defaults\.mdx/ })
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Collections menu' }));
    await user.click(
      await screen.findByRole('menuitem', { name: 'Show all documents' })
    );
    await within(await findCollectionTree()).findByRole('button', {
      name: 'Posts',
    });
    await goTo('#/collections?unsaved');
    await screen.findByRole('list', { name: 'SEO defaults unsaved documents' });
    expect(
      screen.queryByRole('list', { name: 'Edits for documents that are gone' })
    ).toBeNull();

    await user.click(screen.getByRole('button', { name: /^Save all/ }));
    await waitFor(() => expect(writes).toEqual([SEO]));
  });
});

describe('a reference to a hidden collection', () => {
  it('keeps the saved reference and offers the hidden documents', async () => {
    const user = userEvent.setup();
    window.location.hash = hashOf('post', POST);
    renderAdmin();
    const field = await screen.findByRole('combobox', { name: /^SEO/ });
    await waitFor(() => expect(field).toHaveValue('Defaults'));
    expect(screen.queryByText('This document no longer exists.')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    await user.click(field);
    await user.click(
      await screen.findByRole('option', {
        name: /^Defaults\s/,
      })
    );
    expect(field).toHaveValue('Defaults');
  });
});
