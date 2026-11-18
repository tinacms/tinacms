import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFormContext } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { DocumentForm } from '../../../admin/document-form';
import { asResolvedConfig } from '../../../config';
import { toFieldAddress } from '../../../core/field/address';
import { useFormStore } from '../../../form/form-store';
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

// Replaces the list at `address` without its second item, as code outside the card would.
function DropSecond({ address }: { address: string }) {
  const { getValues, setValue } = useFormContext();
  return (
    <button
      type='button'
      onClick={() => {
        const list: unknown = getValues(address);
        if (Array.isArray(list)) {
          setValue(
            address,
            list.filter((_, index) => index !== 1)
          );
        }
      }}
    >
      drop second of {address}
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
        <DropSecond address={address.replace(/\.0$/, '')} />
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
  return { active, act, user, container };
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

  it('leaves no card active when the returned card is removed', async () => {
    const { active, act } = await cameBackTo(address, back);
    await waitFor(() => expect(active()).toEqual([0]));
    await act(1, /^Remove/);
    expect(active()).toEqual([]);
  });
});

describe.each([
  {
    list: 'a top-level list',
    address: 'blocks.0',
    back: 'Home',
    root: 'blocks',
  },
  {
    list: 'a nested list',
    address: 'wrap.inner.blocks.0',
    back: 'Blocks',
    root: 'wrap.inner.blocks',
  },
])(
  'acting on cards after stepping back in $list',
  ({ address, back, root }) => {
    const grip = (container: HTMLElement, index: number) =>
      container.querySelectorAll<HTMLElement>('[data-grip]')[index];

    it('moves the look with Hero when its grip is dragged down, then up', async () => {
      const { active, container, user } = await cameBackTo(address, back);
      await waitFor(() => expect(active()).toEqual([0]));
      grip(container, 0).focus();
      await user.keyboard('{ArrowDown}');
      await waitFor(() => expect(active()).toEqual([1]));
      grip(container, 1).focus();
      await user.keyboard('{ArrowUp}');
      await waitFor(() => expect(active()).toEqual([0]));
    });

    it.each([
      ['Remove', /^Remove/],
      ['Move up', /^Move up/],
    ])(
      'leaves no card active after Quote menu %s, and the outline follows the focused card',
      async (_name, action) => {
        const { active, act } = await cameBackTo(address, back);
        await waitFor(() => expect(active()).toEqual([0]));
        await act(2, action);
        await waitFor(() => expect(active()).toEqual([]));
      }
    );

    it("clears the look when Quote's grip is dragged to a new place, and not again when dropped back", async () => {
      const { active, container, user } = await cameBackTo(address, back);
      await waitFor(() => expect(active()).toEqual([0]));
      grip(container, 1).focus();
      await user.keyboard('{ArrowUp}');
      await waitFor(() => expect(active()).toEqual([]));
      const order = () =>
        Array.from(container.querySelectorAll('[data-array-item]')).map(
          (card) => card.textContent
        );
      const before = order();
      grip(container, 0).focus();
      await user.keyboard(' {ArrowDown}{ArrowUp} ');
      expect(order()).toEqual(before);
      expect(active()).toEqual([]);
    });

    it.each([
      ['Hero', 1, 1],
      ['Quote', 2, 2],
    ])(
      'leaves no card active when Duplicate on %s opens the copy as its own level',
      async (name, item, copy) => {
        const { active, act } = await cameBackTo(address, back);
        await waitFor(() => expect(active()).toEqual([0]));
        await act(item, /^Duplicate/);
        await screen.findByRole('heading', { level: 2, name });
        expect(active()).toEqual([]);
        expect(useFormStore.getState().active?.address).toMatch(
          new RegExp(`^${root.replaceAll('.', '\\.')}\\.${copy}\\.`)
        );
      }
    );

    it('never moves the look to another card when code outside removes Quote', async () => {
      const { active, user } = await cameBackTo(address, back);
      await waitFor(() => expect(active()).toEqual([0]));
      await user.click(
        screen.getByRole('button', {
          name: `drop second of ${root}`,
        })
      );
      await waitFor(() =>
        expect(
          screen.getAllByRole('button', { name: /^Actions for Item/ })
        ).toHaveLength(2)
      );
      expect(active()).toEqual([]);
    });
  }
);

describe('focusing another card', () => {
  it('clears the returned card active look', async () => {
    const { active, container } = await cameBackTo('blocks.0', 'Home');
    await waitFor(() => expect(active()).toEqual([0]));
    container.querySelectorAll<HTMLElement>('[data-grip]')[1].focus();
    await waitFor(() => expect(active()).toEqual([]));
  });
});

describe.each([
  {
    list: 'a top-level list',
    address: 'blocks.0',
    back: 'Home',
    root: 'blocks',
  },
  {
    list: 'a nested list',
    address: 'wrap.inner.blocks.0',
    back: 'Blocks',
    root: 'wrap.inner.blocks',
  },
])('the page outline for cards in $list', ({ address, back, root }) => {
  it('points hover at the card, not the list, and clears on leaving', async () => {
    const { user, container } = await cameBackTo(address, back);
    const card = container.querySelectorAll('[data-array-item]')[1];
    await user.hover(card);
    expect(useFormStore.getState().hovered?.address).toBe(`${root}.1`);
    await user.unhover(card);
    expect(useFormStore.getState().hovered).toBeNull();
  });

  it('clears the card hover when the list unmounts under the pointer', async () => {
    const { user, container } = await cameBackTo(address, back);
    await user.hover(container.querySelectorAll('[data-array-item]')[1]);
    expect(useFormStore.getState().hovered?.address).toBe(`${root}.1`);
    await user.click(
      container.querySelectorAll(
        '[data-array-item] [data-slot="list-card-head"] button'
      )[1]
    );
    await waitFor(() =>
      expect(useFormStore.getState().hovered?.address ?? '').not.toContain(
        `${root}.`
      )
    );
  });
});

const rowsCollection: CollectionSchema = {
  name: 'sheet',
  label: 'Sheets',
  format: 'json',
  fields: [
    t.array({
      name: 'rows',
      label: 'Rows',
      fields: [
        t.string({ name: 'title', label: 'Title' }),
        t.array({
          name: 'inner',
          label: 'Inner',
          fields: [t.string({ name: 'note', label: 'Note' })],
        }),
      ],
    }),
  ],
};

function renderRows() {
  const view = render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [objectFieldPlugin, arrayFieldPlugin, stringFieldPlugin],
        schema: { collections: [] },
      })}
    >
      <FormProvider
        collection={rowsCollection}
        path='content/sheets/main.json'
        document={{
          rows: [
            { title: 'One', inner: [{ note: 'a' }] },
            { title: 'Two', inner: [] },
          ],
        }}
      >
        <DocumentForm />
      </FormProvider>
    </TinaProvider>
  );
  return { ...view, user: userEvent.setup() };
}

async function toggleFirstRow(
  user: ReturnType<typeof userEvent.setup>,
  container: HTMLElement
) {
  await screen.findAllByRole('button', { name: 'Actions for Item 1' });
  const toggle = container.querySelector<HTMLElement>(
    '[data-array-item] button[aria-expanded]'
  );
  if (!toggle) throw new Error('no card toggle');
  await user.click(toggle);
}

describe('cards that open in place', () => {
  it('keeps the hover on a field inside an open card instead of the card', async () => {
    const { user, container } = renderRows();
    await toggleFirstRow(user, container);
    const field = await screen.findByLabelText('Title');
    await user.hover(field);
    expect(useFormStore.getState().hovered?.address).toBe('rows.0.title');
    await user.unhover(field);
    const cards = container.querySelectorAll('[data-array-item]');
    await user.hover(cards[cards.length - 1]);
    expect(useFormStore.getState().hovered?.address).toBe('rows.1');
  });
});

describe('focusing another card', () => {
  it('clears the returned card when focus lands on its menu button', async () => {
    const { active } = await cameBackTo('blocks.0', 'Home');
    await waitFor(() => expect(active()).toEqual([0]));
    screen.getByRole('button', { name: 'Actions for Item 2' }).focus();
    await waitFor(() => expect(active()).toEqual([]));
  });
});
