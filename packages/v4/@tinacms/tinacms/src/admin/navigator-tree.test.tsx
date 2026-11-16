import { QueryClient } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../config';
import { ContentError, type ContentProvider } from '../core/content/contract';
import { queryDocuments } from '../core/content/list-query';
import { definePlugin } from '../core/plugin';
import { contentKeys } from '../editor/content-queries';
import { toFormId, useFormStore } from '../form/form-store';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import { returnToTree } from '../test/collection-tree';
import { TinaAdmin } from './admin';

const ROOT = 'content/posts';

let files: string[];
let emptyFolders: string[];
let failFolder: string | undefined;
let heldFolder: { folder: string; release: Promise<void> } | undefined;
let queryClient: QueryClient;

const provider: ContentProvider = {
  list: async (_collection, query) => {
    const folder = query?.folder;
    if (folder !== undefined && folder === failFolder) {
      throw new ContentError('backend-failure', 'disk unreadable');
    }
    if (heldFolder && heldFolder.folder === folder) await heldFolder.release;
    return queryDocuments({
      summaries: files.map((path) => ({ path: `${ROOT}/${path}` })),
      root: ROOT,
      emptyFolders,
      query,
    });
  },
  get: async (_collection, path) => ({ path, document: { title: path } }),
  update: async (_collection, path, document) => ({ path, document }),
};

const contentPlugin = definePlugin({
  name: 'test:content',
  provides: ['content'],
  client: async () => ({ default: { slice: () => ({ ...provider }) } }),
});

const renderAdmin = () =>
  render(
    <TinaAdmin
      config={asResolvedConfig({
        plugins: [contentPlugin, stringFieldPlugin],
        schema: {
          collections: [
            {
              name: 'post',
              label: 'Posts',
              path: ROOT,
              format: 'mdx',
              fields: [{ name: 'title', label: 'Title', type: 'string' }],
            },
          ],
        },
      })}
      queryClient={queryClient}
    />
  );

const goTo = (hash: string) =>
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new PopStateEvent('popstate'));
  });

const refreshTree = () =>
  act(() =>
    queryClient.invalidateQueries({ queryKey: contentKeys.list('post') })
  );

const rowNames = (list: HTMLElement) =>
  within(list)
    .getAllByRole('button')
    .map((button) => button.textContent);

const openTree = async () => {
  goTo('#/collections/post');
  return screen.findByRole('list', { name: 'Posts documents' });
};

beforeEach(() => {
  files = ['x.md', 'a/y.md', 'a/b/z.md', 'a/b/w.md', 'c/v.md'];
  emptyFolders = [];
  failFolder = undefined;
  heldFolder = undefined;
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
});

afterEach(() => {
  window.location.hash = '';
  useFormStore.setState({ forms: {} });
});

describe('folders in the navigator tree', () => {
  it('shows collapsed folders first, then the documents, and opens and collapses each level', async () => {
    const user = userEvent.setup();
    renderAdmin();
    const top = await openTree();
    expect(rowNames(top)).toEqual(['a', 'c', 'x.md']);
    expect(screen.getByRole('button', { name: 'a' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );

    await user.click(screen.getByRole('button', { name: 'a' }));
    const inA = await screen.findByRole('list', { name: 'a documents' });
    expect(rowNames(inA)).toEqual(['b', 'y.md']);

    await user.click(within(inA).getByRole('button', { name: 'b' }));
    const inB = await screen.findByRole('list', { name: 'b documents' });
    expect(rowNames(inB)).toEqual(['w.md', 'z.md']);

    await user.click(screen.getByRole('button', { name: 'a' }));
    expect(screen.queryByRole('list', { name: 'a documents' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'y.md' })).toBeNull();
  });

  it('opens a folder without navigating or maximising', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await openTree();
    const hash = window.location.hash;
    await user.click(screen.getByRole('button', { name: 'a' }));
    await screen.findByRole('list', { name: 'a documents' });
    expect(window.location.hash).toBe(hash);
    expect(window.location.hash).not.toContain('max');
  });

  it('opens a document from a folder and returns to the tree with it selected and its folders open', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await openTree();
    await user.click(screen.getByRole('button', { name: 'a' }));
    await user.click(await screen.findByRole('button', { name: 'b' }));
    await user.click(await screen.findByRole('button', { name: 'z.md' }));
    await waitFor(() =>
      expect(window.location.hash).toContain(
        encodeURIComponent(`${ROOT}/a/b/z.md`)
      )
    );
    await returnToTree(user);
    const selected = await screen.findByRole('button', { name: 'z.md' });
    expect(selected).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'a' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByRole('button', { name: 'b' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('opens every folder above a document opened from outside the tree', async () => {
    const user = userEvent.setup();
    renderAdmin();
    goTo(`#/collections/post/${encodeURIComponent(`${ROOT}/a/b/z.md`)}`);
    await screen.findByLabelText(/^Title\b/);
    await returnToTree(user);
    expect(await screen.findByRole('button', { name: 'z.md' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('button', { name: 'a' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('shows a rename, a delete and a new folder after the lists refresh', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await openTree();
    await user.click(screen.getByRole('button', { name: 'a' }));
    await screen.findByRole('list', { name: 'a documents' });

    files = files.map((path) => path.replace(/^a\/y\.md$/, 'a/renamed.md'));
    await refreshTree();
    await screen.findByRole('button', { name: 'renamed.md' });
    expect(screen.queryByRole('button', { name: 'y.md' })).toBeNull();

    files = files.filter((path) => !path.startsWith('c/'));
    emptyFolders = ['d'];
    await refreshTree();
    await screen.findByRole('button', { name: 'd' });
    expect(screen.queryByRole('button', { name: 'c' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'd' }));
    const empty = (await screen.findAllByText('No documents yet.')).at(0);
    expect(empty).toBeVisible();
  });

  it('keeps a renamed folder open under its new name', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await openTree();
    await user.click(screen.getByRole('button', { name: 'a' }));
    await user.click(await screen.findByRole('button', { name: 'b' }));
    await screen.findByRole('button', { name: 'z.md' });

    files = files.map((path) => path.replace(/^a\//, 'renamed/'));
    await refreshTree();
    const renamed = await screen.findByRole('button', { name: 'renamed' });
    expect(renamed).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByRole('button', { name: 'b' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByRole('button', { name: 'z.md' })).toBeVisible();
  });

  it('keeps open folders through a trip to the table, and opens the folder a Restore leaves', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await openTree();
    await user.click(screen.getByRole('button', { name: 'a' }));
    await screen.findByRole('list', { name: 'a documents' });
    await user.click(screen.getByRole('button', { name: 'Maximise' }));
    await user.click(await screen.findByRole('button', { name: 'Restore' }));
    expect(await screen.findByRole('button', { name: 'a' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );

    goTo('#/collections/post/folder/c');
    await user.click(await screen.findByRole('button', { name: 'Restore' }));
    expect(await screen.findByRole('button', { name: 'c' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(await screen.findByRole('button', { name: 'v.md' })).toBeVisible();
  });

  it('shows only the folders of a collection that holds no documents', async () => {
    files = ['a/y.md'];
    renderAdmin();
    await openTree();
    expect(screen.getByRole('button', { name: 'a' })).toBeVisible();
    expect(screen.queryByText('No documents yet.')).toBeNull();
  });

  it('lists an unsaved copy after the folders and before the documents', async () => {
    useFormStore
      .getState()
      .storeNewDocumentDraft(toFormId(`${ROOT}/a/x-copy.md`), {
        title: 'Copy',
      });
    const user = userEvent.setup();
    renderAdmin();
    await openTree();
    await user.click(screen.getByRole('button', { name: 'a' }));
    const inA = await screen.findByRole('list', { name: 'a documents' });
    expect(rowNames(inA)).toEqual(['b', 'x-copy.mdUnsaved', 'y.md']);
  });

  it('shows a placeholder while a level loads', async () => {
    let release = () => {};
    heldFolder = {
      folder: 'a',
      release: new Promise<void>((resolve) => {
        release = resolve;
      }),
    };
    const user = userEvent.setup();
    renderAdmin();
    await openTree();
    await user.click(screen.getByRole('button', { name: 'a' }));
    expect(await screen.findByText('Loading…')).toBeVisible();
    release();
    await screen.findByRole('list', { name: 'a documents' });
  });

  it('says a level failed, retries only that level, and leaves the rest working', async () => {
    failFolder = 'a';
    const user = userEvent.setup();
    renderAdmin();
    await openTree();
    await user.click(screen.getByRole('button', { name: 'a' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Something went wrong. Please try again.');
    await user.click(screen.getByRole('button', { name: 'c' }));
    expect(await screen.findByRole('button', { name: 'v.md' })).toBeVisible();

    failFolder = undefined;
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('button', { name: 'y.md' })).toBeVisible();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('lists the documents of a collection with no folders in path order', async () => {
    files = ['b.md', 'a.md', 'c.md'];
    renderAdmin();
    const top = await openTree();
    expect(rowNames(top)).toEqual(['a.md', 'b.md', 'c.md']);
  });
});
