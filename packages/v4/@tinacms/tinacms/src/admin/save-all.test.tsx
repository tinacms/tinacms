import { QueryClient } from '@tanstack/react-query';
import { toast } from '@tinacms/ui/components/toast';
import { configure } from '@testing-library/dom';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import type { BranchInfo } from '../core/branch/contract';
import { currentBranchOf } from '../core/branch/contract';
import { ContentError } from '../core/content/contract';
import type { DocumentEntry } from '../core/content/contract';
import { definePlugin } from '../core/plugin';
import type { FieldSchema, TinaDocument } from '../core/schema/types';
import { draftKey } from '../form/drafts';
import { toFormId, useFormStore } from '../form/form-store';
import { required } from '../plugins/fields';
import arrayFieldPlugin from '../plugins/fields/array/array-field.plugin';
import objectFieldPlugin from '../plugins/fields/object/object-field.plugin';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import homePlugin from '../plugins/home/home.plugin';
import coreValidatorsPlugin from '../plugins/validators/core-validators.plugin';
import { guardConsole } from '../test/console-guard';
import { simulateReload } from '../test/simulate-reload';
import { SidebarProvider } from '@tinacms/ui/components/sidebar';
import { HashRouter } from 'react-router-dom';
import { TinaProvider } from '../editor/provider';
import { TinaAdmin } from './admin';
import { ShellTopBar } from './shell-bars';

// The toast's action button captures the pointer, which happy-dom does not implement.
Element.prototype.setPointerCapture = () => undefined;
Element.prototype.releasePointerCapture = () => undefined;

// CI runs these on a loaded machine: the admin takes seconds to boot.
configure({ asyncUtilTimeout: 20_000 });

const consoleGuard = guardConsole();

const PAGE = 'content/pages/about.mdx';
const POST = 'content/posts/hello.mdx';
const POST_B = 'content/posts/second.mdx';
const hashOf = (collection: string, path: string) =>
  `#/collections/${collection}/${encodeURIComponent(path)}`;

type Mode = 'local' | 'branches';
const BRANCHES: BranchInfo[] = [
  { name: 'main', protected: true },
  { name: 'feature/news' },
];

let mode: Mode;
let files: Record<string, TinaDocument>;
let writes: { path: string; value: TinaDocument }[];
let inFlight: number;
let maxInFlight: number;
let held: Map<string, () => void>;
let holdPaths: Set<string>;
let failWrite: Map<string, Error>;
let beforeSaves: { path: string }[];
let afterSaves: { path: string }[];
let failBeforeSave: boolean;
let failAfterSave: boolean;
let gets: string[];
let holdList: Promise<void> | undefined;
let listFails: boolean;

let serverAudit = false;

const auditPlugin = () =>
  definePlugin({
    name: 'test:audit',
    provides: ['hooks'],
    hooks: ['audit'],
    ...(serverAudit ? { serverHooks: ['audit'] } : {}),
    client: async () => ({
      default: {
        hooks: {
          audit: () => ({
            beforeSave: (
              document: TinaDocument,
              scope: { path: string; collection: { name: string } }
            ) => {
              beforeSaves.push({ path: scope.path });
              if (failBeforeSave) throw new Error('audit refused');
              return document;
            },
            afterSave: (
              _document: TinaDocument,
              scope: { path: string; collection: { name: string } }
            ) => {
              afterSaves.push({ path: scope.path });
              if (failAfterSave) throw new Error('audit endpoint down');
            },
          }),
        },
      },
    }),
  });

const contentPlugin = () =>
  definePlugin({
    name: 'test:content',
    provides: ['content'],
    client: async () => ({
      default: {
        slice: (_set, get) => ({
          ...(mode === 'local'
            ? { local: true }
            : {
                branches: {
                  list: async () => {
                    await holdList;
                    if (listFails) throw new Error('offline');
                    return BRANCHES;
                  },
                  defaultBranch: async () => 'main',
                },
              }),
          list: async (collection: string) =>
            Object.keys(files)
              .filter((path) => path.includes(`/${collection}s/`))
              .map((path) => ({ path })),
          get: async (
            _collection: string,
            path: string
          ): Promise<DocumentEntry | null> => {
            gets.push(path);
            return files[path] ? { path, document: files[path] } : null;
          },
          update: async (
            _collection: string,
            path: string,
            value: TinaDocument
          ) => {
            void currentBranchOf(get());
            inFlight += 1;
            maxInFlight = Math.max(maxInFlight, inFlight);
            try {
              if (holdPaths.has(path)) {
                await new Promise<void>((resolve) => {
                  held.set(path, resolve);
                });
              }
              const error = failWrite.get(path);
              if (error) throw error;
              writes.push({ path, value });
              files[path] = value;
              return { path, document: value };
            } finally {
              inFlight -= 1;
            }
          },
        }),
      },
    }),
  });

const seoField = {
  name: 'seo',
  label: 'SEO',
  type: 'object',
  fields: [
    {
      name: 'heading',
      label: 'Heading',
      type: 'string',
      validators: [required()],
    },
  ],
} as FieldSchema;

const deepField = {
  name: 'deep',
  label: 'Deep',
  type: 'object',
  fields: [
    {
      name: 'inner',
      label: 'Inner',
      type: 'object',
      fields: [
        {
          name: 'note',
          label: 'Note',
          type: 'string',
          validators: [required()],
        },
      ],
    },
  ],
} as FieldSchema;

const linksField = {
  name: 'links',
  label: 'Links',
  type: 'array',
  fields: [
    { name: 'url', label: 'URL', type: 'string', validators: [required()] },
  ],
} as FieldSchema;

const renderAdmin = () =>
  render(
    <TinaAdmin
      config={asResolvedConfig({
        plugins: [
          contentPlugin(),
          auditPlugin(),
          stringFieldPlugin,
          objectFieldPlugin,
          arrayFieldPlugin,
          coreValidatorsPlugin,
          homePlugin,
        ],
        schema: {
          collections: [
            {
              name: 'page',
              label: 'Pages',
              path: 'content/pages',
              format: 'mdx',
              fields: [
                {
                  name: 'title',
                  label: 'Title',
                  type: 'string',
                  validators: [required()],
                },
                seoField,
                deepField,
                linksField,
              ],
            },
            {
              name: 'post',
              label: 'Posts',
              path: 'content/posts',
              format: 'mdx',
              hooks: [{ name: 'audit' }],
              fields: [
                {
                  name: 'title',
                  label: 'Title',
                  type: 'string',
                  validators: [required()],
                },
                { name: 'slug', label: 'Slug', type: 'string' },
              ],
            },
          ],
        },
      })}
      queryClient={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    />
  );

const goTo = (collection: string, path: string) =>
  act(() => {
    window.location.hash = hashOf(collection, path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  });

const saveAll = () => screen.getByRole('button', { name: /^Save all/ });
const statusBar = () => screen.getByRole('contentinfo', { name: 'Status bar' });
const titleInput = () =>
  screen.findByLabelText(/^Title\b/, { selector: 'input' });

/** Edits the open Page: clears the required title. Then opens the Post and changes its slug. */
const editPageThenPost = async (user: ReturnType<typeof userEvent.setup>) => {
  window.location.hash = hashOf('page', PAGE);
  renderAdmin();
  await user.clear(await titleInput());
  await goTo('post', POST);
  await user.type(await screen.findByLabelText(/^Slug\b/), '-x');
};

const openResults = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'Save results' }));
  return screen.findByRole('dialog', { name: 'Save results' });
};

const toastShown = () => document.querySelector('[data-slot=toast]');

beforeEach(() => {
  mode = 'local';
  files = {
    [PAGE]: {
      title: 'About',
      seo: { heading: 'Hi' },
      deep: { inner: { note: 'n' } },
      links: [{ url: 'a' }, { url: 'b' }],
    },
    [POST]: { title: 'Hello', slug: 'hello' },
    [POST_B]: { title: 'Second', slug: 'second' },
  };
  writes = [];
  inFlight = 0;
  maxInFlight = 0;
  held = new Map();
  holdPaths = new Set();
  failWrite = new Map();
  beforeSaves = [];
  afterSaves = [];
  failBeforeSave = false;
  failAfterSave = false;
  gets = [];
  holdList = undefined;
  listFails = false;
  serverAudit = false;
  window.location.hash = '';
});

describe('Save All button', () => {
  it('shows in the top bar, is off with nothing dirty and on after an edit', async () => {
    window.location.hash = hashOf('post', POST);
    const user = userEvent.setup();
    renderAdmin();
    const bar = await screen.findByRole('banner', { name: 'Top bar' });
    expect(
      within(bar).getByRole('button', { name: 'Save all' })
    ).toBeDisabled();
    await user.type(await screen.findByLabelText(/^Slug\b/), 'x');
    await waitFor(() => expect(saveAll()).toBeEnabled());
  });

  it('turns off again when the last dirty form is discarded', async () => {
    window.location.hash = hashOf('post', POST);
    const user = userEvent.setup();
    renderAdmin();
    await user.type(await screen.findByLabelText(/^Slug\b/), 'x');
    await waitFor(() => expect(saveAll()).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Document actions' }));
    await user.click(
      await screen.findByRole('menuitem', { name: 'Discard unsaved edits' })
    );
    await user.click(await screen.findByRole('button', { name: 'Discard' }));
    await waitFor(() => expect(saveAll()).toBeDisabled());
  });
});

describe('Save All run', () => {
  it('saves a document that is not open and reports the one that failed', async () => {
    const user = userEvent.setup();
    await editPageThenPost(user);
    await user.click(saveAll());

    await waitFor(() =>
      expect(
        within(statusBar()).getByText('Save failed: 1 of 2 documents')
      ).toBeVisible()
    );
    expect(writes.map(({ path }) => path)).toEqual([POST]);
    expect(writes[0]?.value).toMatchObject({ slug: 'hello-x' });
    expect(useFormStore.getState().forms[toFormId(PAGE)]?.status).toBe(
      'edited'
    );
    expect(
      localStorage.getItem(draftKey(toFormId(PAGE), undefined, undefined))
    ).not.toBeNull();

    const results = await openResults(user);
    const rows = within(results).getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('about.mdx');
    expect(rows[0]).toHaveTextContent('Failed: Title: ');
    expect(
      within(rows[0] as HTMLElement).getByRole('link', {
        name: 'Open about.mdx',
      })
    ).toBeVisible();
    expect(rows[1]).toHaveTextContent('hello.mdx');
    expect(rows[1]).toHaveTextContent('Saved');
    expect(within(rows[1] as HTMLElement).queryByRole('link')).toBeNull();
  });
});

const editSlugs = async (
  user: ReturnType<typeof userEvent.setup>,
  paths: string[]
) => {
  window.location.hash = hashOf('post', paths[0] as string);
  renderAdmin();
  await user.type(await screen.findByLabelText(/^Slug\b/), '-x');
  for (const path of paths.slice(1)) {
    await goTo('post', path);
    await waitFor(() =>
      expect(screen.getByLabelText(/^Slug\b/)).toHaveValue('second')
    );
    await user.type(await screen.findByLabelText(/^Slug\b/), '-x');
  }
};

const release = (path: string) => act(async () => held.get(path)?.());

describe('Save All results', () => {
  it.each([
    ['page', 'post'],
    ['post', 'page'],
  ] as const)(
    'tells saved from failed when the %s is edited first',
    async (first, _second) => {
      const user = userEvent.setup();
      const clearPage = async () => {
        await goTo('page', PAGE);
        await user.clear(await titleInput());
      };
      const editPost = async () => {
        await goTo('post', POST);
        await user.type(await screen.findByLabelText(/^Slug\b/), '-x');
      };
      window.location.hash = hashOf(first, first === 'page' ? PAGE : POST);
      renderAdmin();
      if (first === 'page') {
        await user.clear(await titleInput());
        await editPost();
      } else {
        await user.type(await screen.findByLabelText(/^Slug\b/), '-x');
        await clearPage();
      }
      await user.click(saveAll());
      await waitFor(() =>
        expect(
          within(statusBar()).getByText('Save failed: 1 of 2 documents')
        ).toBeVisible()
      );
      expect(writes.map(({ path }) => path)).toEqual([POST]);
      const rows = within(await openResults(user)).getAllByRole('listitem');
      const row = (name: string) =>
        rows.find((entry) => entry.textContent?.includes(name)) as HTMLElement;
      expect(row('hello.mdx')).toHaveTextContent('Saved');
      expect(row('about.mdx')).toHaveTextContent('Failed: Title:');
    }
  );

  it('says how many documents saved when none failed, and "Unsaved changes" once the editor types again', async () => {
    const user = userEvent.setup();
    await editSlugs(user, [POST, POST_B]);
    await user.click(saveAll());
    await waitFor(() =>
      expect(within(statusBar()).getByText('Saved 2 documents')).toBeVisible()
    );
    expect(writes.map(({ path }) => path).sort()).toEqual([POST, POST_B]);
    expect(saveAll()).toBeDisabled();
    await user.type(await screen.findByLabelText(/^Slug\b/), '!');
    await waitFor(() =>
      expect(within(statusBar()).getByText('Unsaved changes')).toBeVisible()
    );
  });

  it('counts two validation failures as 2 of 2', async () => {
    const user = userEvent.setup();
    window.location.hash = hashOf('post', POST);
    renderAdmin();
    await user.clear(await titleInput());
    await goTo('post', POST_B);
    await waitFor(() =>
      expect(screen.getByLabelText(/^Slug\b/)).toHaveValue('second')
    );
    await user.clear(await titleInput());
    await user.click(saveAll());
    await waitFor(() =>
      expect(
        within(statusBar()).getByText('Save failed: 2 of 2 documents')
      ).toBeVisible()
    );
    expect(writes).toHaveLength(0);
  });

  it('announces the status bar words when a run ends, and the list is keyboard reachable', async () => {
    const user = userEvent.setup();
    await editPageThenPost(user);
    await user.click(saveAll());
    const bar = screen.getByRole('banner', { name: 'Top bar' });
    await waitFor(() =>
      expect(within(bar).getByRole('status')).toHaveTextContent(
        'Save failed: 1 of 2 documents'
      )
    );
    const trigger = await screen.findByRole('button', {
      name: 'Save results',
    });
    // A toast that mounts late, with its own buttons, competes for focus.
    act(() => toast.dismiss());
    await waitFor(() => expect(toastShown()).toBeNull());
    act(() => trigger.focus());
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter}');
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    );
    const dialog = await screen.findByRole('dialog', { name: 'Save results' });
    await waitFor(() =>
      expect(dialog.contains(document.activeElement)).toBe(true)
    );
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Save results' })).toBeNull()
    );
    expect(trigger).toHaveFocus();
  });
});

describe('Opening a document that failed', () => {
  it('shows its field errors already revealed, with no save', async () => {
    const user = userEvent.setup();
    await editPageThenPost(user);
    await user.click(saveAll());
    await waitFor(() =>
      expect(
        within(statusBar()).getByText('Save failed: 1 of 2 documents')
      ).toBeVisible()
    );
    await goTo('page', PAGE);
    expect(await screen.findByRole('alert')).toHaveTextContent(/required/i);
  });

  it('reveals errors in place for the open document, with no toast, pane or dialog', async () => {
    const user = userEvent.setup();
    window.location.hash = hashOf('page', PAGE);
    renderAdmin();
    await user.clear(await titleInput());
    await user.click(saveAll());
    await waitFor(() =>
      expect(
        within(statusBar()).getByText('Save failed: 1 of 1 documents')
      ).toBeVisible()
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(/required/i);
    expect(toastShown()).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.querySelector('#error-pane')).not.toBeVisible();
  });

  it('names the nested field that failed', async () => {
    const user = userEvent.setup();
    window.location.hash = hashOf('page', PAGE);
    renderAdmin();
    await user.type(await titleInput(), '!');
    act(() =>
      useFormStore
        .getState()
        .setFieldValue(toFormId(PAGE), 'seo' as never, { heading: '' })
    );
    await goTo('post', POST);
    await user.type(await screen.findByLabelText(/^Slug\b/), '-x');
    await user.click(saveAll());
    await waitFor(() =>
      expect(
        within(statusBar()).getByText('Save failed: 1 of 2 documents')
      ).toBeVisible()
    );
    expect(
      within(await openResults(user)).getAllByRole('listitem')[0]
    ).toHaveTextContent(/about\.mdx\s*Failed: Heading:/);
    expect(writes.map(({ path }) => path)).toEqual([POST]);
  });
});

describe('Save All guards', () => {
  it('reads nothing before a write and writes each document once', async () => {
    const user = userEvent.setup();
    await editSlugs(user, [POST, POST_B]);
    gets.length = 0;
    await user.click(saveAll());
    await waitFor(() =>
      expect(within(statusBar()).getByText('Saved 2 documents')).toBeVisible()
    );
    expect(gets).toEqual([]);
    expect(writes.map(({ path }) => path).sort()).toEqual([POST, POST_B]);
  });

  it('fails a document the provider refuses as not found and still saves the rest', async () => {
    consoleGuard.expect(/Save failed/);
    failWrite.set(POST, new ContentError('not-found'));
    const user = userEvent.setup();
    await editSlugs(user, [POST, POST_B]);
    await user.click(saveAll());
    await waitFor(() =>
      expect(
        within(statusBar()).getByText('Save failed: 1 of 2 documents')
      ).toBeVisible()
    );
    expect(writes.map(({ path }) => path)).toEqual([POST_B]);
    expect(
      within(await openResults(user)).getAllByRole('listitem')[0]
    ).toHaveTextContent(
      'Failed: This document no longer exists. Refresh and try again.'
    );
    expect(useFormStore.getState().forms[toFormId(POST)]?.status).toBe(
      'edited'
    );
  });

  it('writes a file deleted from the local disk, as Save Document does', async () => {
    const user = userEvent.setup();
    await editSlugs(user, [POST, POST_B]);
    delete files[POST];
    await user.click(saveAll());
    await waitFor(() =>
      expect(within(statusBar()).getByText('Saved 2 documents')).toBeVisible()
    );
    expect(files[POST]).toMatchObject({ slug: 'hello-x' });
  });

  it('writes a document that changed on the branch, as Save Document does', async () => {
    const user = userEvent.setup();
    await editSlugs(user, [POST, POST_B]);
    files[POST] = { title: 'Hello', slug: 'someone-else' };
    await user.click(saveAll());
    await waitFor(() =>
      expect(within(statusBar()).getByText('Saved 2 documents')).toBeVisible()
    );
    expect(files[POST]).toMatchObject({ slug: 'hello-x' });
  });

  it.each([
    'branch-not-found',
    'unauthorized',
    'forbidden',
    'network',
  ] as const)(
    'stops the run on %s and lists the rest as not saved',
    async (code) => {
      consoleGuard.expect(/Save failed/);
      const user = userEvent.setup();
      failWrite.set(POST, new ContentError(code));
      await editSlugs(user, [POST, POST_B]);
      await user.click(saveAll());
      await waitFor(() =>
        expect(
          within(statusBar()).getByText('Save failed: 2 of 2 documents')
        ).toBeVisible()
      );
      expect(writes).toHaveLength(0);
      expect(
        screen.queryByRole('dialog', { name: 'Save to a new branch' })
      ).toBeNull();
      const results = await openResults(user);
      const rows = within(results).getAllByRole('listitem');
      expect(rows[1]).toHaveTextContent(
        /^second\.mdxNot saved: the run stopped/
      );
      expect(results.textContent).not.toContain('Not saved: Not saved');
      for (const path of [POST, POST_B]) {
        expect(useFormStore.getState().forms[toFormId(path)]?.status).toBe(
          'edited'
        );
      }
    }
  );

  it('runs a beforeSave hook once per document, and a hook that throws leaves only that document unwritten', async () => {
    const user = userEvent.setup();
    await editSlugs(user, [POST, POST_B]);
    await user.click(saveAll());
    await waitFor(() => expect(writes).toHaveLength(2));
    expect(beforeSaves.map(({ path }) => path).sort()).toEqual([POST, POST_B]);
    expect(afterSaves.map(({ path }) => path).sort()).toEqual([POST, POST_B]);
  });

  it('shows "A beforeSave hook failed" and writes nothing when the hook throws', async () => {
    consoleGuard.expect(/Save failed/);
    failBeforeSave = true;
    const user = userEvent.setup();
    await editSlugs(user, [POST, POST_B]);
    await user.click(saveAll());
    await waitFor(() =>
      expect(
        within(statusBar()).getByText('Save failed: 2 of 2 documents')
      ).toBeVisible()
    );
    expect(writes).toHaveLength(0);
    expect(
      within(await openResults(user)).getAllByText(/A beforeSave hook failed/)
    ).toHaveLength(2);
  });

  it('counts a document whose afterSave hook failed as saved with a warning, even when it saves last', async () => {
    consoleGuard.expect(/afterSave failed/);
    failAfterSave = true;
    const user = userEvent.setup();
    await editSlugs(user, [POST, POST_B]);
    await user.click(saveAll());
    await waitFor(() =>
      expect(
        within(statusBar()).getByText('Saved 2 documents with warnings')
      ).toBeVisible()
    );
    expect(writes).toHaveLength(2);
    expect(saveAll()).toBeDisabled();
    const rows = within(await openResults(user)).getAllByRole('listitem');
    for (const row of rows) {
      expect(row).toHaveTextContent(
        'Saved with warning: Saved, but an afterSave hook failed'
      );
    }
  });
});

describe('While Save All runs', () => {
  it('turns off every save control and shows progress, with one write in flight at a time', async () => {
    holdPaths.add(POST);
    const user = userEvent.setup();
    await editSlugs(user, [POST, POST_B]);
    await user.click(saveAll());
    await waitFor(() =>
      expect(within(statusBar()).getByText('Saving 1 of 2…')).toBeVisible()
    );
    expect(saveAll()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    await release(POST);
    await waitFor(() =>
      expect(within(statusBar()).getByText('Saved 2 documents')).toBeVisible()
    );
    expect(maxInFlight).toBe(1);
  });

  it('keeps edits typed while the open document saves', async () => {
    holdPaths.add(POST);
    const user = userEvent.setup();
    window.location.hash = hashOf('post', POST);
    renderAdmin();
    const slug = await screen.findByLabelText(/^Slug\b/);
    await user.type(slug, '-x');
    await user.click(saveAll());
    await waitFor(() => expect(held.has(POST)).toBe(true));
    await user.type(slug, '!');
    await release(POST);
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(slug).toHaveValue('hello-x!');
    await waitFor(() =>
      expect(within(statusBar()).getByText('Unsaved changes')).toBeVisible()
    );
  });

  it('shows the saved values when a document is opened mid-save, and survives one closed mid-save', async () => {
    holdPaths.add(POST);
    const user = userEvent.setup();
    await editSlugs(user, [POST, POST_B]);
    await user.click(saveAll());
    await waitFor(() => expect(held.has(POST)).toBe(true));
    await goTo('post', POST);
    await release(POST);
    await waitFor(() =>
      expect(within(statusBar()).getByText('Saved 2 documents')).toBeVisible()
    );
    expect(await screen.findByLabelText(/^Slug\b/)).toHaveValue('hello-x');
    expect(useFormStore.getState().forms[toFormId(POST)]?.status).toBe(
      'edited'
    );
    expect(saveAll()).toBeDisabled();
  });

  it('survives its form closing mid-save', async () => {
    holdPaths.add(POST);
    const user = userEvent.setup();
    window.location.hash = hashOf('post', POST);
    renderAdmin();
    await user.type(await screen.findByLabelText(/^Slug\b/), '-x');
    await user.click(saveAll());
    await waitFor(() => expect(held.has(POST)).toBe(true));
    await goTo('post', POST_B);
    await release(POST);
    await waitFor(() =>
      expect(within(statusBar()).getByText('Saved 1 document')).toBeVisible()
    );
    expect(writes.map(({ path }) => path)).toEqual([POST]);
  });
});

describe('Save Document stays per document', () => {
  it('saves only the open document and leaves the other dirty', async () => {
    const user = userEvent.setup();
    await editPageThenPost(user);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0]?.path).toBe(POST);
    expect(useFormStore.getState().forms[toFormId(PAGE)]?.status).toBe(
      'edited'
    );
    await waitFor(() => expect(saveAll()).toBeEnabled());
  });
});

describe('Kept drafts', () => {
  it('leaves a draft that only waits for Resume alone', async () => {
    const user = userEvent.setup();
    window.location.hash = hashOf('post', POST);
    const first = renderAdmin();
    await user.type(await screen.findByLabelText(/^Slug\b/), '-x');
    await waitFor(() =>
      expect(
        localStorage.getItem(draftKey(toFormId(POST), undefined, undefined))
      ).not.toBeNull()
    );
    const draft = localStorage.getItem(
      draftKey(toFormId(POST), undefined, undefined)
    );
    first.unmount();
    simulateReload();
    window.location.hash = hashOf('post', POST_B);
    renderAdmin();
    await user.type(await screen.findByLabelText(/^Slug\b/), '-x');
    await waitFor(() => expect(saveAll()).toBeEnabled());
    await user.click(saveAll());
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0]?.path).toBe(POST_B);
    expect(
      localStorage.getItem(draftKey(toFormId(POST), undefined, undefined))
    ).toBe(draft);
  });

  it('stays off when only a stored draft exists', async () => {
    const user = userEvent.setup();
    window.location.hash = hashOf('post', POST);
    const first = renderAdmin();
    await user.type(await screen.findByLabelText(/^Slug\b/), '-x');
    await waitFor(() =>
      expect(
        localStorage.getItem(draftKey(toFormId(POST), undefined, undefined))
      ).not.toBeNull()
    );
    first.unmount();
    simulateReload();
    window.location.hash = '';
    renderAdmin();
    await screen.findByRole('banner', { name: 'Top bar' });
    expect(saveAll()).toBeDisabled();
  });
});

describe('Save All on a protected branch', () => {
  beforeEach(() => {
    mode = 'branches';
  });

  it('is off and says why, by keyboard and pointer', async () => {
    const user = userEvent.setup();
    window.location.hash = hashOf('post', POST);
    renderAdmin();
    await user.type(await screen.findByLabelText(/^Slug\b/), '-x');
    const message = 'Save each document to a new branch from its form';
    const wrapper = await screen.findByRole('group', {
      name: 'Save all, unavailable',
    });
    expect(wrapper).toHaveAttribute('tabindex', '0');
    expect(wrapper).toHaveAccessibleDescription(message);
    expect(wrapper).toHaveAttribute('title', message);
    expect(saveAll()).toBeDisabled();
  });

  it('says it is checking while the branch list loads', async () => {
    let open: () => void = () => {};
    holdList = new Promise<void>((resolve) => {
      open = resolve;
    });
    renderAdmin();
    expect(
      await screen.findByRole('group', { name: 'Save all, unavailable' })
    ).toHaveAccessibleDescription('Checking the branch…');
    await act(async () => open());
    await screen.findByRole('banner', { name: 'Top bar' });
  });

  it('says it could not check when the list fails', async () => {
    consoleGuard.expect(/could not list branches/);
    listFails = true;
    renderAdmin();
    expect(
      await screen.findByRole('group', { name: 'Save all, unavailable' })
    ).toHaveAccessibleDescription('Could not check the branch');
  });
});

describe('Save All result lifetime', () => {
  it('drops a failed entry once the document is fixed and saved, or its edits are discarded', async () => {
    const user = userEvent.setup();
    await editPageThenPost(user);
    await user.click(saveAll());
    await waitFor(() =>
      expect(
        within(statusBar()).getByText('Save failed: 1 of 2 documents')
      ).toBeVisible()
    );
    await goTo('page', PAGE);
    await user.type(await titleInput(), 'About us');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(within(statusBar()).queryByText(/Save failed/)).toBeNull()
    );
    expect(writes.map(({ path }) => path)).toEqual([POST, PAGE]);
  });

  it('clears the results when the branch changes', async () => {
    const user = userEvent.setup();
    await editPageThenPost(user);
    await user.click(saveAll());
    await waitFor(() =>
      expect(Object.keys(useFormStore.getState().saveAll.results)).toHaveLength(
        2
      )
    );
    act(() => useFormStore.getState().setBranch('feature/news'));
    expect(useFormStore.getState().saveAll.results).toEqual({});
  });
});

describe('One save at a time', () => {
  it('stays off while a Save Document is pending and comes back when it ends', async () => {
    holdPaths.add(POST);
    const user = userEvent.setup();
    window.location.hash = hashOf('post', POST);
    renderAdmin();
    await user.type(await screen.findByLabelText(/^Slug\b/), '-x');
    await user.click(screen.getByRole('button', { name: /^Save$/ }));
    await waitFor(() => expect(held.has(POST)).toBe(true));
    expect(saveAll()).toBeDisabled();
    await release(POST);
    await waitFor(() => expect(writes).toHaveLength(1));
    await user.type(await screen.findByLabelText(/^Slug\b/), '!');
    await waitFor(() => expect(saveAll()).toBeEnabled());
  });

  it('ignores Retry on an earlier failure toast while Save All runs', async () => {
    consoleGuard.expect(/Save failed/);
    failWrite.set(POST, new Error('disk full'));
    const user = userEvent.setup();
    window.location.hash = hashOf('post', POST);
    renderAdmin();
    await user.type(await screen.findByLabelText(/^Slug\b/), '-x');
    await user.click(screen.getByRole('button', { name: /^Save$/ }));
    await waitFor(() => expect(toastShown()).not.toBeNull());
    failWrite.delete(POST);
    holdPaths.add(POST);
    await waitFor(() => expect(saveAll()).toBeEnabled());
    await user.click(saveAll());
    await waitFor(() => expect(held.has(POST)).toBe(true));
    await user.click(
      within(toastShown() as HTMLElement).getByRole('button', { name: 'Retry' })
    );
    await release(POST);
    await waitFor(() =>
      expect(within(statusBar()).getByText('Saved 1 document')).toBeVisible()
    );
    expect(writes).toHaveLength(1);
    expect(maxInFlight).toBe(1);
  });
});

describe('Waiting copies', () => {
  it('saves the live edits of a form with a waiting copy and leaves the copy for Resume', async () => {
    const user = userEvent.setup();
    window.location.hash = hashOf('post', POST);
    const first = renderAdmin();
    await user.type(await screen.findByLabelText(/^Slug\b/), '-x');
    await waitFor(() =>
      expect(
        localStorage.getItem(draftKey(toFormId(POST), undefined, undefined))
      ).not.toBeNull()
    );
    first.unmount();
    simulateReload();
    renderAdmin();
    const slug = await screen.findByLabelText(/^Slug\b/);
    await waitFor(() =>
      expect(useFormStore.getState().waiting[toFormId(POST)]).toHaveLength(1)
    );
    await user.type(slug, '-y');
    await waitFor(() => expect(saveAll()).toBeEnabled());
    await user.click(saveAll());
    await waitFor(() => expect(writes).toHaveLength(1));
    expect(writes[0]?.value).toMatchObject({ slug: 'hello-y' });
    expect(useFormStore.getState().waiting[toFormId(POST)]).toHaveLength(1);
  });
});

describe('Form-less validation matches the form', () => {
  const breakPageThenSaveAll = async (
    user: ReturnType<typeof userEvent.setup>,
    field: string,
    value: unknown
  ) => {
    window.location.hash = hashOf('page', PAGE);
    renderAdmin();
    await user.type(await titleInput(), '!');
    act(() =>
      useFormStore
        .getState()
        .setFieldValue(toFormId(PAGE), field as never, value)
    );
    await goTo('post', POST);
    await user.type(await screen.findByLabelText(/^Slug\b/), '-x');
    await user.click(saveAll());
    await waitFor(() =>
      expect(
        within(statusBar()).getByText('Save failed: 1 of 2 documents')
      ).toBeVisible()
    );
  };
  const pageErrors = () => {
    const page = useFormStore.getState().forms[toFormId(PAGE)];
    return page?.status === 'edited' ? Object.keys(page.errors) : [];
  };

  it('fails an object inside an object with its leaf label', async () => {
    const user = userEvent.setup();
    await breakPageThenSaveAll(user, 'deep', { inner: { note: '' } });
    expect(pageErrors()).toEqual(['deep.inner.note']);
    expect(
      within(await openResults(user)).getAllByRole('listitem')[0]
    ).toHaveTextContent(/Failed: Note:/);
  });

  it('reports only the invalid item of a list', async () => {
    const user = userEvent.setup();
    await breakPageThenSaveAll(user, 'links', [{ url: 'a' }, { url: '' }]);
    expect(pageErrors()).toEqual(['links.1.url']);
    expect(
      within(await openResults(user)).getAllByRole('listitem')[0]
    ).toHaveTextContent(/Failed: URL:/);
  });
});

describe('Save All and the branch switcher', () => {
  beforeEach(() => {
    mode = 'branches';
    localStorage.setItem(
      'tina-store',
      JSON.stringify({
        state: { branch: { current: 'feature/news' } },
        version: 0,
      })
    );
  });

  it('disables the switcher for the whole run and again while a later Save Document runs', async () => {
    holdPaths.add(POST);
    const user = userEvent.setup();
    window.location.hash = hashOf('post', POST);
    renderAdmin();
    await user.type(await screen.findByLabelText(/^Slug\b/), '-x');
    const branch = () => screen.getByRole('button', { name: /^Branch:/ });
    await waitFor(() => expect(saveAll()).toBeEnabled());
    expect(branch()).toBeEnabled();
    await user.click(saveAll());
    await waitFor(() => expect(held.has(POST)).toBe(true));
    expect(branch()).toBeDisabled();
    await release(POST);
    await waitFor(() =>
      expect(within(statusBar()).getByText('Saved 1 document')).toBeVisible()
    );
    expect(branch()).toBeEnabled();
    held.clear();
    await user.type(await screen.findByLabelText(/^Slug\b/), '!');
    await user.click(screen.getByRole('button', { name: /^Save$/ }));
    await waitFor(() => expect(held.has(POST)).toBe(true));
    expect(within(statusBar()).getByText('Saving…')).toBeVisible();
    expect(branch()).toBeDisabled();
    await release(POST);
    await waitFor(() => expect(branch()).toBeEnabled());
  });
});

describe('Discarding a failed document', () => {
  it('removes its failed entry so the status bar leaves "Save failed"', async () => {
    const user = userEvent.setup();
    window.location.hash = hashOf('page', PAGE);
    renderAdmin();
    await user.clear(await titleInput());
    await user.click(saveAll());
    await waitFor(() =>
      expect(
        within(statusBar()).getByText('Save failed: 1 of 1 documents')
      ).toBeVisible()
    );
    await user.click(screen.getByRole('button', { name: 'Document actions' }));
    await user.click(
      await screen.findByRole('menuitem', { name: 'Discard unsaved edits' })
    );
    await user.click(await screen.findByRole('button', { name: 'Discard' }));
    await waitFor(() =>
      expect(within(statusBar()).queryByText(/Save failed/)).toBeNull()
    );
    expect(useFormStore.getState().saveAll.results).toEqual({});
  });
});

describe('Save All without a content plugin', () => {
  it('does not render in the top bar', async () => {
    render(
      <TinaProvider
        config={asResolvedConfig({
          plugins: [stringFieldPlugin, homePlugin],
          schema: { collections: [] },
        })}
      >
        <HashRouter>
          <SidebarProvider>
            <ShellTopBar />
          </SidebarProvider>
        </HashRouter>
      </TinaProvider>
    );
    await screen.findByRole('banner', { name: 'Top bar' });
    expect(screen.queryByRole('button', { name: /^Save all/ })).toBeNull();
  });
});

describe('Save All with server hooks', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('writes each document through the server route once', async () => {
    serverAudit = true;
    const bodies: { path: string; value: TinaDocument }[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        const body = JSON.parse(String(init?.body));
        bodies.push(body);
        files[body.path] = body.value;
        expect(url).toBe('/api/tina/content/update');
        return Response.json({
          entry: { path: body.path, document: body.value },
          hookWarnings: [],
        });
      })
    );
    const user = userEvent.setup();
    await editSlugs(user, [POST, POST_B]);
    await user.click(saveAll());
    await waitFor(() =>
      expect(within(statusBar()).getByText('Saved 2 documents')).toBeVisible()
    );
    expect(bodies.map(({ path }) => path).sort()).toEqual([POST, POST_B]);
    expect(writes).toHaveLength(0);
  });
});

describe('Revealed errors show only on the first open', () => {
  const failOffScreen = async (user: ReturnType<typeof userEvent.setup>) => {
    window.location.hash = hashOf('post', POST);
    const view = renderAdmin();
    await user.clear(await titleInput());
    await goTo('page', PAGE);
    await user.type(await titleInput(), '!');
    await user.click(saveAll());
    await waitFor(() =>
      expect(
        within(statusBar()).getByText('Save failed: 1 of 2 documents')
      ).toBeVisible()
    );
    return view;
  };
  const alerts = () =>
    screen
      .queryAllByRole('alert')
      .filter((alert) => /required/i.test(alert.textContent ?? ''));

  it.each([
    ['another collection', 'page', PAGE],
    ['the same collection', 'post', POST_B],
  ] as const)(
    'does not reveal again after a round trip through %s',
    async (_name, collection, path) => {
      const user = userEvent.setup();
      await failOffScreen(user);
      await goTo('post', POST);
      expect(await screen.findByRole('alert')).toHaveTextContent(/required/i);
      await goTo(collection, path);
      await waitFor(() => expect(alerts()).toHaveLength(0));
      await goTo('post', POST);
      await titleInput();
      expect(alerts()).toHaveLength(0);
      expect(useFormStore.getState().revealOnOpen).toEqual({});
    }
  );

  it('does not reveal after a reload', async () => {
    const user = userEvent.setup();
    const first = await failOffScreen(user);
    await goTo('post', POST);
    expect(await screen.findByRole('alert')).toHaveTextContent(/required/i);
    first.unmount();
    simulateReload();
    window.location.hash = hashOf('post', POST);
    renderAdmin();
    await titleInput();
    expect(alerts()).toHaveLength(0);
  });
});

describe('Status bar after a run', () => {
  it('shows a later single save, not the finished run', async () => {
    const user = userEvent.setup();
    await editSlugs(user, [POST, POST_B]);
    await user.click(saveAll());
    await waitFor(() =>
      expect(within(statusBar()).getByText('Saved 2 documents')).toBeVisible()
    );
    await user.type(await screen.findByLabelText(/^Slug\b/), '!');
    await user.click(screen.getByRole('button', { name: /^Save$/ }));
    await waitFor(() =>
      expect(within(statusBar()).getByText('Saved: “second.mdx”')).toBeVisible()
    );
  });

  it('shows the words of a later failed save, while Save All keeps the earlier failure', async () => {
    consoleGuard.expect(/Save failed/);
    const user = userEvent.setup();
    await editPageThenPost(user);
    await user.click(saveAll());
    await waitFor(() =>
      expect(
        within(statusBar()).getByText('Save failed: 1 of 2 documents')
      ).toBeVisible()
    );
    failWrite.set(POST_B, new Error('disk full'));
    await goTo('post', POST_B);
    await user.type(await screen.findByLabelText(/^Slug\b/), '-x');
    await user.click(screen.getByRole('button', { name: /^Save$/ }));
    await waitFor(() =>
      expect(within(statusBar()).getByText('Save failed')).toBeVisible()
    );
    expect(within(statusBar()).queryByText(/of 2 documents/)).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Save all, 1 failed' })
    ).toBeEnabled();
    expect(
      within(await openResults(user)).getAllByRole('listitem')[0]
    ).toHaveTextContent('about.mdxFailed');
  });

  it('shows a later failed save of a document the run saved with an afterSave warning', async () => {
    consoleGuard.expect(/afterSave failed/);
    consoleGuard.expect(/Save failed/);
    failAfterSave = true;
    const user = userEvent.setup();
    await editSlugs(user, [POST, POST_B]);
    await user.click(saveAll());
    await waitFor(() =>
      expect(
        within(statusBar()).getByText('Saved 2 documents with warnings')
      ).toBeVisible()
    );
    failWrite.set(POST_B, new Error('disk full'));
    await user.type(await screen.findByLabelText(/^Slug\b/), '-x');
    await user.click(screen.getByRole('button', { name: /^Save$/ }));
    await waitFor(() =>
      expect(within(statusBar()).getByText('Save failed')).toBeVisible()
    );
    expect(within(statusBar()).queryByText(/unsaved/i)).toBeNull();
  });

  it('counts failures out of the documents the run tried, as they clear', async () => {
    const user = userEvent.setup();
    window.location.hash = hashOf('post', POST);
    renderAdmin();
    await user.clear(await titleInput());
    await goTo('post', POST_B);
    await waitFor(() =>
      expect(screen.getByLabelText(/^Slug\b/)).toHaveValue('second')
    );
    await user.clear(await titleInput());
    await user.click(saveAll());
    await waitFor(() =>
      expect(
        within(statusBar()).getByText('Save failed: 2 of 2 documents')
      ).toBeVisible()
    );
    await user.click(screen.getByRole('button', { name: 'Document actions' }));
    await user.click(
      await screen.findByRole('menuitem', { name: 'Discard unsaved edits' })
    );
    await user.click(await screen.findByRole('button', { name: 'Discard' }));
    await waitFor(() =>
      expect(
        within(statusBar()).getByText('Save failed: 1 of 2 documents')
      ).toBeVisible()
    );
  });
});

describe('Save All and the failure toast', () => {
  it('removes the failed-save toast of a document that Save All then saves', async () => {
    consoleGuard.expect(/Save failed/);
    failWrite.set(POST, new Error('disk full'));
    const user = userEvent.setup();
    window.location.hash = hashOf('post', POST);
    renderAdmin();
    await user.type(await screen.findByLabelText(/^Slug\b/), '-x');
    await user.click(screen.getByRole('button', { name: /^Save$/ }));
    await waitFor(() => expect(toastShown()).not.toBeNull());
    failWrite.delete(POST);
    await waitFor(() => expect(saveAll()).toBeEnabled());
    await user.click(saveAll());
    await waitFor(() => expect(writes).toHaveLength(1));
    await waitFor(() => expect(toastShown()).toBeNull());
  });
});

describe('Open in the Save results list', () => {
  it('closes the list', async () => {
    const user = userEvent.setup();
    await editPageThenPost(user);
    await user.click(saveAll());
    await waitFor(() =>
      expect(
        within(statusBar()).getByText('Save failed: 1 of 2 documents')
      ).toBeVisible()
    );
    const results = await openResults(user);
    await user.click(within(results).getByRole('link', { name: /^Open/ }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Save results' })).toBeNull()
    );
  });
});
