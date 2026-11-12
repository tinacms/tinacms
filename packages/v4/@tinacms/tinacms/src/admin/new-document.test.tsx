import { QueryClient } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import {
  ContentError,
  type ContentProvider,
  type DocumentEntry,
} from '../core/content/contract';
import { definePlugin } from '../core/plugin';
import { toFormId, useFormStore } from '../form/form-store';
import { readDraft } from '../form/drafts';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import coreValidatorsPlugin from '../plugins/validators/core-validators.plugin';
import { connectionOf } from '../test/connection';
import { TinaAdmin } from './admin';

const FOLDER_PATH = 'content/posts/a/hello-copy.mdx';
const TOP_PATH = 'content/posts/top-copy.mdx';

const files = new Map<string, DocumentEntry>();
const create = vi.fn<NonNullable<ContentProvider['create']>>();
const update = vi.fn<ContentProvider['update']>();

const provider: ContentProvider = {
  list: async () =>
    connectionOf([...files.values()].map(({ path }) => ({ path }))),
  get: async (_collection, path) => files.get(path) ?? null,
  update,
  create,
};

const contentPlugin = definePlugin({
  name: 'test:content',
  provides: ['content'],
  client: async () => ({
    default: { slice: () => ({ ...provider }) },
  }),
});

const config = asResolvedConfig({
  plugins: [contentPlugin, stringFieldPlugin, coreValidatorsPlugin],
  schema: {
    collections: [
      {
        name: 'post',
        label: 'Posts',
        path: 'content/posts',
        format: 'mdx',
        fields: [{ name: 'title', label: 'Title', type: 'string' }],
      },
    ],
  },
});

const renderAdmin = () =>
  render(
    <TinaAdmin
      config={config}
      queryClient={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    />
  );

const openCopy = (path: string) => {
  window.location.hash = `#/collections/post/${encodeURIComponent(path)}`;
};

const keepCopy = (path: string) =>
  useFormStore
    .getState()
    .storeNewDocumentDraft(toFormId(path), { title: 'Hello copy' });

beforeEach(() => {
  files.clear();
  create.mockReset();
  update.mockReset();
  create.mockImplementation(async (_collection, path, value) => {
    const entry = { path, document: value };
    files.set(path, entry);
    return entry;
  });
});

describe('a document with no file yet', () => {
  it('opens a stored copy as an unsaved form', async () => {
    keepCopy(FOLDER_PATH);
    openCopy(FOLDER_PATH);
    renderAdmin();
    expect(await screen.findByLabelText(/^Title\b/)).toHaveValue('Hello copy');
    expect(screen.getByRole('status')).toHaveTextContent('Unsaved');
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('says not found when no copy is stored for the address', async () => {
    openCopy(FOLDER_PATH);
    renderAdmin();
    expect(await screen.findByText('Document not found')).toBeVisible();
  });

  it('creates the file on Save and reads as saved afterwards', async () => {
    const user = userEvent.setup();
    keepCopy(FOLDER_PATH);
    openCopy(FOLDER_PATH);
    renderAdmin();
    await screen.findByLabelText(/^Title\b/);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    expect(create).toHaveBeenCalledWith('post', FOLDER_PATH, {
      title: 'Hello copy',
    });
    expect(update).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Saved')
    );
    expect(readDraft(toFormId(FOLDER_PATH))).toBeUndefined();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('keeps the copy when the name is taken by the time of Save', async () => {
    const user = userEvent.setup();
    create.mockRejectedValue(new ContentError('name-taken'));
    keepCopy(FOLDER_PATH);
    openCopy(FOLDER_PATH);
    renderAdmin();
    await screen.findByLabelText(/^Title\b/);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(
      await screen.findByText(
        /A document or folder with that name already exists/
      )
    ).toBeVisible();
    expect(readDraft(toFormId(FOLDER_PATH))?.new).toBe(true);
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it.each([
    [FOLDER_PATH, '#/collections/post/folder/a'],
    [TOP_PATH, '#/collections/post'],
  ])(
    'drops the copy on Discard and returns to the table of %s',
    async (path, hash) => {
      const user = userEvent.setup();
      keepCopy(path);
      openCopy(path);
      renderAdmin();
      await screen.findByLabelText(/^Title\b/);
      await user.click(
        screen.getByRole('button', { name: 'Document actions' })
      );
      await user.click(
        await screen.findByRole('menuitem', { name: 'Discard unsaved edits' })
      );
      const dialog = await screen.findByRole('alertdialog');
      await user.click(within(dialog).getByRole('button', { name: 'Discard' }));
      await waitFor(() => expect(window.location.hash).toBe(hash));
      expect(readDraft(toFormId(path))).toBeUndefined();
    }
  );
});

describe('the collection views', () => {
  beforeEach(() => {
    files.set('content/posts/a/hello.mdx', {
      path: 'content/posts/a/hello.mdx',
      document: { title: 'Hello' },
    });
  });

  it('fills the screen with the table and Restore returns to the tree', async () => {
    const user = userEvent.setup();
    window.location.hash = '#/collections/post';
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: 'Restore' }));
    expect(window.location.hash).toBe('#/collections/post?side');
    expect(
      await screen.findByRole('list', { name: 'Posts documents' })
    ).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Restore' })).toBeNull();
  });

  it('goes Back from a nested document to its folder, and from a top-level one to the collection', async () => {
    const user = userEvent.setup();
    files.set('content/posts/top.mdx', {
      path: 'content/posts/top.mdx',
      document: { title: 'Top' },
    });
    window.location.hash = `#/collections/post/${encodeURIComponent('content/posts/a/hello.mdx')}`;
    renderAdmin();
    await screen.findByLabelText(/^Title\b/);
    await user.click(
      screen.getByRole('button', { name: 'Return to navigator' })
    );
    await waitFor(() =>
      expect(window.location.hash).toBe('#/collections/post/folder/a')
    );
    act(() => {
      window.location.hash = `#/collections/post/${encodeURIComponent('content/posts/top.mdx')}`;
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await screen.findByDisplayValue('Top');
    await user.click(
      screen.getByRole('button', { name: 'Return to navigator' })
    );
    await waitFor(() =>
      expect(window.location.hash).toBe('#/collections/post')
    );
  });

  it('marks Collections active on the table, folder and side views', async () => {
    window.location.hash = '#/collections/post/folder/a';
    renderAdmin();
    const collections = await screen.findByRole('button', {
      name: 'Collections',
    });
    expect(collections).toHaveAttribute('aria-current', 'page');
  });
});
