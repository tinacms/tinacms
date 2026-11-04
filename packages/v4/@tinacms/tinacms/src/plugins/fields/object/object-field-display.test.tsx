import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DocumentForm } from '../../../admin/document-form';
import { asResolvedConfig } from '../../../config';
import type { FieldDescriptor } from '../../../core/field/contract';
import { drillsInAt } from '../../../editor/form-view-state';
import { toFieldAddress } from '../../../core/field/address';
import type {
  CollectionSchema,
  FieldSchema,
  TinaDocument,
} from '../../../core/schema/types';
import { FormProvider, TinaProvider, useActiveField } from '../../../editor';
import { t } from '../../../index';
import { required } from '../../../plugins/fields';
import coreValidatorsPlugin from '../../../plugins/validators/core-validators.plugin';
import arrayFieldPlugin from '../array/array-field.plugin';
import booleanFieldPlugin from '../boolean/boolean-field.plugin';
import stringFieldPlugin from '../string/string-field.plugin';
import objectFieldPlugin from './object-field.plugin';
import { type ObjectDisplay, displayOf } from './object-field.schema';

const PLUGINS = [
  objectFieldPlugin,
  arrayFieldPlugin,
  stringFieldPlugin,
  booleanFieldPlugin,
  coreValidatorsPlugin,
];

const leaf = () => t.string({ name: 'note', label: 'Note' });

// seo (depth 1) > mid (2) > deep (3, display under test) > note
const collectionWith = (
  deepDisplay?: ObjectDisplay,
  topDisplay?: ObjectDisplay
): CollectionSchema => ({
  name: 'page',
  label: 'Pages',
  format: 'mdx',
  fields: [
    t.object({
      name: 'seo',
      label: 'SEO',
      display: topDisplay,
      fields: [
        t.string({ name: 'title', label: 'Title', validators: [required()] }),
        t.object({
          name: 'mid',
          label: 'Mid',
          fields: [
            t.object({
              name: 'deep',
              label: 'Deep',
              display: deepDisplay,
              fields: [leaf()],
            }),
            t.array({
              name: 'rows',
              label: 'Rows',
              fields: [leaf()],
            }),
          ],
        }),
      ],
    }),
  ],
});

function Activate({ address }: { address: string }) {
  const { setActive } = useActiveField();
  return (
    <button type='button' onClick={() => setActive(toFieldAddress(address))}>
      activate {address}
    </button>
  );
}

const renderForm = (
  collection: CollectionSchema,
  document: TinaDocument = {
    seo: { title: 'Home', mid: { deep: { note: 'n' } } },
  },
  extra?: React.ReactNode
) =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: PLUGINS,
        schema: { collections: [] },
      })}
    >
      <FormProvider
        collection={collection}
        path='content/pages/home.mdx'
        document={document}
      >
        <DocumentForm />
        {extra}
      </FormProvider>
    </TinaProvider>
  );

describe('object display', () => {
  it('defaults to fieldset', () => {
    expect(displayOf({ name: 'a', type: 'object', fields: [] })).toBe(
      'fieldset'
    );
  });

  it('accepts display on t.object and rejects it on other field types', () => {
    t.object({ name: 'a', display: 'collapsible', fields: [] });
    // @ts-expect-error display only applies to an object
    t.string({ name: 'a', display: 'collapsible' });
    // @ts-expect-error display takes only the three looks
    t.object({ name: 'a', display: 'tabs', fields: [] });
  });

  it('drills in at depth 3 by default, and an array there keeps the old button', async () => {
    renderForm(collectionWith(), {
      seo: {
        title: 'Home',
        mid: { deep: { note: 'n' }, rows: [{ note: 'r' }] },
      },
    });
    expect(
      await screen.findByRole('button', { name: 'Open Deep' })
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Open Rows' })).toBeVisible();
    expect(screen.queryByLabelText(/^Note\b/)).toBeNull();
  });

  it('drills in at depth 3 even when display says fieldset or collapsible', async () => {
    const { unmount } = renderForm(collectionWith('fieldset'));
    expect(
      await screen.findByRole('button', { name: 'Open Deep' })
    ).toBeVisible();
    expect(screen.queryByLabelText(/^Note\b/)).toBeNull();
    unmount();

    renderForm(collectionWith('collapsible'));
    expect(
      await screen.findByRole('button', { name: 'Open Deep' })
    ).toBeVisible();
  });

  it('lets an explicit drillIn win at depth 1, and shows its fields in place once open', async () => {
    renderForm(collectionWith(undefined, 'drillIn'));
    await userEvent.click(
      await screen.findByRole('button', { name: 'Open SEO' })
    );
    expect(await screen.findByLabelText(/^Title\b/)).toHaveValue('Home');
    expect(screen.queryByRole('button', { name: 'Open SEO' })).toBeNull();
  });

  it('opens a closed collapsible and focuses the field when a field inside becomes active', async () => {
    renderForm(
      collectionWith(undefined, 'collapsible'),
      undefined,
      <Activate address='seo.title' />
    );
    expect(screen.queryByLabelText(/^Title\b/)).toBeNull();
    await userEvent.click(
      await screen.findByRole('button', { name: 'activate seo.title' })
    );
    const title = await screen.findByLabelText(/^Title\b/);
    await waitFor(() => expect(title).toHaveFocus());
    expect(
      screen.getByRole('button', { name: /SEO/, expanded: true })
    ).toBeVisible();
  });

  it('shows the first non-empty text field as the summary of a closed collapsible, and follows edits', async () => {
    renderForm(collectionWith(undefined, 'collapsible'));
    const header = () => screen.getByRole('button', { name: /SEO/ });
    await screen.findByRole('button', { name: /SEO/ });
    expect(header()).toHaveTextContent('Home');
    await userEvent.click(header());
    const title = await screen.findByLabelText(/^Title\b/);
    await userEvent.clear(title);
    await userEvent.type(title, 'About');
    await userEvent.click(header());
    expect(header()).toHaveTextContent('About');
  });

  it('counts a field only once it is revealed, and only while the collapsible is closed', async () => {
    renderForm(collectionWith(undefined, 'collapsible'), {
      seo: { title: 'Home', mid: { deep: { note: '' } } },
    });
    const header = () => screen.getByRole('button', { name: /SEO/ });
    const badge = () => header().querySelector('[data-slot=badge]');
    await screen.findByRole('button', { name: /SEO/ });
    expect(badge()).toBeNull();

    await userEvent.click(header());
    await userEvent.clear(await screen.findByLabelText(/^Title\b/));
    await userEvent.tab();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Title is required'
    );
    expect(badge()).toBeNull();

    await userEvent.click(header());
    await waitFor(() => expect(badge()).toHaveTextContent('1'));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('reopens a collapsible that was folded by hand when the same field is activated again', async () => {
    renderForm(
      collectionWith(undefined, 'collapsible'),
      undefined,
      <Activate address='seo.title' />
    );
    const activate = await screen.findByRole('button', {
      name: 'activate seo.title',
    });
    await userEvent.click(activate);
    await screen.findByLabelText(/^Title\b/);
    await userEvent.click(screen.getByRole('button', { name: /SEO/ }));
    expect(screen.queryByLabelText(/^Title\b/)).toBeNull();

    await userEvent.click(activate);
    expect(await screen.findByLabelText(/^Title\b/)).toBeVisible();
  });

  it('shows Not set and the required mark for a required object with no text field', async () => {
    renderForm(
      {
        name: 'page',
        label: 'Pages',
        format: 'mdx',
        fields: [
          t.object({
            name: 'flags',
            label: 'Flags',
            display: 'collapsible',
            validators: [required()],
            fields: [t.boolean({ name: 'on', label: 'On' })],
          }),
        ],
      },
      { flags: { on: true } }
    );
    const header = await screen.findByRole('button', { name: /Flags/ });
    expect(header).toHaveTextContent('Not set');
    expect(header).toHaveTextContent('(required)');
  });

  it('keeps the depth rule for a plugin with no drillsIn, and lets drillsIn override it above level 3', () => {
    const node = { name: 'x', type: 'x' } as FieldSchema;
    const describe = (
      metadata: FieldDescriptor['metadata']
    ): FieldDescriptor => ({
      Component: () => null,
      metadata,
    });
    const plain = describe({ drillable: true });
    expect(drillsInAt(plain, node, 'a.b')).toBe(false);
    expect(drillsInAt(plain, node, 'a.b.c')).toBe(true);
    const forced = describe({ drillable: true, drillsIn: () => false });
    expect(drillsInAt(forced, node, 'a.b')).toBe(false);
    expect(drillsInAt(forced, node, 'a.b.c')).toBe(true);
    expect(drillsInAt(describe({}), node, 'a.b.c')).toBe(false);
  });
});
