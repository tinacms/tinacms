import { QueryClient } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../config';
import type { ContentProvider } from '../core/content/contract';
import { definePlugin } from '../core/plugin';
import type { CollectionSchema } from '../core/schema/types';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import homePlugin from '../plugins/home/home.plugin';
import { connectionOf } from '../test/connection';
import { findCollectionTree } from '../test/collection-tree';
import { TinaAdmin } from './admin';

const COUNTS: Record<string, number> = { post: 3, page: 1 };

const provider: ContentProvider = {
  list: async (collection) => {
    if (collection === 'broken') throw new Error('offline');
    const total = COUNTS[collection] ?? 0;
    return connectionOf(
      Array.from({ length: total }, (_, index) => ({
        path: `content/${collection}s/doc-${index}.mdx`,
      }))
    );
  },
  get: async () => null,
  update: async (_collection, path, document) => ({ path, document }),
};

const contentPlugin = definePlugin({
  name: 'test:content',
  provides: ['content'],
  client: async () => ({
    default: {
      slice: () => ({
        list: provider.list,
        get: provider.get,
        update: provider.update,
      }),
    },
  }),
});

const collection = (
  name: string,
  extra: Partial<CollectionSchema> = {}
): CollectionSchema => ({
  name,
  path: `content/${name}s`,
  format: 'mdx',
  fields: [{ name: 'title', label: 'Title', type: 'string' }],
  ...extra,
});

const COLLECTIONS = [
  collection('post', { label: 'Posts', description: 'Blog posts.' }),
  collection('page', { label: 'Pages' }),
];

const renderAdmin = ({
  collections = COLLECTIONS,
  withHome = true,
}: {
  collections?: CollectionSchema[];
  withHome?: boolean;
} = {}) =>
  render(
    <TinaAdmin
      config={asResolvedConfig({
        plugins: [
          contentPlugin,
          stringFieldPlugin,
          ...(withHome ? [homePlugin] : []),
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

const homeFrame = () => document.querySelector('[data-slot=home-frame]');

beforeEach(() => {
  window.location.hash = '#/collections';
});

describe('the minimised Collections pane', () => {
  it('shows the tree with the Home screen beside it, and keeps both when a collection is chosen', async () => {
    const user = userEvent.setup();
    window.location.hash = '#/collections/post';
    renderAdmin();
    const tree = within(await findCollectionTree());
    expect(tree.getByRole('button', { name: 'Posts' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(tree.getByRole('button', { name: 'Pages' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    await waitFor(() => expect(homeFrame()).not.toBeNull());

    await user.click(tree.getByRole('button', { name: 'Pages' }));
    await waitFor(() =>
      expect(window.location.hash).toBe('#/collections/page')
    );
    expect(homeFrame()).not.toBeNull();
    expect(
      screen.queryByRole('region', { name: 'Pages documents' })
    ).toBeNull();
  });

  it('shows the preview slot instead without the Home plugin', async () => {
    renderAdmin({ withHome: false });
    await findCollectionTree();
    expect(await screen.findByText('Select a document to edit.')).toBeVisible();
    expect(homeFrame()).toBeNull();
  });

  it('offers an icon Maximise that opens the open collection, or the index when none is open', async () => {
    const user = userEvent.setup();
    renderAdmin();
    const pane = within(
      await screen.findByRole('complementary', { name: 'Navigator' })
    );
    expect(pane.queryByText('Maximise')).toBeNull();
    await user.click(pane.getByRole('button', { name: 'Maximise' }));
    await waitFor(() => expect(window.location.hash).toBe('#/collections?max'));
    await user.click(await screen.findByRole('button', { name: 'Restore' }));

    goTo('#/collections/post');
    await user.click(
      await within(
        await screen.findByRole('complementary', { name: 'Navigator' })
      ).findByRole('button', { name: 'Maximise' })
    );
    await waitFor(() =>
      expect(window.location.hash).toBe('#/collections/post?max')
    );
  });
});

describe('the maximised views', () => {
  it('shows the collections index, whose Restore goes to the tree and Close to Home', async () => {
    const user = userEvent.setup();
    window.location.hash = '#/collections?max';
    renderAdmin();
    expect(
      await screen.findByRole('heading', { name: 'Collections' })
    ).toBeVisible();
    expect(
      screen.queryByRole('complementary', { name: 'Navigator' })
    ).toBeNull();
    expect(screen.getByRole('button', { name: 'Restore' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    await user.click(screen.getByRole('button', { name: 'Restore' }));
    await waitFor(() => expect(window.location.hash).toBe('#/collections'));
    expect(
      await screen.findByRole('complementary', { name: 'Navigator' })
    ).toBeVisible();

    goTo('#/collections?max');
    await user.click(await screen.findByRole('button', { name: 'Close' }));
    await waitFor(() => expect(window.location.hash).toBe('#/'));
  });

  it('lists each collection with its description and document count', async () => {
    window.location.hash = '#/collections?max';
    renderAdmin({
      collections: [...COLLECTIONS, collection('broken', { label: 'Broken' })],
    });
    const table = await screen.findByRole('table', { name: 'Collections' });
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((head) => head.textContent)
    ).toEqual(['Title', 'Description', 'Documents']);
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(3);
    expect(
      within(rows[0] as HTMLElement).getByText('Blog posts.')
    ).toBeVisible();
    await waitFor(() => expect(rows[0]).toHaveTextContent('3 documents'));
    await waitFor(() => expect(rows[1]).toHaveTextContent('1 document'));
    expect(rows[1]).not.toHaveTextContent('1 documents');
    await waitFor(() => expect(rows[2]).toHaveTextContent('Can’t count'));
    expect(rows[0]).toHaveTextContent('3 documents');
  });

  it('opens a collection table from a row, by click and by Enter', async () => {
    const user = userEvent.setup();
    window.location.hash = '#/collections?max';
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: 'Posts' }));
    await waitFor(() =>
      expect(window.location.hash).toBe('#/collections/post?max')
    );
    expect(
      await screen.findByRole('region', { name: 'Posts documents' })
    ).toBeVisible();

    goTo('#/collections?max');
    const pages = await screen.findByRole('button', { name: 'Pages' });
    pages.focus();
    await user.keyboard('{Enter}');
    await waitFor(() =>
      expect(window.location.hash).toBe('#/collections/page?max')
    );
  });

  it('says so when the schema has no collections', async () => {
    window.location.hash = '#/collections?max';
    renderAdmin({ collections: [] });
    expect(await screen.findByText('No collections yet.')).toBeVisible();
  });

  it('shows a folder table maximised, and Collection not found for an unknown collection', async () => {
    window.location.hash = '#/collections/post/folder/a';
    renderAdmin();
    expect(
      await screen.findByRole('region', { name: 'Posts documents' })
    ).toBeVisible();
    expect(
      screen.queryByRole('complementary', { name: 'Navigator' })
    ).toBeNull();

    goTo('#/collections/ghost?max');
    expect(
      await screen.findByRole('heading', { name: 'Collection not found' })
    ).toBeVisible();
  });

  it('marks Collections active on the index', async () => {
    window.location.hash = '#/collections?max';
    renderAdmin();
    expect(
      await within(
        await screen.findByRole('navigation', { name: 'Content' })
      ).findByRole('button', { name: 'Collections' })
    ).toHaveAttribute('aria-current', 'page');
  });
});
