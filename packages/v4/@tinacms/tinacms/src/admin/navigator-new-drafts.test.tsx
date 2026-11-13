import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../config';
import type { ContentProvider } from '../core/content/contract';
import { definePlugin } from '../core/plugin';
import { writeDraft } from '../form/drafts';
import { toFormId, useFormStore } from '../form/form-store';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import { connectionOf } from '../test/connection';
import { TinaAdmin } from './admin';

const EXISTING = 'content/posts/hello.mdx';
const NEW_COPY = 'content/posts/hello-copy.mdx';
const GONE = 'content/posts/gone.mdx';

const provider: ContentProvider = {
  list: async () => connectionOf([{ path: EXISTING }]),
  get: async (_collection, path) =>
    path === EXISTING ? { path, document: { title: 'Hello' } } : null,
  update: async (_collection, path, document) => ({ path, document }),
};

const contentPlugin = definePlugin({
  name: 'test:content',
  provides: ['content'],
  client: async () => ({ default: { slice: () => ({ ...provider }) } }),
});

const renderAdmin = (outer = false) =>
  render(
    <TinaAdmin
      config={asResolvedConfig({
        plugins: [contentPlugin, stringFieldPlugin],
        schema: {
          collections: [
            {
              name: 'post',
              label: 'Posts',
              path: 'content/posts',
              format: 'mdx',
              fields: [{ name: 'title', label: 'Title', type: 'string' }],
            },
            ...(outer
              ? [
                  {
                    name: 'site',
                    label: 'Site',
                    path: 'content',
                    format: 'md' as const,
                    fields: [
                      {
                        name: 'title',
                        label: 'Title',
                        type: 'string' as const,
                      },
                    ],
                  },
                ]
              : []),
          ],
        },
      })}
      queryClient={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    />
  );

afterEach(() => {
  window.location.hash = '';
  useFormStore.setState({ forms: {} });
});

describe('the unsaved-only navigator and documents with no file yet', () => {
  it('lists a new-document draft under its collection and keeps it out of the missing-file list', async () => {
    useFormStore
      .getState()
      .storeNewDocumentDraft(toFormId(NEW_COPY), { title: 'Copy' });
    writeDraft(toFormId(GONE), {
      values: { title: 'Edited' },
      baseline: { title: 'Was' },
    });
    window.location.hash = '#/collections?unsaved';
    renderAdmin();

    const unsaved = await screen.findByRole('list', {
      name: 'Posts unsaved documents',
    });
    expect(
      within(unsaved).getByRole('button', { name: /hello-copy\.mdx/ })
    ).toBeVisible();

    const missing = await screen.findByRole('list', {
      name: 'Edits for documents that are gone',
    });
    expect(within(missing).getByText('gone.mdx')).toBeVisible();
    expect(within(missing).queryByText('hello-copy.mdx')).toBeNull();
  });

  it('still reads a draft stored without the new marker as an edit to a missing file', async () => {
    writeDraft(toFormId(NEW_COPY), {
      values: { title: 'Copy' },
      baseline: {},
    });
    window.location.hash = '#/collections?unsaved';
    renderAdmin();

    const missing = await screen.findByRole('list', {
      name: 'Edits for documents that are gone',
    });
    expect(within(missing).getByText('hello-copy.mdx')).toBeVisible();
    await waitFor(() =>
      expect(
        screen.queryByRole('list', { name: 'Posts unsaved documents' })
      ).toBeNull()
    );
  });

  it('lists a new document only under the collection whose folder is the longest match', async () => {
    useFormStore
      .getState()
      .storeNewDocumentDraft(toFormId(NEW_COPY), { title: 'Copy' });
    window.location.hash = '#/collections?unsaved';
    renderAdmin(true);
    await screen.findByRole('list', { name: 'Posts unsaved documents' });
    expect(
      screen.queryByRole('list', { name: 'Site unsaved documents' })
    ).toBeNull();
  });
});
