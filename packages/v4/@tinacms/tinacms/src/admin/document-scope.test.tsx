import { QueryClient } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { use } from 'react';
import { describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../config';
import type { ContentProvider, DocumentEntry } from '../core/content/contract';
import { definePlugin } from '../core/plugin';
import type { CollectionSchema } from '../core/schema/types';
import { contentKeys, useCollectionDocuments } from '../editor/content-queries';
import { FormScopeContext } from '../editor/context';
import { Field, TinaProvider } from '../editor/index';
import { toFormId, useFormStatus } from '../form/form-store';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import { DocumentScope } from './document-scope';

const path = 'content/posts/hello.mdx';

const collection: CollectionSchema = {
  name: 'post',
  label: 'Posts',
  path: 'content/posts',
  format: 'mdx',
  fields: [{ name: 'title', label: 'Title', type: 'string' }],
};

const ON_LOAD: DocumentEntry[] = [{ path, document: { title: 'Hello' } }];
const ON_DISK: DocumentEntry[] = [
  { path, document: { title: 'Changed on disk' } },
];

const provider: ContentProvider = {
  list: async () => ON_LOAD,
  get: async () => ON_LOAD[0],
  update: async (_collection, target, value) => ({
    path: target,
    document: { ...value },
  }),
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

const config = asResolvedConfig({
  plugins: [contentPlugin, stringFieldPlugin],
  schema: { collections: [collection] },
});

function CachedTitle() {
  const { documents } = useCollectionDocuments(collection.name);
  return (
    <span data-testid='cached'>
      {String(documents[0]?.document.title ?? '')}
    </span>
  );
}

function StatusProbe() {
  return <span data-testid='status'>{useFormStatus(toFormId(path))}</span>;
}

function FieldSlot() {
  return use(FormScopeContext) ? <Field address='title' /> : null;
}

const host = (queryClient: QueryClient) => (
  <TinaProvider config={config} queryClient={queryClient}>
    <DocumentScope collection={collection} path={path}>
      <FieldSlot />
    </DocumentScope>
    <StatusProbe />
    <CachedTitle />
  </TinaProvider>
);

const makeQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const writeDiskChange = (queryClient: QueryClient) =>
  act(() => {
    queryClient.setQueryData<DocumentEntry[]>(
      contentKeys.list(collection.name),
      ON_DISK
    );
  });

describe('DocumentScope on a document that changed after it opened', () => {
  it('takes the newer content into a form with no edits', async () => {
    const queryClient = makeQueryClient();
    render(host(queryClient));
    expect(await screen.findByLabelText('title')).toHaveValue('Hello');

    writeDiskChange(queryClient);
    await waitFor(() =>
      expect(screen.getByTestId('cached')).toHaveTextContent('Changed on disk')
    );

    expect(screen.getByLabelText('title')).toHaveValue('Changed on disk');
    expect(screen.getByTestId('status')).toHaveTextContent('pristine');
  });

  it('keeps the unsaved edits of a dirty form', async () => {
    const queryClient = makeQueryClient();
    render(host(queryClient));
    await userEvent.type(await screen.findByLabelText('title'), '!');
    expect(screen.getByTestId('status')).toHaveTextContent('dirty');

    writeDiskChange(queryClient);
    await waitFor(() =>
      expect(screen.getByTestId('cached')).toHaveTextContent('Changed on disk')
    );

    expect(screen.getByLabelText('title')).toHaveValue('Hello!');
    expect(screen.getByTestId('status')).toHaveTextContent('dirty');
  });
});
