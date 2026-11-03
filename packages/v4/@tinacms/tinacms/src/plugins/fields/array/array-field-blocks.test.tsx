import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../../../config';
import { toFieldAddress } from '../../../core/field/address';
import type { MediaProvider } from '../../../core/media/contract';
import { definePlugin } from '../../../core/plugin';
import type {
  CollectionSchema,
  TinaDocument,
} from '../../../core/schema/types';
import { FormProvider, TinaProvider } from '../../../editor';
import { toFormId, useFormStore } from '../../../form/form-store';
import { t } from '../../../index';
import { LabelledFields } from '../../../test/labelled-fields';
import { openBlockPicker } from '../../../test/open-block-picker';
import objectFieldPlugin from '../object/object-field.plugin';
import stringFieldPlugin from '../string/string-field.plugin';
import arrayFieldPlugin from './array-field.plugin';

const PATH = 'content/pages/home.mdx';
const media: MediaProvider = {
  upload: async (file) => file.name,
  list: async () => ({ items: [] }),
  delete: async () => {},
  resolveUrl: (path) => `/uploads/${path}`,
};
const mediaPlugin = definePlugin({
  name: 'test:media:stub',
  provides: ['media'],
  client: async () => ({ default: { slice: () => ({ ...media }) } }),
});
const PLUGINS = [
  arrayFieldPlugin,
  stringFieldPlugin,
  objectFieldPlugin,
  mediaPlugin,
];

const heroFields = [t.string({ name: 'headline', label: 'Headline' })];

const templates = [
  { name: 'hero', label: 'Hero', fields: heroFields },
  {
    name: 'columns',
    label: 'Columns',
    category: 'Layout',
    fields: [t.string({ name: 'count', label: 'Count' })],
  },
  {
    name: 'quote',
    label: 'Quote',
    category: 'Layout',
    fields: [t.string({ name: 'text', label: 'Text' })],
  },
  {
    name: 'cta',
    label: 'Call to action',
    category: 'Content',
    fields: [t.string({ name: 'link', label: 'Link' })],
  },
];

const collection: CollectionSchema = {
  name: 'page',
  format: 'mdx',
  fields: [
    t.array({ name: 'blocks', label: 'Blocks', templates }),
    t.array({
      name: 'tags',
      label: 'Tags',
      of: t.string({ name: 'tag', label: 'Tag' }),
    }),
    t.array({
      name: 'broken',
      label: 'Broken',
      picker: 'grid',
      templates: [
        {
          name: 'hero',
          label: 'Hero',
          previewImage: 'missing/hero.png',
          fields: heroFields,
        },
      ],
    }),
    t.object({
      name: 'outer',
      label: 'Outer',
      fields: [t.array({ name: 'deep', label: 'Deep', templates })],
    }),
  ],
};

const valueOf = (name: string) =>
  useFormStore.getState().forms[toFormId(PATH)]?.values[toFieldAddress(name)];

const deepOf = () =>
  (valueOf('outer') as { deep?: TinaDocument[] } | undefined)?.deep;

const renderPage = (document: TinaDocument = {}) =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: PLUGINS,
        schema: { collections: [] },
      })}
    >
      <FormProvider collection={collection} path={PATH} document={document}>
        <LabelledFields />
      </FormProvider>
    </TinaProvider>
  );

const list = (name: string) => screen.findByRole('group', { name });
const optionNames = (panel: HTMLElement) =>
  within(panel)
    .queryAllByRole('button', { name: /^Add / })
    .map((option) => option.getAttribute('aria-label'));

describe('Blocks field picker', () => {
  it('opens a panel named "Choose a block" with a search box, and focuses the search box', async () => {
    renderPage();
    const blocks = await list('Blocks');
    const panel = await openBlockPicker(blocks);
    expect(
      within(panel).getByRole('searchbox', { name: 'Search blocks' })
    ).toHaveFocus();
    const trigger = within(blocks).getByRole('button', { name: 'Add a block' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('keeps "Add item" and no picker on a list that is not blocks', async () => {
    renderPage();
    const tags = await list('Tags');
    expect(
      within(tags).getByRole('textbox', { name: 'Add item' })
    ).toBeInTheDocument();
    expect(
      within(tags).queryByRole('button', { name: 'Add a block' })
    ).toBeNull();
  });

  it('filters by name without regard to case, clears, and starts empty on reopen', async () => {
    renderPage();
    const panel = await openBlockPicker(await list('Blocks'));
    const search = within(panel).getByRole('searchbox');
    await userEvent.type(search, 'CALL');
    expect(optionNames(panel)).toEqual(['Add Call to action']);
    await userEvent.clear(search);
    expect(optionNames(panel)).toHaveLength(4);
    await userEvent.type(search, 'qu');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    const again = await openBlockPicker(await list('Blocks'));
    expect(within(again).getByRole('searchbox')).toHaveValue('');
    expect(optionNames(again)).toHaveLength(4);
  });

  it('says "No blocks match." and keeps focus in the search box', async () => {
    renderPage();
    const panel = await openBlockPicker(await list('Blocks'));
    const search = within(panel).getByRole('searchbox');
    await userEvent.type(search, 'zzz');
    expect(within(panel).getByText('No blocks match.')).toBeVisible();
    expect(optionNames(panel)).toEqual([]);
    expect(search).toHaveFocus();
  });

  it('puts ungrouped blocks first, groups the rest, and drops an empty group while searching', async () => {
    renderPage();
    const panel = await openBlockPicker(await list('Blocks'));
    const ungrouped = within(panel).getByRole('group', {
      name: 'Choose a block',
    });
    const layout = within(panel).getByRole('group', { name: 'Layout' });
    expect(optionNames(ungrouped)).toEqual(['Add Hero']);
    expect(optionNames(layout)).toEqual(['Add Columns', 'Add Quote']);
    expect(
      within(panel).getByRole('group', { name: 'Content' })
    ).toBeInTheDocument();
    await userEvent.type(within(panel).getByRole('searchbox'), 'quote');
    expect(within(panel).queryByRole('group', { name: 'Content' })).toBeNull();
    expect(
      within(panel).getByRole('group', { name: 'Layout' })
    ).toBeInTheDocument();
  });

  it('closes on Escape with text typed, adds nothing, and returns focus to "Add a block"', async () => {
    renderPage({ blocks: [] });
    const blocks = await list('Blocks');
    const panel = await openBlockPicker(blocks);
    await userEvent.type(within(panel).getByRole('searchbox'), 'he');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(
      within(blocks).getByRole('button', { name: 'Add a block' })
    ).toHaveFocus();
    expect(valueOf('blocks')).toEqual([]);
  });

  it('closes on an outside press', async () => {
    renderPage();
    await openBlockPicker(await list('Blocks'));
    await userEvent.click(document.body);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('adds a block by keyboard alone, seeds it, closes, and focuses the new block', async () => {
    renderPage({ blocks: [] });
    const blocks = await list('Blocks');
    within(blocks).getByRole('button', { name: 'Add a block' }).focus();
    await userEvent.keyboard('{Enter}');
    await screen.findByRole('dialog', { name: 'Choose a block' });
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Add Hero' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(valueOf('blocks')).toEqual([{ _template: 'hero', headline: '' }])
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() => {
      expect(document.activeElement).toHaveAttribute('data-grip');
      expect(blocks).toContainElement(document.activeElement as HTMLElement);
    });
  });

  it('inserts at the chosen index from the same picker, and Escape returns focus to the card grip', async () => {
    renderPage({ blocks: [{ _template: 'hero', headline: 'Hi' }] });
    const blocks = await list('Blocks');
    const menu = within(blocks).getByRole('button', {
      name: 'Actions for Item 1',
    });
    await userEvent.click(menu);
    await userEvent.click(
      await screen.findByRole('menuitem', { name: /^Insert above/ })
    );
    const inline = await within(blocks).findByRole('region', {
      name: 'Choose a block',
    });
    await waitFor(() =>
      expect(within(inline).getByRole('searchbox')).toHaveFocus()
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(within(blocks).queryByRole('region')).toBeNull()
    );
    expect(valueOf('blocks')).toHaveLength(1);
    await waitFor(() =>
      expect(document.activeElement).toHaveAttribute('data-grip')
    );

    await userEvent.click(menu);
    await userEvent.click(
      await screen.findByRole('menuitem', { name: /^Insert above/ })
    );
    await userEvent.click(
      await within(blocks).findByRole('button', { name: 'Add Quote' })
    );
    await waitFor(() =>
      expect(
        (valueOf('blocks') as TinaDocument[]).map((block) => block._template)
      ).toEqual(['quote', 'hero'])
    );
  });

  it('shows the name alone when the preview image is missing, and still adds', async () => {
    renderPage({ broken: [] });
    const panel = await openBlockPicker(await list('Broken'));
    const hero = within(panel).getByRole('button', { name: 'Add Hero' });
    expect(hero.querySelector('img')).not.toBeNull();
    hero.querySelector('img')?.dispatchEvent(new Event('error'));
    await waitFor(() => expect(hero.querySelector('img')).toBeNull());
    await userEvent.click(hero);
    await waitFor(() => expect(valueOf('broken')).toHaveLength(1));
  });

  it('adds, searches and removes in a blocks field inside an object', async () => {
    renderPage();
    const deep = await list('Deep');
    const panel = await openBlockPicker(deep);
    await userEvent.type(within(panel).getByRole('searchbox'), 'quote');
    await userEvent.click(
      within(panel).getByRole('button', { name: 'Add Quote' })
    );
    await waitFor(() =>
      expect(deepOf()).toEqual([{ _template: 'quote', text: '' }])
    );
    await userEvent.click(
      within(deep).getByRole('button', { name: 'Actions for Item 1' })
    );
    await userEvent.click(
      await screen.findByRole('menuitem', { name: /^Remove/ })
    );
    await waitFor(() => expect(deepOf()).toEqual([]));
    await waitFor(() =>
      expect(
        within(deep).getByRole('button', { name: 'Add a block' })
      ).toHaveFocus()
    );
  });

  it('loads and holds saved blocks unchanged', async () => {
    const saved = [
      { _template: 'hero', headline: 'Hi' },
      { _template: 'cta', link: '/docs' },
    ];
    renderPage({ blocks: saved });
    await list('Blocks');
    expect(valueOf('blocks')).toEqual(saved);
  });
});
