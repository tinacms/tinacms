import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { defineClientPlugin } from '../client';
import { asResolvedConfig } from '../config';
import type { ValidatorFactory } from '../core/field/contract';
import { definePlugin } from '../core/plugin';
import type { CollectionSchema } from '../core/schema/types';
import { t } from '../index';
import { min } from '../plugins/fields';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import coreValidatorsPlugin from '../plugins/validators/core-validators.plugin';
import { LabelledFields } from '../test/labelled-fields';
import { FormProvider, TinaProvider } from './index';

const matches: ValidatorFactory =
  (pattern, message = 'Invalid format') =>
  (value) =>
    typeof value === 'string' && !new RegExp(String(pattern)).test(value)
      ? String(message)
      : null;

const sameAs: ValidatorFactory =
  (other) =>
  (value, { siblings }) =>
    value === siblings[String(other)] ? null : `Must equal ${other}`;

const validatorsPlugin = definePlugin({
  name: 'test:validators',
  provides: ['validator'],
  validators: ['matches', 'sameAs'],
  client: async () => ({
    default: defineClientPlugin({ validators: { matches, sameAs } }),
  }),
});

const collection: CollectionSchema = {
  name: 'post',
  format: 'mdx',
  fields: [
    t.string({
      name: 'title',
      label: 'Title',
      validators: [
        min(3),
        { name: 'matches', args: ['^[A-Z]', 'Must start with a capital'] },
      ],
    }),
    t.string({
      name: 'slug',
      label: 'Slug',
      validators: [{ name: 'sameAs', args: ['title'] }],
    }),
  ],
};

const renderForm = (document: Record<string, string>) =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [stringFieldPlugin, validatorsPlugin, coreValidatorsPlugin],
        schema: { collections: [] },
      })}
    >
      <FormProvider
        collection={collection}
        path='content/posts/validators.mdx'
        document={document}
      >
        <LabelledFields />
      </FormProvider>
    </TinaProvider>
  );

describe('field-level validators in the editor', () => {
  it('shows a registered validator message beside the Zod one', async () => {
    renderForm({ title: 'Hello', slug: 'hi' });
    const title = await screen.findByRole('textbox', { name: 'Title' });
    await userEvent.clear(title);
    await userEvent.type(title, 'hi');
    const alerts = await screen.findAllByRole('alert');
    expect(alerts.map((alert) => alert.textContent)).toEqual([
      'Title must be at least 3 characters',
      'Must start with a capital',
    ]);
  });

  it('clears a sibling rule when the sibling changes, not only the field', async () => {
    renderForm({ title: 'Hello', slug: 'Hello' });
    const slug = await screen.findByRole('textbox', { name: 'Slug' });
    await userEvent.type(slug, '!');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Must equal title'
    );
    const title = await screen.findByRole('textbox', { name: 'Title' });
    await userEvent.type(title, '!');
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });

  it('gives a validator the sibling values of its field', async () => {
    renderForm({ title: 'Hello', slug: 'Hello' });
    const slug = await screen.findByRole('textbox', { name: 'Slug' });
    await userEvent.type(slug, '!');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Must equal title'
    );
  });
});
