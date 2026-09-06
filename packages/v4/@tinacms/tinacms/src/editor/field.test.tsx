import { render, screen } from '@testing-library/react';
import { Component, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import type { CollectionSchema } from '../core/schema/types';
import { t } from '../index';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import { Field } from './field';
import { FormProvider, TinaProvider } from './index';

const NO_COLLECTIONS = { collections: [] };

const collection: CollectionSchema = {
  name: 'post',
  label: 'Posts',
  format: 'mdx',
  fields: [t.string({ name: 'title', label: 'Title' })],
};

const collectionWithUnknownField: CollectionSchema = {
  ...collection,
  fields: [{ name: 'mystery', label: 'Mystery', type: 'mystery' }],
};

class CaptureError extends Component<
  { children: ReactNode },
  { message: string | null }
> {
  state: { message: string | null } = { message: null };

  static getDerivedStateFromError(cause: unknown): { message: string } {
    if (cause instanceof Error) return { message: cause.message };
    return { message: String(cause) };
  }

  render() {
    if (this.state.message !== null) {
      return <p role='alert'>{this.state.message}</p>;
    }
    return this.props.children;
  }
}

const renderField = (address: string, schema: CollectionSchema = collection) =>
  render(
    <CaptureError>
      <TinaProvider
        config={asResolvedConfig({
          plugins: [stringFieldPlugin],
          schema: NO_COLLECTIONS,
        })}
      >
        <FormProvider collection={schema} path='content/posts/a.mdx'>
          <Field address={address} />
        </FormProvider>
      </TinaProvider>
    </CaptureError>
  );

// React reports an error that a render throws. The report is noise the test
// does not read.
afterEach(() => vi.restoreAllMocks());

describe('Field outside its providers', () => {
  it('names the providers it needs', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Field address='title' />)).toThrow(
      '<Field> must be used within a FormProvider'
    );
  });

  // The runtime is present here, but <Field> only needs FormScopeContext to
  // resolve a node by name — it delegates the rest to <FieldNode>.
  it('names the providers it needs when only the form is missing', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <CaptureError>
        <TinaProvider
          config={asResolvedConfig({
            plugins: [stringFieldPlugin],
            schema: NO_COLLECTIONS,
          })}
        >
          <Field address='title' />
        </TinaProvider>
      </CaptureError>
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '<Field> must be used within a FormProvider'
    );
  });
});

describe('Field with an address the collection does not hold', () => {
  it('names the missing field and its collection', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    renderField('ghost');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No field "ghost" in collection "post"'
    );
  });
});

describe('Field with a type that no plugin provides', () => {
  it('names the type that has no plugin', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    renderField('mystery', collectionWithUnknownField);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No field plugin registered for type "mystery"'
    );
  });
});

describe('Field with a registered plugin', () => {
  it('renders the widget of the plugin under the label of the row', async () => {
    render(
      <TinaProvider
        config={asResolvedConfig({
          plugins: [stringFieldPlugin],
          schema: NO_COLLECTIONS,
        })}
      >
        <FormProvider collection={collection} path='content/posts/a.mdx'>
          <label htmlFor='title'>Title</label>
          <Field address='title' />
        </FormProvider>
      </TinaProvider>
    );
    expect(await screen.findByRole('textbox', { name: 'Title' })).toBeVisible();
  });
});
