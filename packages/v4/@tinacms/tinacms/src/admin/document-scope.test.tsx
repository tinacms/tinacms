import { QueryClient } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { use } from 'react';
import { describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../config';
import type { ContentProvider, DocumentEntry } from '../core/content/contract';
import { definePlugin } from '../core/plugin';
import type { CollectionSchema } from '../core/schema/types';
import { contentKeys, useDocument } from '../editor/content-queries';
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

const ON_LOAD: DocumentEntry = { path, document: { title: 'Hello' } };
const ON_DISK: DocumentEntry = { path, document: { title: 'Changed on disk' } };

const providerReading = (read: ContentProvider['get']): ContentProvider => ({
  list: async () => [{ path }],
  get: read,
  update: async (_collection, target, value) => ({
    path: target,
    document: { ...value },
  }),
});

const configReading = (read: ContentProvider['get']) => {
  const provider = providerReading(read);
  return asResolvedConfig({
    plugins: [
      definePlugin({
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
      }),
      stringFieldPlugin,
    ],
    schema: { collections: [collection] },
  });
};

const config = configReading(async () => ON_LOAD);

function CachedTitle() {
  const { entry } = useDocument(collection.name, path);
  return (
    <span data-testid='cached'>{String(entry?.document.title ?? '')}</span>
  );
}

function StatusProbe() {
  return <span data-testid='status'>{useFormStatus(toFormId(path))}</span>;
}

function FieldSlot() {
  return use(FormScopeContext) ? <Field address='title' /> : null;
}

const host = (
  queryClient: QueryClient,
  hostConfig: ReturnType<typeof configReading> = config
) => (
  <TinaProvider config={hostConfig} queryClient={queryClient}>
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
    queryClient.setQueryData<DocumentEntry>(
      contentKeys.document(collection.name, path),
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

describe('DocumentScope on a document the data layer cannot give', () => {
  it('opens no form for a path that does not exist', async () => {
    const queryClient = makeQueryClient();
    render(
      host(
        queryClient,
        configReading(async () => null)
      )
    );

    await waitFor(() =>
      expect(screen.getByTestId('cached')).toBeEmptyDOMElement()
    );
    expect(screen.queryByLabelText('title')).not.toBeInTheDocument();
  });

  it('opens no form when the read fails', async () => {
    const queryClient = makeQueryClient();
    render(
      host(
        queryClient,
        configReading(async () => {
          throw new Error('cannot parse the file');
        })
      )
    );

    await waitFor(() =>
      expect(screen.getByTestId('cached')).toBeEmptyDOMElement()
    );
    expect(screen.queryByLabelText('title')).not.toBeInTheDocument();
  });
});
