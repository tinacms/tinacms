import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('focusing another card', () => {
  it('clears the returned card active look and moves the outline to the focused card', async () => {
    const { active, container } = await cameBackTo('blocks.0', 'Home');
    await waitFor(() => expect(active()).toEqual([0]));
    container.querySelectorAll<HTMLElement>('[data-grip]')[1].focus();
    await waitFor(() => expect(active()).toEqual([]));
    expect(useFormStore.getState().focusedCard?.address).toBe('blocks.1');
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
  const outlined = () => useFormStore.getState().focusedCard?.address;

  it('points at the returned card, and follows it on Move down', async () => {
    const { active, act } = await cameBackTo(address, back);
    await waitFor(() => expect(active()).toEqual([0]));
    await waitFor(() => expect(outlined()).toBe(`${root}.0`));
    expect(useFormStore.getState().active?.address).toBe(root);
    await act(1, /^Move down/);
    await waitFor(() => expect(outlined()).toBe(`${root}.1`));
  });

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

  it('points at a card whose grip takes focus, with no level opened, and lets go on blur', async () => {
    const { user, container } = await cameBackTo(address, back);
    const grips = container.querySelectorAll<HTMLElement>('[data-grip]');
    await user.click(document.body);
    grips[2].focus();
    await waitFor(() => expect(outlined()).toBe(`${root}.2`));
    expect(useFormStore.getState().active?.address).toBe(root);
    expect(
      screen.queryByRole('heading', { level: 2, name: 'Call to action' })
    ).toBeNull();
    grips[2].blur();
    await waitFor(() => expect(outlined()).toBeUndefined());
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

  it('keeps the outer card outlined when its nested list mounts and unmounts', async () => {
    const { user, container } = renderRows();
    await screen.findAllByRole('button', { name: 'Actions for Item 1' });
    container.querySelectorAll<HTMLElement>('[data-grip]')[0].focus();
    await waitFor(() =>
      expect(useFormStore.getState().focusedCard?.address).toBe('rows.0')
    );
    await toggleFirstRow(user, container);
    await screen.findByLabelText('Title');
    expect(useFormStore.getState().focusedCard?.address).toBe('rows.0');
    await toggleFirstRow(user, container);
    await waitFor(() => expect(screen.queryByLabelText('Title')).toBeNull());
    expect(useFormStore.getState().focusedCard?.address).toBe('rows.0');
  });
});

describe('focusing another card', () => {
  it('clears the returned card when focus lands on its menu button', async () => {
    const { active } = await cameBackTo('blocks.0', 'Home');
    await waitFor(() => expect(active()).toEqual([0]));
    screen.getByRole('button', { name: 'Actions for Item 2' }).focus();
    await waitFor(() => expect(active()).toEqual([]));
    expect(useFormStore.getState().focusedCard?.address).toBe('blocks.1');
  });
});
