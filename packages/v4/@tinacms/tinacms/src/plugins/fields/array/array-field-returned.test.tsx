import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DocumentForm } from '../../../admin/document-form';
import { asResolvedConfig } from '../../../config';
import { toFieldAddress } from '../../../core/field/address';
import type { CollectionSchema } from '../../../core/schema/types';
import { FormProvider, TinaProvider, useActiveField } from '../../../editor';
import { t } from '../../../index';
import { LevelHead } from '../../../test/level-head';
import objectFieldPlugin from '../object/object-field.plugin';
import stringFieldPlugin from '../string/string-field.plugin';
import arrayFieldPlugin from './array-field.plugin';

const blocks = (name: string) =>
  t.array({
    name,
    label: 'Blocks',
    templates: [
      {
        name: 'hero',
        label: 'Hero',
        fields: [t.string({ name: 'headline', label: 'Headline' })],
      },
      {
        name: 'quote',
        label: 'Quote',
        fields: [t.string({ name: 'text', label: 'Text' })],
      },
      {
        name: 'cta',
        label: 'Call to action',
        fields: [t.string({ name: 'link', label: 'Link' })],
      },
    ],
  });

const collection: CollectionSchema = {
  name: 'page',
  label: 'Pages',
  format: 'mdx',
  fields: [
    t.string({ name: 'title', label: 'Title' }),
    blocks('blocks'),
    t.object({
      name: 'wrap',
      label: 'Wrap',
      fields: [
        t.object({ name: 'inner', label: 'Inner', fields: [blocks('blocks')] }),
      ],
    }),
  ],
};

const items = (list: string) => [
  { _template: 'hero', headline: `${list} hero` },
  { _template: 'quote', text: `${list} quote` },
  { _template: 'cta', link: `${list} cta` },
];

function Activate({ address }: { address: string }) {
  const { setActive } = useActiveField();
  return (
    <button type='button' onClick={() => setActive(toFieldAddress(address))}>
      activate {address}
    </button>
  );
}

// Clicks `address` on the page, then steps back to the level that lists it.
async function cameBackTo(address: string, back: string | RegExp) {
  const user = userEvent.setup();
  const { container } = render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [objectFieldPlugin, arrayFieldPlugin, stringFieldPlugin],
        schema: { collections: [] },
      })}
    >
      <FormProvider
        collection={collection}
        path='content/pages/home.mdx'
        document={{
          title: 'Home',
          blocks: items('top'),
          wrap: { inner: { blocks: items('deep') } },
        }}
      >
        <LevelHead />
        <DocumentForm />
        <Activate address={address} />
      </FormProvider>
    </TinaProvider>
  );
  await user.click(
    await screen.findByRole('button', { name: `activate ${address}` })
  );
  await screen.findByRole('heading', { level: 2, name: 'Hero' });
  await user.click(
    within(screen.getByRole('navigation', { name: 'Location' })).getByRole(
      'button',
      { name: back }
    )
  );
  await screen.findByRole('button', { name: 'Actions for Item 1' });
  const active = () =>
    Array.from(
      container.querySelectorAll(
        '[data-array-item] > [data-slot="list-card-item"]'
      )
    ).flatMap((card, index) =>
      card.hasAttribute('data-active') ? [index] : []
    );
  const act = async (item: number, action: RegExp) => {
    await user.click(
      screen.getByRole('button', { name: `Actions for Item ${item}` })
    );
    await user.click(await screen.findByRole('menuitem', { name: action }));
  };
  return { active, act };
}

describe.each([
  { list: 'a top-level list', address: 'blocks.0', back: 'Home' },
  { list: 'a nested list', address: 'wrap.inner.blocks.0', back: 'Blocks' },
])('the card returned to in $list', ({ address, back }) => {
  it('is active after stepping back', async () => {
    const { active } = await cameBackTo(address, back);
    await waitFor(() => expect(active()).toEqual([0]));
  });

  it('moves its active look with the card on Move down, then Move up', async () => {
    const { active, act } = await cameBackTo(address, back);
    await waitFor(() => expect(active()).toEqual([0]));
    await act(1, /^Move down/);
    await waitFor(() => expect(active()).toEqual([1]));
    await act(2, /^Move up/);
    await waitFor(() => expect(active()).toEqual([0]));
  });

  it('keeps it on the card at its new index when another card is removed', async () => {
    const { active, act } = await cameBackTo(address, back);
    await waitFor(() => expect(active()).toEqual([0]));
    await act(1, /^Move down/);
    await waitFor(() => expect(active()).toEqual([1]));
    await act(1, /^Remove/);
    await waitFor(() => expect(active()).toEqual([0]));
  });

  it('leaves no card active when the returned card is removed', async () => {
    const { active, act } = await cameBackTo(address, back);
    await waitFor(() => expect(active()).toEqual([0]));
    await act(1, /^Remove/);
    expect(active()).toEqual([]);
  });
});
