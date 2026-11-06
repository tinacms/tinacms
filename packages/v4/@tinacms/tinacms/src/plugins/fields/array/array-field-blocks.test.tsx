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
    fields: [t.string({ name: 'count', label: 'Count' })],
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
];

const collection: CollectionSchema = {
  name: 'page',
  format: 'mdx',
  fields: [
    t.array({ name: 'blocks', label: 'Blocks', templates }),
    t.array({
      name: 'sections',
      label: 'Sections',
      addLabel: 'Add a section',
      templates,
    }),
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

  it('says "Add a section" on the picker button when the field sets addLabel', async () => {
    renderPage();
    const sections = await list('Sections');
    expect(
      within(sections).getByRole('button', { name: 'Add a section' })
    ).toBeInTheDocument();
    expect(
      within(sections).queryByRole('button', { name: 'Add a block' })
    ).toBeNull();
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

  it('lists every template once in schema order with no headings, and search narrows the same list', async () => {
    renderPage();
    const panel = await openBlockPicker(await list('Blocks'));
    expect(optionNames(panel)).toEqual([
      'Add Hero',
      'Add Columns',
      'Add Quote',
      'Add Call to action',
    ]);
    expect(within(panel).queryByText(/^(Layout|Content)$/)).toBeNull();
    await userEvent.type(within(panel).getByRole('searchbox'), 'quote');
    expect(optionNames(panel)).toEqual(['Add Quote']);
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
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Headline' })).toHaveFocus()
    );
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

  it.each([
    [
      'Item 1 below, then Item 2 above (same position)',
      1,
      /^Insert below/,
      2,
      /^Insert above/,
    ],
    [
      'Item 1 above twice (same action)',
      1,
      /^Insert above/,
      1,
      /^Insert above/,
    ],
  ])(
    'reopens the insert picker with an empty search and focus in it: %s',
    async (_name, firstItem, firstWhere, secondItem, secondWhere) => {
      renderPage({
        blocks: [
          { _template: 'hero', headline: 'A' },
          { _template: 'hero', headline: 'B' },
        ],
      });
      const blocks = await list('Blocks');
      const insertFrom = async (item: number, where: RegExp) => {
        await userEvent.click(
          within(blocks).getByRole('button', {
            name: `Actions for Item ${item}`,
          })
        );
        await userEvent.click(
          await screen.findByRole('menuitem', { name: where })
        );
      };
      await insertFrom(firstItem, firstWhere);
      const first = await within(blocks).findByRole('region', {
        name: 'Choose a block',
      });
      await userEvent.type(within(first).getByRole('searchbox'), 'call');
      await insertFrom(secondItem, secondWhere);
      const second = await within(blocks).findByRole('region', {
        name: 'Choose a block',
      });
      const search = within(second).getByRole('searchbox');
      expect(search).toHaveValue('');
      await waitFor(() => expect(search).toHaveFocus());
      await userEvent.keyboard('{Escape}');
      await waitFor(() =>
        expect(within(blocks).queryByRole('region')).toBeNull()
      );
    }
  );

  describe('insert picker while the list changes', () => {
    const twoHeroes = {
      blocks: [
        { _template: 'hero', headline: 'A' },
        { _template: 'hero', headline: 'B' },
      ],
    };
    const headlines = () =>
      (valueOf('blocks') as TinaDocument[]).map(
        (block) => block.headline ?? block._template
      );
    const act = async (blocks: HTMLElement, item: number, action: RegExp) => {
      await userEvent.click(
        within(blocks).getByRole('button', { name: `Actions for Item ${item}` })
      );
      await userEvent.click(
        await screen.findByRole('menuitem', { name: action })
      );
    };
    const openInsert = async (item: number, action: RegExp) => {
      const blocks = await list('Blocks');
      await act(blocks, item, action);
      const inline = await within(blocks).findByRole('region', {
        name: 'Choose a block',
      });
      return { blocks, inline };
    };
    const gripOf = (blocks: HTMLElement, item: number) =>
      within(blocks).getByRole('button', { name: `Move Item ${item}` });
    // The picker remounts when its gap changes, so look it up again each time.
    const picker = (blocks: HTMLElement) =>
      within(blocks).findByRole('region', { name: 'Choose a block' });

    it('Cancel after Move up focuses the grip of the card that opened the picker', async () => {
      renderPage(twoHeroes);
      const { blocks } = await openInsert(2, /^Insert above/);
      await act(blocks, 2, /^Move up/);
      await waitFor(() => expect(headlines()).toEqual(['B', 'A']));
      await userEvent.click(
        within(await picker(blocks)).getByRole('button', { name: 'Cancel' })
      );
      await waitFor(() => expect(gripOf(blocks, 1)).toHaveFocus());
      expect(within(blocks).queryByRole('region')).toBeNull();
    });

    it('Cancel after another card is removed focuses the opener grip at its new position', async () => {
      renderPage(twoHeroes);
      const { blocks } = await openInsert(2, /^Insert above/);
      await act(blocks, 1, /^Remove/);
      await waitFor(() => expect(headlines()).toEqual(['B']));
      await userEvent.click(
        within(await picker(blocks)).getByRole('button', { name: 'Cancel' })
      );
      await waitFor(() => expect(gripOf(blocks, 1)).toHaveFocus());
    });

    it('closes the picker when its opener card is removed, with focus on a card, never the body', async () => {
      renderPage(twoHeroes);
      const { blocks } = await openInsert(2, /^Insert above/);
      await act(blocks, 2, /^Remove/);
      await waitFor(() =>
        expect(within(blocks).queryByRole('region')).toBeNull()
      );
      await waitFor(() => expect(gripOf(blocks, 1)).toHaveFocus());
    });

    it('a pick after another card is removed lands in the opener gap and focuses the new block', async () => {
      renderPage(twoHeroes);
      const { blocks } = await openInsert(2, /^Insert below/);
      await act(blocks, 1, /^Remove/);
      await waitFor(() => expect(headlines()).toEqual(['B']));
      await userEvent.click(
        within(await picker(blocks)).getByRole('button', { name: 'Add Quote' })
      );
      await waitFor(() => expect(headlines()).toEqual(['B', 'quote']));
      await waitFor(() =>
        expect(screen.getByRole('textbox', { name: /^Text\b/ })).toHaveFocus()
      );
    });

    it('a pick after Move up lands in the gap next to the moved opener', async () => {
      renderPage(twoHeroes);
      const { blocks } = await openInsert(2, /^Insert below/);
      await act(blocks, 2, /^Move up/);
      await waitFor(() => expect(headlines()).toEqual(['B', 'A']));
      await userEvent.click(
        within(await picker(blocks)).getByRole('button', { name: 'Add Quote' })
      );
      await waitFor(() => expect(headlines()).toEqual(['B', 'quote', 'A']));
    });
  });

  it('keeps focus in the insert picker search box after Clear search', async () => {
    renderPage({ blocks: [{ _template: 'hero', headline: 'A' }] });
    const blocks = await list('Blocks');
    await userEvent.click(
      within(blocks).getByRole('button', { name: 'Actions for Item 1' })
    );
    await userEvent.click(
      await screen.findByRole('menuitem', { name: /^Insert above/ })
    );
    const inline = await within(blocks).findByRole('region', {
      name: 'Choose a block',
    });
    const search = within(inline).getByRole('searchbox');
    await userEvent.type(search, 'x');
    await userEvent.click(
      within(inline).getByRole('button', { name: 'Clear search' })
    );
    expect(search).toHaveValue('');
    expect(search).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(within(blocks).queryByRole('region')).toBeNull()
    );
  });

  it('closes the insert picker with Cancel, inserts nothing and returns focus to the card grip', async () => {
    renderPage({ blocks: [{ _template: 'hero', headline: 'Hi' }] });
    const blocks = await list('Blocks');
    await userEvent.click(
      within(blocks).getByRole('button', { name: 'Actions for Item 1' })
    );
    await userEvent.click(
      await screen.findByRole('menuitem', { name: /^Insert below/ })
    );
    const inline = await within(blocks).findByRole('region', {
      name: 'Choose a block',
    });
    await userEvent.click(
      within(inline).getByRole('button', { name: 'Cancel' })
    );
    await waitFor(() =>
      expect(within(blocks).queryByRole('region')).toBeNull()
    );
    expect(valueOf('blocks')).toHaveLength(1);
    await waitFor(() =>
      expect(document.activeElement).toHaveAttribute('data-grip')
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
      await screen.findByRole('button', { name: 'Back to fields' })
    );
    const again = await list('Deep');
    await userEvent.click(
      within(again).getByRole('button', { name: 'Actions for Item 1' })
    );
    await userEvent.click(
      await screen.findByRole('menuitem', { name: /^Remove/ })
    );
    await waitFor(() => expect(deepOf()).toEqual([]));
    await waitFor(() =>
      expect(
        within(again).getByRole('button', { name: 'Add a block' })
      ).toHaveFocus()
    );
  });

  it('closes the insert picker when "Add a block" opens, and the add panel when Insert opens', async () => {
    renderPage({ blocks: [{ _template: 'hero', headline: 'Hi' }] });
    const blocks = await list('Blocks');
    const insertAbove = async () => {
      await userEvent.click(
        within(blocks).getByRole('button', { name: 'Actions for Item 1' })
      );
      await userEvent.click(
        await screen.findByRole('menuitem', { name: /^Insert above/ })
      );
    };
    await insertAbove();
    await within(blocks).findByRole('region', { name: 'Choose a block' });
    await openBlockPicker(blocks);
    expect(within(blocks).queryByRole('region')).toBeNull();
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    await insertAbove();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(
      within(blocks).getByRole('region', { name: 'Choose a block' })
    ).toBeInTheDocument();
  });

  it('closes one field panel when a second Blocks field button is pressed', async () => {
    renderPage();
    await openBlockPicker(await list('Blocks'));
    await openBlockPicker(await list('Broken'));
    await waitFor(() => expect(screen.getAllByRole('dialog')).toHaveLength(1));
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
