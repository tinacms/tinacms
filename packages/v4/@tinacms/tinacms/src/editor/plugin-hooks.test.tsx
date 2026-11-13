import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DocumentForm } from '../admin/document-form';
import { LevelHead } from '../test/level-head';
import { defineClientPlugin } from '../client';
import { asResolvedConfig } from '../config';
import { definePlugin } from '../core/plugin';
import type { CollectionSchema } from '../core/schema/types';
import { t } from '../index';
import { required } from '../plugins/fields';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import coreValidatorsPlugin from '../plugins/validators/core-validators.plugin';
import {
  FormProvider,
  NestedFieldRow,
  TinaProvider,
  useFieldAddress,
  useFieldFrame,
  useFieldSchema,
  useInvalidFieldCount,
  useIsOpenLevel,
  useOpenLevel,
} from './index';

function CardField() {
  const open = useOpenLevel();
  return (
    <button type='button' onClick={open}>
      card
    </button>
  );
}

function InPlaceField() {
  const address = useFieldAddress();
  const node = useFieldSchema();
  const count = useInvalidFieldCount();
  const frame = useFieldFrame({ ownErrorsOnly: true });
  return (
    <div>
      <p>{useIsOpenLevel() ? 'open' : 'closed'}</p>
      <output aria-label='open count'>{count}</output>
      <output aria-label='open own errors'>{frame.errors?.length ?? 0}</output>
      {'fields' in node && Array.isArray(node.fields)
        ? node.fields.map((field) => (
            <NestedFieldRow
              key={field.name}
              address={`${address}.${field.name}`}
              node={field}
            />
          ))
        : null}
    </div>
  );
}

const cardPlugin = definePlugin({
  name: 'test:field:card',
  provides: ['field'],
  field: { type: 'object', contractVersion: 1 },
  client: async () => {
    const { default: object } = await import(
      '../plugins/fields/object/object-field.client'
    );
    return {
      default: defineClientPlugin({
        field: {
          ...object.field,
          Component: InPlaceField,
          DrillInComponent: CardField,
          metadata: { drillable: true, drillsIn: () => true },
        },
      }),
    };
  },
});

const collection: CollectionSchema = {
  name: 'page',
  label: 'Pages',
  format: 'mdx',
  fields: [
    t.object({
      name: 'box',
      fields: [
        t.string({ name: 'a', label: 'A', validators: [required()] }),
        t.string({ name: 'b', label: 'B', validators: [required()] }),
      ],
    }),
  ],
};

const renderForm = () =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [cardPlugin, stringFieldPlugin, coreValidatorsPlugin],
        schema: { collections: [] },
      })}
    >
      <FormProvider
        collection={collection}
        path='content/pages/x.mdx'
        document={{ box: { a: '', b: '' } }}
      >
        <LevelHead />
        <DocumentForm />
      </FormProvider>
    </TinaProvider>
  );

describe('field plugin hooks', () => {
  it('lets a plugin card open its level, count only revealed errors, and show only its own errors', async () => {
    renderForm();
    await userEvent.click(await screen.findByRole('button', { name: 'card' }));
    expect(await screen.findByText('open')).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 2, name: 'box' })
    ).toBeVisible();
    expect(screen.getByLabelText('open count')).toHaveTextContent('0');

    const a = screen.getByLabelText(/^A\b/);
    await userEvent.type(a, 'x');
    await userEvent.clear(a);
    await userEvent.tab();
    expect(await screen.findByRole('alert')).toHaveTextContent('A is required');
    expect(screen.getByLabelText('open count')).toHaveTextContent('1');
    expect(screen.getByLabelText('open own errors')).toHaveTextContent('0');
  });
});
