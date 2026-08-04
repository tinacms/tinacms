import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
// Warm the Plate editor chain at module scope. Boot dynamically imports the
// rich-text client, and paying its transform cost inside a test's async
// timeout flakes on contended CI runners.
import './rich-text-field.client';
import { DocumentForm } from '../../../admin/document-form';
import { asResolvedConfig } from '../../../config';
import type { CollectionSchema } from '../../../core/schema/types';
import { FormProvider, TinaProvider } from '../../../editor';
import { t } from '../../../index';
import richTextFieldPlugin from './rich-text-field.plugin';

const NO_COLLECTIONS = { collections: [] };

const collection: CollectionSchema = {
  name: 'post',
  label: 'Posts',
  format: 'mdx',
  fields: [t.richText({ name: 'body', label: 'Body', isBody: true })],
};

const withCallout: CollectionSchema = {
  name: 'post',
  label: 'Posts',
  format: 'mdx',
  fields: [
    t.richText({
      name: 'body',
      label: 'Body',
      isBody: true,
      templates: [
        {
          name: 'Callout',
          label: 'Callout',
          key: 'callout',
          fields: [{ name: 'text', type: 'string' }],
        },
      ],
    }),
  ],
};

const renderBody = (markdown: string) =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [richTextFieldPlugin],
        schema: NO_COLLECTIONS,
      })}
    >
      <FormProvider
        collection={collection}
        path='content/posts/test.mdx'
        document={{ body: markdown }}
      >
        <DocumentForm />
      </FormProvider>
    </TinaProvider>
  );

describe('RichTextField rendering', () => {
  it('mounts the editor and shows the stored prose', async () => {
    renderBody('# Heading\n\nSome prose.\n');
    const editable = await screen.findByLabelText('Body');
    expect(editable).toHaveAttribute('role', 'textbox');
    expect(editable).toHaveTextContent('Heading');
    expect(editable).toHaveTextContent('Some prose.');
  });

  it('renders a configured embed, proving EditorContext is provided', async () => {
    render(
      <TinaProvider
        config={asResolvedConfig({
          plugins: [richTextFieldPlugin],
          schema: NO_COLLECTIONS,
        })}
      >
        <FormProvider
          collection={withCallout}
          path='content/posts/embed.mdx'
          document={{ body: 'Before.\n\n<Callout text="hi" />\n\nAfter.\n' }}
        >
          <DocumentForm />
        </FormProvider>
      </TinaProvider>
    );
    const editable = await screen.findByLabelText('Body');
    expect(editable).toHaveTextContent('Callout');
  });
});
