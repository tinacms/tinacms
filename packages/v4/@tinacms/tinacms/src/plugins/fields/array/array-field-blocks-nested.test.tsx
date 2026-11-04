import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DocumentForm } from '../../../admin/document-form';
import { asResolvedConfig } from '../../../config';
import type {
  CollectionSchema,
  TinaDocument,
} from '../../../core/schema/types';
import { FormProvider, TinaProvider } from '../../../editor';
import { t } from '../../../index';
import { required } from '../../../plugins/fields';
import coreValidatorsPlugin from '../../../plugins/validators/core-validators.plugin';
import { openBlockPicker } from '../../../test/open-block-picker';
import objectFieldPlugin from '../object/object-field.plugin';
import stringFieldPlugin from '../string/string-field.plugin';
import arrayFieldPlugin from './array-field.plugin';

const templates = [
  {
    name: 'quote',
    label: 'Quote',
    fields: [t.string({ name: 'text', label: 'Text' })],
  },
  {
    name: 'cta',
    label: 'Call to action',
    fields: [
      t.string({ name: 'link', label: 'Link', validators: [required()] }),
    ],
  },
];

const collection: CollectionSchema = {
  name: 'page',
  label: 'Pages',
  format: 'mdx',
  fields: [
    t.string({ name: 'title', label: 'Title' }),
    t.array({ name: 'blocks', label: 'Blocks', templates }),
    t.object({
      name: 'outer',
      label: 'Outer',
      fields: [t.array({ name: 'deep', label: 'Deep', templates })],
    }),
    t.object({
      name: 'one',
      label: 'One',
      fields: [
        t.object({
          name: 'two',
          label: 'Two',
          fields: [t.array({ name: 'blocks3', label: 'Blocks3', templates })],
        }),
      ],
    }),
    t.array({
      name: 'rows',
      label: 'Rows',
      fields: [
        t.string({ name: 'label', label: 'Label' }),
        t.array({ name: 'inner', label: 'Inner', templates }),
      ],
    }),
  ],
};

const renderForm = (document: TinaDocument) =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [
          arrayFieldPlugin,
          objectFieldPlugin,
          stringFieldPlugin,
          coreValidatorsPlugin,
        ],
        schema: { collections: [] },
      })}
    >
      <FormProvider
        collection={collection}
        path='content/pages/home.mdx'
        document={document}
      >
        <DocumentForm />
      </FormProvider>
    </TinaProvider>
  );

const pick = async (list: HTMLElement, name: string) => {
  const panel = await openBlockPicker(list);
  await userEvent.click(within(panel).getByRole('button', { name }));
};

describe('Blocks field: where a picked block opens', () => {
  it('opens a top-level block as its own form level, with focus on its first field', async () => {
    renderForm({});
    const blocks = await screen.findByRole('group', { name: 'Blocks' });
    await pick(blocks, 'Add Quote');
    const text = await screen.findByRole('textbox', { name: /^Text\b/ });
    await waitFor(() => expect(text).toHaveFocus());
    expect(screen.queryByRole('group', { name: 'Blocks' })).toBeNull();
  });

  it('opens a block at depth 3 as the next form level, with focus on its first field', async () => {
    renderForm({});
    const deep = await screen.findByRole('group', { name: 'Deep' });
    await pick(deep, 'Add Quote');
    const text = await screen.findByRole('textbox', { name: /^Text\b/ });
    await waitFor(() => expect(text).toHaveFocus());
    expect(screen.queryByRole('group', { name: 'Deep' })).toBeNull();
  });
});

describe('Blocks field: nested', () => {
  it('adds a block from a Blocks field two objects deep, behind its drill-in card', async () => {
    renderForm({});
    await userEvent.click(
      await screen.findByRole('button', { name: /^Open Blocks3/ })
    );
    const list = await screen.findByRole('group', { name: 'Blocks3' });
    await pick(list, 'Add Quote');
    expect(
      await screen.findByRole('textbox', { name: /^Text\b/ })
    ).toHaveFocus();
  });

  it('adds, reorders and removes blocks inside a list item', async () => {
    renderForm({
      rows: [
        { label: 'A', inner: [] },
        { label: 'B', inner: [] },
      ],
    });
    const rows = await screen.findByRole('group', { name: 'Rows' });
    await userEvent.click(
      within(rows).getAllByRole('button', { name: /^Item \d/ })[0]
    );
    let inner = await within(rows).findByRole('group', { name: 'Inner' });
    await pick(inner, 'Add Quote');
    await userEvent.click(
      await screen.findByRole('button', { name: 'Up to Inner' })
    );
    inner = await screen.findByRole('group', { name: 'Inner' });
    await pick(inner, 'Add Call to action');
    await userEvent.click(
      await screen.findByRole('button', { name: 'Up to Inner' })
    );
    inner = await screen.findByRole('group', { name: 'Inner' });
    const titles = () =>
      within(inner)
        .getAllByRole('button', { name: /^Item \d/ })
        .map((card) => card.textContent);
    expect(titles()).toEqual([
      expect.stringContaining('Quote'),
      expect.stringContaining('Call to action'),
    ]);
    await userEvent.click(
      within(inner).getByRole('button', { name: 'Move Item 2' })
    );
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() =>
      expect(titles()).toEqual([
        expect.stringContaining('Call to action'),
        expect.stringContaining('Quote'),
      ])
    );
    await userEvent.click(
      within(inner).getByRole('button', { name: 'Actions for Item 1' })
    );
    await userEvent.click(
      await screen.findByRole('menuitem', { name: /^Remove/ })
    );
    await waitFor(() => expect(titles()).toHaveLength(1));
    expect(
      within(inner).getByRole('button', { name: 'Add a block' })
    ).toBeEnabled();
  });

  it('marks only the list item whose blocks have an error', async () => {
    renderForm({
      rows: [
        { label: 'A', inner: [{ _template: 'cta', link: '' }] },
        { label: 'B', inner: [{ _template: 'cta', link: '/docs' }] },
      ],
    });
    await userEvent.type(
      await screen.findByRole('textbox', { name: /^Title\b/ }),
      'x'
    );
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }));
    const rows = await screen.findByRole('group', { name: 'Rows' });
    const cards = within(rows).getAllByRole('button', { name: /^Item \d/ });
    await waitFor(() => expect(cards[0]).toHaveAccessibleName(/1 error/));
    expect(cards[1]).not.toHaveAccessibleName(/error/);
  });
});
