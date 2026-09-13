import { render, screen } from '@testing-library/react';
// Warm the Plate editor chain at module scope. Boot dynamically imports the
// rich-text client, and paying its transform cost inside a test's async
// timeout flakes on contended CI runners.
import '../plugins/fields/rich-text/rich-text-field.client';
import { describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../config';
import type { CollectionSchema } from '../core/schema/types';
import { FormProvider, TinaProvider } from '../editor';
import { corePlugins, t } from '../plugins/fields';
import { DocumentForm } from './document-form';

const NO_COLLECTIONS = { collections: [] };

const collection: CollectionSchema = {
  name: 'post',
  label: 'Posts',
  format: 'mdx',
  fields: [
    t.string({ name: 'seoDesc', label: 'SEO description' }),
    t.number({ name: 'readMins', label: 'Reading time' }),
    t.boolean({ name: 'isDraft', label: 'Draft' }),
    t.datetime({ name: 'pubAt', label: 'Publish date' }),
    t.richText({ name: 'body', label: 'Body', isBody: true }),
    t.string({ name: 'slug' }),
  ],
};

const renderForm = () =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: corePlugins,
        schema: NO_COLLECTIONS,
      })}
    >
      <FormProvider collection={collection} path='content/posts/test.mdx'>
        <DocumentForm />
      </FormProvider>
    </TinaProvider>
  );

describe('the accessible name of a field', () => {
  it('is the label of a string field', async () => {
    renderForm();
    expect(
      await screen.findByRole('textbox', { name: 'SEO description' })
    ).toBeInTheDocument();
  });

  it('is the label of a number field', async () => {
    renderForm();
    expect(
      await screen.findByRole('spinbutton', { name: 'Reading time' })
    ).toBeInTheDocument();
  });

  it('is the label of a boolean field', async () => {
    renderForm();
    expect(
      await screen.findByRole('checkbox', { name: 'Draft' })
    ).toBeInTheDocument();
  });

  // `input[type="datetime-local"]` maps to no ARIA role, so `getByRole` cannot
  // find it. `toHaveAccessibleName` runs the same accname algorithm.
  it('is the label of a datetime field', async () => {
    const { container } = renderForm();
    await screen.findByRole('button', { name: 'Save' });
    const input = container.querySelector('input[type="datetime-local"]');
    expect(input).not.toBeNull();
    expect(input).toHaveAccessibleName('Publish date');
  });

  it('is the label of a rich-text field', async () => {
    renderForm();
    expect(
      await screen.findByRole('textbox', { name: 'Body' })
    ).toBeInTheDocument();
  });

  it('is the name of a field that declares no label', async () => {
    renderForm();
    expect(
      await screen.findByRole('textbox', { name: 'slug' })
    ).toBeInTheDocument();
  });
});
