import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../../../config';
import type { CollectionSchema } from '../../../core/schema/types';
import { Field, FormProvider, TinaProvider } from '../../../editor';
import { t } from '../../../index';
import richTextFieldPlugin from './rich-text-field.plugin';

// These tests render a runtime directly, and not a configured app. They therefore pass
// TinaProvider the resolved shape, and do not call defineConfig.
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
        <Field address='body' />
      </FormProvider>
    </TinaProvider>
  );

describe('RichTextField rendering', () => {
  it('mounts the editor and shows the stored prose', async () => {
    renderBody('# Heading\n\nSome prose.\n');
    const editable = await screen.findByLabelText('body');
    expect(editable).toHaveAttribute('role', 'textbox');
    expect(editable).toHaveTextContent('Heading');
    expect(editable).toHaveTextContent('Some prose.');
  });

  // The embed nodes read their templates from EditorContext, and the field component
  // must provide it. Without it, `useTemplates()` returns the context default of `[]`,
  // and every embed renders nothing. There is no message, because the toolbar reads
  // another context and still looks correct.
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
          <Field address='body' />
        </FormProvider>
      </TinaProvider>
    );
    const editable = await screen.findByLabelText('body');
    expect(editable).toHaveTextContent('Callout');
  });
});
