import { QueryClient } from '@tanstack/react-query';
import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { asResolvedConfig } from '../config';
import {
  ContentError,
  type ContentProvider,
  type DocumentEntry,
} from '../core/content/contract';
import { definePlugin } from '../core/plugin';
import { toFormId, useFormStore } from '../form/form-store';
import { readDraft, writeDraft } from '../form/drafts';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import coreValidatorsPlugin from '../plugins/validators/core-validators.plugin';
import { openCollectionTree } from '../test/collection-tree';
import { connectionOf } from '../test/connection';
import { TinaAdmin } from './admin';

// The shell also draws an upload status region, so pick the document's own.
const documentStatus = (): HTMLElement => {
  const status = screen
    .getAllByRole('status')
    .find((element) => !element.hasAttribute('data-upload-status'));
  if (!status) throw new Error('The document status is not on screen.');
  return status;
};

const FOLDER_PATH = 'content/posts/a/hello-copy.mdx';
const TOP_PATH = 'content/posts/top-copy.mdx';

const files = new Map<string, DocumentEntry>();
const create = vi.fn<NonNullable<ContentProvider['create']>>();
const update = vi.fn<ContentProvider['update']>();

const provider: ContentProvider = {
  list: async () =>
    connectionOf(
      [...files.values()].map(({ document: _document, ...summary }) => summary)
    ),
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
    expect(documentStatus()).toHaveTextContent('Unsaved');
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
    await waitFor(() => expect(documentStatus()).toHaveTextContent('Saved'));
    expect(readDraft(toFormId(FOLDER_PATH))).toBeUndefined();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('shows the saved document in the navigator tree', async () => {
    const user = userEvent.setup();
    await act(async () => {
      keepCopy(TOP_PATH);
    });
    renderAdmin();
    await openCollectionTree('post');
    const tree = await screen.findByRole('list', { name: 'Posts documents' });
    expect(within(tree).getByText('Unsaved')).toBeVisible();
    await user.click(within(tree).getByRole('button', { name: /top-copy/ }));
    await screen.findByLabelText(/^Title\b/);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(documentStatus()).toHaveTextContent('Saved'));
    await user.click(
      screen.getByRole('button', { name: 'Return to navigator' })
    );
    await user.click(await screen.findByRole('button', { name: 'Restore' }));
    const after = await screen.findByRole('list', { name: 'Posts documents' });
    expect(
      await within(after).findByRole('button', { name: 'top-copy.mdx' })
    ).toBeVisible();
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
    [TOP_PATH, '#/collections/post?max'],
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

describe('discarding an unsaved copy', () => {
  it('says the copy is removed, not that it goes back to a saved version', async () => {
    const user = userEvent.setup();
    keepCopy(TOP_PATH);
    openCopy(TOP_PATH);
    renderAdmin();
    await screen.findByLabelText(/^Title\b/);
    await user.click(screen.getByRole('button', { name: 'Document actions' }));
    await user.click(
      await screen.findByRole('menuitem', { name: 'Discard unsaved edits' })
    );
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent('The unsaved copy is removed.');
    expect(dialog).not.toHaveTextContent('last saved version');
  });
});

describe('the collection views', () => {
  beforeEach(() => {
    files.set('content/posts/a/hello.mdx', {
      path: 'content/posts/a/hello.mdx',
      document: { title: 'Hello' },
    });
  });

  it('Restore returns the collection table to the tree', async () => {
    const user = userEvent.setup();
    window.location.hash = '#/collections/post?max';
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: 'Restore' }));
    expect(window.location.hash).toBe('#/collections/post');
    expect(
      await screen.findByRole('list', { name: 'Posts documents' })
    ).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Restore' })).toBeNull();
  });

  it('Restore returns a folder table to its collection in the tree', async () => {
    const user = userEvent.setup();
    window.location.hash = '#/collections/post/folder/a';
    renderAdmin();
    await user.click(await screen.findByRole('button', { name: 'Restore' }));
    expect(window.location.hash).toBe('#/collections/post');
    expect(
      await screen.findByRole('list', { name: 'Posts documents' })
    ).toBeVisible();
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
      expect(window.location.hash).toBe('#/collections/post?max')
    );
  });

  it('marks Collections active on the table and folder views', async () => {
    window.location.hash = '#/collections/post/folder/a';
    renderAdmin();
    const collections = within(
      await screen.findByRole('navigation', { name: 'Content' })
    ).getByRole('button', { name: 'Collections' });
    expect(collections).toHaveAttribute('aria-current', 'page');
  });
});

describe('the table after a save and after Duplicate', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', (query: string) => {
      const min = /min-width: (\d+)px/.exec(query);
      return {
        matches: min ? 1400 >= Number(min[1]) : false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      };
    });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the new Last edited and Saved on the row after Back, without a reload', async () => {
    const user = userEvent.setup();
    files.set('content/posts/top.mdx', {
      path: 'content/posts/top.mdx',
      updatedAt: '2020-01-01T00:00:00Z',
      document: { title: 'Top' },
    });
    update.mockImplementation(async (_collection, path, value) => {
      const entry = {
        path,
        updatedAt: new Date().toISOString(),
        document: value,
      };
      files.set(path, entry);
      return entry;
    });
    window.location.hash = `#/collections/post/${encodeURIComponent('content/posts/top.mdx')}`;
    renderAdmin();
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(documentStatus()).toHaveTextContent('Saved'));
    await user.click(
      screen.getByRole('button', { name: 'Return to navigator' })
    );
    const row = (
      await screen.findByRole('button', { name: 'top.mdx' })
    ).closest('tr');
    if (!row) throw new Error('the document has no row');
    await waitFor(() =>
      expect(within(row).getByText('just now')).toBeVisible()
    );
    expect(within(row).queryByText('Unsaved')).toBeNull();
  });

  it('duplicates the saved original under a checked name and opens the copy unsaved', async () => {
    const user = userEvent.setup();
    files.set('content/posts/hello.mdx', {
      path: 'content/posts/hello.mdx',
      document: { title: 'Hello' },
    });
    files.set('content/posts/taken.mdx', {
      path: 'content/posts/taken.mdx',
      document: { title: 'Taken' },
    });
    writeDraft(toFormId('content/posts/hello.mdx'), {
      values: { title: 'Unsaved edit' },
      baseline: { title: 'Hello' },
    });
    window.location.hash = '#/collections/post?max';
    renderAdmin();
    await user.click(
      await screen.findByRole('button', { name: 'Actions for hello.mdx' })
    );
    await user.click(
      await screen.findByRole('menuitem', { name: 'Duplicate' })
    );
    const dialog = await screen.findByRole('dialog', { name: /Duplicate/ });
    const box = within(dialog).getByRole('textbox', {
      name: 'File name for the copy',
    });
    expect(box).toHaveValue('hello-copy');

    await user.clear(box);
    await user.type(box, 'taken');
    await user.click(within(dialog).getByRole('button', { name: 'Duplicate' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'A document or folder with that name already exists.'
    );

    await user.clear(box);
    await user.type(box, '.hidden');
    await user.click(within(dialog).getByRole('button', { name: 'Duplicate' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'That name is not allowed.'
    );
    expect(window.location.hash).toBe('#/collections/post?max');

    await user.clear(box);
    await user.type(box, 'fresh');
    await user.click(within(dialog).getByRole('button', { name: 'Duplicate' }));
    await waitFor(() =>
      expect(window.location.hash).toBe(
        `#/collections/post/${encodeURIComponent('content/posts/fresh.mdx')}`
      )
    );
    expect(await screen.findByLabelText(/^Title\b/)).toHaveValue('Hello');
    expect(documentStatus()).toHaveTextContent('Unsaved');
    expect(create).not.toHaveBeenCalled();
    expect(files.has('content/posts/fresh.mdx')).toBe(false);
  });
});

// A toast still on screen at the end of a file leaves a removal timer that fires after the test environment is gone.
afterAll(async () => {
  cleanup();
  await new Promise((resolve) => setTimeout(resolve, 300));
});
