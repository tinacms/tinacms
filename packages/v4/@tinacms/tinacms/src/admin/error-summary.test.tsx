import { QueryClient } from '@tanstack/react-query';
import {
  act,
  configure,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineClientPlugin } from '../client';
import { asResolvedConfig } from '../config';
import type { DocumentEntry } from '../core/content/contract';
import { definePlugin } from '../core/plugin';
import type { TinaDocument } from '../core/schema/types';
import { draftKey } from '../form/drafts';
import { toFormId, useFormStore } from '../form/form-store';
import { t } from '../index';
import { min, required } from '../plugins/fields';
import arrayFieldPlugin from '../plugins/fields/array/array-field.plugin';
import numberFieldPlugin from '../plugins/fields/number/number-field.plugin';
import objectFieldPlugin from '../plugins/fields/object/object-field.plugin';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import homePlugin from '../plugins/home/home.plugin';
import coreValidatorsPlugin from '../plugins/validators/core-validators.plugin';
import { TinaAdmin } from './admin';

// Each test drives the whole admin, so a loaded machine needs longer than the defaults.
configure({ asyncUtilTimeout: 4000 });
vi.setConfig({ testTimeout: 20_000 });

const PATH = 'content/notes/one.mdx';
const OTHER = 'content/notes/two.mdx';
const saved: TinaDocument[] = [];
let document: TinaDocument;
const OTHER_DOCUMENT: TinaDocument = {
  title: 'Two',
  seo: { metaTitle: 'Meta' },
  items: [{ heading: 'A' }],
};

const codeIsOk = definePlugin({
  name: 'test:code-is-ok',
  provides: ['validator'],
  validators: ['codeIsOk'],
  client: async () => ({
    default: defineClientPlugin({
      validators: {
        codeIsOk: () => (value) =>
          typeof value === 'object' &&
          value !== null &&
          'code' in value &&
          value.code === 'ok'
            ? null
            : 'Code must be ok.',
      },
    }),
  }),
});

const contentPlugin = definePlugin({
  name: 'test:content',
  provides: ['content'],
  client: async () => ({
    default: {
      slice: () => ({
        local: true,
        list: async () => [{ path: PATH }, { path: OTHER }],
        get: async (
          _collection: string,
          path: string
        ): Promise<DocumentEntry> => ({
          path,
          document: path === OTHER ? OTHER_DOCUMENT : document,
        }),
        update: async (
          _collection: string,
          path: string,
          value: TinaDocument
        ) => {
          saved.push(value);
          return { path, document: value };
        },
      }),
    },
  }),
});

const config = asResolvedConfig({
  plugins: [
    contentPlugin,
    codeIsOk,
    stringFieldPlugin,
    objectFieldPlugin,
    arrayFieldPlugin,
    numberFieldPlugin,
    coreValidatorsPlugin,
    homePlugin,
  ],
  schema: {
    collections: [
      {
        name: 'note',
        label: 'Notes',
        path: 'content/notes',
        format: 'mdx',
        fields: [
          t.string({ name: 'title', label: 'Title', validators: [required()] }),
          t.object({
            name: 'seo',
            label: 'SEO',
            fields: [
              t.string({
                name: 'metaTitle',
                label: 'Meta title',
                validators: [required()],
              }),
            ],
          }),
          t.array({
            name: 'items',
            label: 'Items',
            fields: [
              t.string({
                name: 'heading',
                label: 'Heading',
                validators: [required()],
              }),
            ],
          }),
          t.object({
            name: 'outer',
            label: 'Outer',
            fields: [
              t.object({
                name: 'inner',
                label: 'Inner',
                fields: [
                  t.string({
                    name: 'leaf',
                    label: 'Leaf',
                    validators: [required()],
                  }),
                ],
              }),
            ],
          }),
          t.array({
            name: 'blocks',
            label: 'Blocks',
            templates: [
              {
                name: 'hero',
                label: 'Hero',
                fields: [
                  t.string({
                    name: 'headline',
                    label: 'Headline',
                    validators: [required()],
                  }),
                ],
              },
            ],
          }),
          t.array({
            name: 'cards',
            label: 'Cards',
            fields: ['a', 'b', 'c'].map((name) =>
              t.string({
                name,
                label: `Part ${name}`,
                validators: [required()],
              })
            ),
          }),
          t.array({
            name: 'scores',
            label: 'Scores',
            of: t.number({
              name: 'score',
              label: 'Score',
              validators: [required()],
            }),
          }),
          t.array({
            name: 'panel',
            label: 'Panel',
            validators: [min(2, 'Add at least 2 panels.')],
            fields: [
              t.string({
                name: 'title',
                label: 'Panel title',
                validators: [required()],
              }),
            ],
          }),
          t.object({
            name: 'profile',
            label: 'Profile',
            validators: [{ name: 'codeIsOk', args: [] }],
            fields: [
              t.string({
                name: 'handle',
                label: 'Handle',
                validators: [required()],
              }),
              t.string({ name: 'code', label: 'Code' }),
            ],
          }),
          t.string({
            name: 'quiet',
            label: 'Quiet',
            validators: [required(' ')],
          }),
        ],
      },
    ],
  },
});

const renderAdmin = (preview?: React.ReactNode) =>
  render(
    <TinaAdmin
      config={config}
      queryClient={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
      preview={preview}
    />
  );

beforeEach(() => {
  saved.length = 0;
  document = {
    title: 'Hello',
    seo: { metaTitle: 'Meta' },
    items: [{ heading: 'A' }, { heading: 'B' }, { heading: 'C' }],
    outer: { inner: { leaf: 'x' } },
    blocks: [],
    cards: [{ a: 'x', b: 'x', c: 'x' }],
    scores: [1, 2],
    panel: [{ title: 'x' }, { title: 'y' }],
    profile: { handle: 'h', code: 'ok' },
    quiet: 'x',
  };
  window.location.hash = `#/collections/note/${encodeURIComponent(PATH)}`;
  useFormStore.setState({ forms: {} });
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

const titleInput = () => screen.findByLabelText(/^Title\b/);
const saveButton = () =>
  screen.findByRole('button', { name: /^(Save$|Resolve)/ });
const errorsPane = () =>
  screen.findByRole('complementary', { name: /^Errors/ });
const rowsOf = (pane: HTMLElement) =>
  within(pane).getAllByRole('button', { name: /\. / });
const assertive = () =>
  globalThis.document.querySelector(
    '[data-slot=error-blocked-announcement]'
  ) as HTMLElement;

// Two required fields sit empty in cards the editor never opens. A change to the title makes the form dirty.
async function blockOnTwoFields() {
  document = {
    ...document,
    seo: { metaTitle: '' },
    items: [{ heading: '' }, { heading: 'B' }, { heading: 'C' }],
  };
  const user = userEvent.setup();
  renderAdmin();
  await user.type(await titleInput(), '!');
  await user.click(await saveButton());
  return user;
}

// Presses a row, then types into the field it landed on.
async function fixFieldOf(
  user: ReturnType<typeof userEvent.setup>,
  rowName: RegExp
) {
  const pane = await errorsPane();
  await user.click(within(pane).getByRole('button', { name: rowName }));
  await waitFor(() =>
    expect(globalThis.document.activeElement?.tagName).toBe('INPUT')
  );
  await user.keyboard('Fixed');
}

describe('a Save that finds invalid fields', () => {
  it('writes nothing and turns Save into Resolve N errors, kept in focus', async () => {
    await blockOnTwoFields();
    const resolve = await screen.findByRole('button', {
      name: 'Resolve 2 errors',
    });
    expect(resolve).toBeEnabled();
    expect(resolve).toHaveFocus();
    expect(saved).toHaveLength(0);
    expect(globalThis.document.querySelector('[data-slot=toast]')).toBeNull();
    await waitFor(() =>
      expect(assertive()).toHaveTextContent(
        "Can't save. 2 errors. Error summary pane opened. Save is now Resolve 2 errors."
      )
    );
  });

  it('lists each failing field in document order with where it sits, on the first press', async () => {
    await blockOnTwoFields();
    const rows = rowsOf(await errorsPane());
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveAccessibleName(/^Meta title, in SEO\. /);
    expect(rows[1]).toHaveAccessibleName(/^Heading, in Items › Item 1/);
  });

  it('goes to a row’s field in a closed card, marks it Viewing and keeps the pane open', async () => {
    const user = await blockOnTwoFields();
    const pane = await errorsPane();
    const rows = rowsOf(pane);
    await user.click(rows[1] as HTMLElement);
    await waitFor(() =>
      expect(globalThis.document.activeElement).toHaveAccessibleName(
        /^Heading\b/
      )
    );
    expect(rows[1]).toHaveAttribute('aria-current', 'true');
    expect(rows[1]).toHaveTextContent('Viewing');
    expect(pane).toBeVisible();
  });

  it('steps to the next error from Resolve and wraps around', async () => {
    const user = await blockOnTwoFields();
    const resolve = await screen.findByRole('button', {
      name: 'Resolve 2 errors',
    });
    await user.click(resolve);
    await waitFor(() =>
      expect(globalThis.document.activeElement).toHaveAccessibleName(
        /^Meta title\b/
      )
    );
    await user.click(resolve);
    await waitFor(() =>
      expect(globalThis.document.activeElement).toHaveAccessibleName(
        /^Heading\b/
      )
    );
    await user.click(resolve);
    await waitFor(() =>
      expect(globalThis.document.activeElement).toHaveAccessibleName(
        /^Meta title\b/
      )
    );
  });

  it('drops a row as its field is fixed, and a field broken afterwards stays out', async () => {
    const user = await blockOnTwoFields();
    await fixFieldOf(user, /^Meta title/);
    expect(
      await screen.findByRole('button', { name: 'Resolve 1 error' })
    ).toBeVisible();
    await user.clear(await titleInput());
    await waitFor(async () =>
      expect(rowsOf(await errorsPane())).toHaveLength(1)
    );
    expect(
      screen.getByRole('button', { name: 'Resolve 1 error' })
    ).toBeVisible();
  });

  it('turns back into Save when the last error is fixed, and then saves', async () => {
    const user = await blockOnTwoFields();
    await fixFieldOf(user, /^Meta title/);
    await fixFieldOf(user, /^Heading/);
    const save = await screen.findByRole('button', { name: 'Save' });
    expect(save).toBeEnabled();
    await waitFor(() =>
      expect(
        screen.queryByRole('complementary', { name: /^Errors/ })
      ).toBeNull()
    );
    await user.click(save);
    await waitFor(() => expect(saved).toHaveLength(1));
  });

  it('lists a list’s own error once its failing item is fixed, instead of saying all fixed', async () => {
    document = { ...document, panel: [{ title: '' }] };
    const user = userEvent.setup();
    renderAdmin();
    await user.type(await titleInput(), '!');
    await user.click(await saveButton());
    expect(
      await screen.findByRole('button', { name: 'Resolve 1 error' })
    ).toBeVisible();
    await fixFieldOf(user, /^Panel title/);
    const pane = await errorsPane();
    await waitFor(() =>
      expect(
        within(pane).getByRole('button', { name: /^Panel\b/ })
      ).toBeVisible()
    );
    expect(within(pane).getByText('Add at least 2 panels.')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Resolve 1 error' })
    ).toBeVisible();
    expect(
      globalThis.document.querySelector('[data-slot=error-announcement]')
        ?.textContent
    ).toBe('Panel title fixed. 1 error left.');
  });

  it('lists an object’s own error once its failing child is fixed, then plays All fixed when the object is fixed', async () => {
    const release = holdAnimations();
    try {
      document = { ...document, profile: { handle: '', code: 'bad' } };
      const user = userEvent.setup();
      renderAdmin();
      await user.type(await titleInput(), '!');
      await user.click(await saveButton());
      expect(
        await screen.findByRole('button', { name: 'Resolve 1 error' })
      ).toBeVisible();
      await fixFieldOf(user, /^Handle/);
      const pane = await errorsPane();
      await waitFor(() =>
        expect(
          within(pane).getByRole('button', { name: /^Profile\b/ })
        ).toBeVisible()
      );
      expect(within(pane).getByText('Code must be ok.')).toBeVisible();
      expect(
        screen.getByRole('button', { name: 'Resolve 1 error' })
      ).toBeVisible();
      expect(
        globalThis.document.querySelector('[data-slot=error-announcement]')
          ?.textContent
      ).toBe('Handle fixed. 1 error left.');
      const code = await screen.findByLabelText(/^Code\b/);
      await user.clear(code);
      await user.type(code, 'ok');
      expect(await screen.findByText('All fixed.')).toBeVisible();
      expect(await screen.findByRole('button', { name: 'Save' })).toBeEnabled();
    } finally {
      release();
    }
  });

  it('tucks the pane on Esc, shows an edge tab and brings the pane back from it', async () => {
    const user = await blockOnTwoFields();
    await errorsPane();
    await user.keyboard('{Escape}');
    const tab = await screen.findByRole('button', { name: 'Show errors, 2' });
    await waitFor(() =>
      expect(
        screen.queryByRole('complementary', { name: /^Errors/ })
      ).toBeNull()
    );
    await user.click(tab);
    const pane = await errorsPane();
    await waitFor(() => expect(rowsOf(pane)[0]).toHaveFocus());
  });

  it('leaves the pane open when Esc closes an open menu', async () => {
    const user = await blockOnTwoFields();
    await errorsPane();
    await user.click(screen.getByRole('button', { name: 'Document actions' }));
    await screen.findByRole('menu');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(await errorsPane()).toBeVisible();
  });

  it('opens a tucked pane after a 300ms hover on the right edge', async () => {
    const user = await blockOnTwoFields();
    await errorsPane();
    await user.keyboard('{Escape}');
    await screen.findByRole('button', { name: 'Show errors, 2' });
    const zone = globalThis.document.querySelector(
      '[data-slot=error-edge-hover]'
    );
    expect(zone).not.toBeNull();
    await user.hover(zone as Element);
    expect(await errorsPane()).toBeVisible();
  });

  it('remembers Pin for the next visit', async () => {
    const user = await blockOnTwoFields();
    const pane = await errorsPane();
    await user.click(within(pane).getByRole('button', { name: 'Pin' }));
    expect(
      within(pane).getByRole('button', { name: 'Pinned' })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(localStorage.getItem('tina.errorPane.pinned')).toBe('true');
  });

  it('keeps pinning for the session when storage throws', async () => {
    const user = await blockOnTwoFields();
    const pane = await errorsPane();
    const setItem = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('blocked');
      });
    await user.click(within(pane).getByRole('button', { name: 'Pin' }));
    expect(
      within(pane).getByRole('button', { name: 'Pinned' })
    ).toHaveAttribute('aria-pressed', 'true');
    setItem.mockRestore();
  });

  it('follows a moved list item: the row stays viewed, with no fix announced', async () => {
    document = {
      ...document,
      items: [{ heading: 'A' }, { heading: 'B' }, { heading: '' }],
    };
    const user = userEvent.setup();
    renderAdmin();
    await user.type(await titleInput(), '!');
    await user.click(await saveButton());
    const pane = await errorsPane();
    await user.click(
      within(pane).getByRole('button', { name: /^Heading, in Items › Item 3/ })
    );
    await waitFor(() =>
      expect(globalThis.document.activeElement).toHaveAccessibleName(
        /^Heading\b/
      )
    );
    const group = await screen.findByRole('group', { name: 'Items' });
    const trigger = Array.from(
      group.querySelectorAll<HTMLElement>('[aria-label^="Actions for"]')
    )[2] as HTMLElement;
    await user.click(trigger);
    await user.click(await screen.findByRole('menuitem', { name: /^Move up/ }));
    await waitFor(() =>
      expect(
        within(pane).getByRole('button', {
          name: /^Heading, in Items › Item 2/,
        })
      ).toHaveAttribute('aria-current', 'true')
    );
    expect(
      screen.getByRole('button', { name: 'Resolve 1 error' })
    ).toBeVisible();
  });

  it('counts a row as fixed when the list item that held its error is removed', async () => {
    const user = await blockOnTwoFields();
    await errorsPane();
    await user.click(
      within(await errorsPane()).getByRole('button', { name: /^Heading/ })
    );
    const group = await screen.findByRole('group', { name: 'Items' });
    const trigger = group.querySelector<HTMLElement>(
      '[aria-label^="Actions for"]'
    ) as HTMLElement;
    await user.click(trigger);
    await user.click(await screen.findByRole('menuitem', { name: /^Remove/ }));
    expect(
      await screen.findByRole('button', { name: 'Resolve 1 error' })
    ).toBeVisible();
    expect(rowsOf(await errorsPane())).toHaveLength(1);
  });

  it('shows no Resolve on another screen', async () => {
    const user = await blockOnTwoFields();
    await errorsPane();
    await user.click(screen.getByRole('button', { name: 'Home' }));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /^Resolve/ })).toBeNull()
    );
    expect(screen.queryByRole('complementary', { name: /^Errors/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Show errors/ })).toBeNull();
  });

  it('shows no error summary after discarding the edits', async () => {
    const user = await blockOnTwoFields();
    await errorsPane();
    await user.click(screen.getByRole('button', { name: 'Document actions' }));
    await user.click(
      await screen.findByRole('menuitem', { name: 'Discard unsaved edits' })
    );
    await user.click(await screen.findByRole('button', { name: /^Discard/ }));
    const save = await screen.findByRole('button', { name: 'Save' });
    expect(save).toBeDisabled();
    expect(screen.queryByRole('complementary', { name: /^Errors/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Show errors/ })).toBeNull();
  });
});

const rowNamed = async (name: RegExp) =>
  within(await errorsPane()).getByRole('button', { name });
const focusedName = () => globalThis.document.activeElement;

// A stand-in for the Web Animations API that never finishes, so a hold lasts as long as the test needs.
const holdAnimations = () => {
  const original = Element.prototype.animate;
  Element.prototype.animate = (() => ({
    addEventListener: () => {},
    cancel: () => {},
    pause: () => {},
    play: () => {},
  })) as unknown as typeof Element.prototype.animate;
  return () => {
    Element.prototype.animate = original;
  };
};

// Every text a live region held, in order.
// Watches the body, not the node: a form remount replaces the region and would leave a node-bound observer silent.
const watchRegion = (slot: string) => {
  const texts: string[] = [];
  const inRegion = (node: Node) => {
    const element = node instanceof Element ? node : node.parentElement;
    return element?.closest(`[data-slot=${slot}]`) != null;
  };
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (!inRegion(record.target)) continue;
      if (record.type === 'characterData') {
        texts.push(record.target.textContent ?? '');
      } else if (record.addedNodes.length > 0) {
        texts.push(
          Array.from(record.addedNodes, (node) => node.textContent ?? '').join(
            ''
          )
        );
      } else {
        texts.push('');
      }
    }
  });
  observer.observe(globalThis.document.body, {
    childList: true,
    characterData: true,
    subtree: true,
  });
  return { texts, stop: () => observer.disconnect() };
};

const holdFrames = () => {
  const queue = new Map<number, FrameRequestCallback>();
  let next = 0;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    next += 1;
    queue.set(next, callback);
    return next;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    queue.delete(id);
  });
  const flush = () =>
    act(async () => {
      const due = Array.from(queue.values());
      queue.clear();
      for (const callback of due) callback(0);
    });
  return { flush, release: () => vi.unstubAllGlobals() };
};

describe('where the pane goes and what it keeps', () => {
  it('lists a required field inside an object inside an object, and opens both to reach it', async () => {
    document = { ...document, outer: { inner: { leaf: '' } } };
    const user = userEvent.setup();
    renderAdmin();
    await user.type(await titleInput(), '!');
    await user.click(await saveButton());
    const row = await rowNamed(/^Leaf, in Outer › Inner\. /);
    await user.click(row);
    await waitFor(() => expect(focusedName()).toHaveAccessibleName(/^Leaf\b/));
  });

  it('lists a required field inside a block that opens as its own level', async () => {
    document = { ...document, blocks: [{ _template: 'hero', headline: '' }] };
    const user = userEvent.setup();
    renderAdmin();
    await user.type(await titleInput(), '!');
    await user.click(await saveButton());
    const row = await rowNamed(/^Headline, in Blocks › /);
    await user.click(row);
    await waitFor(() =>
      expect(focusedName()).toHaveAccessibleName(/^Headline\b/)
    );
  });

  it('reads "Check this field." when a rule gives no words', async () => {
    document = { ...document, quiet: '' };
    const user = userEvent.setup();
    renderAdmin();
    await user.type(await titleInput(), '!');
    await user.click(await saveButton());
    expect(await rowNamed(/^Quiet\. Check this field\.$/)).toBeVisible();
  });

  it('follows the Tab order: Document actions, Resolve, Pin, Close, rows, then the preview', async () => {
    const user = userEvent.setup();
    document = {
      ...document,
      seo: { metaTitle: '' },
      items: [{ heading: '' }, { heading: 'B' }, { heading: 'C' }],
    };
    renderAdmin(<button type='button'>preview control</button>);
    await user.type(await titleInput(), '!');
    await user.click(await saveButton());
    await errorsPane();
    screen.getByRole('button', { name: 'Document actions' }).focus();
    await user.tab();
    expect(screen.getByRole('button', { name: /^Resolve/ })).toHaveFocus();
    await user.tab();
    expect(
      screen.getByRole('separator', { name: 'Resize the form column' })
    ).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Pin' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Close errors' })).toHaveFocus();
    await user.tab();
    expect(focusedName()).toHaveAccessibleName(/^Meta title/);
    await user.tab();
    expect(focusedName()).toHaveAccessibleName(/^Heading/);
    await user.tab();
    expect(
      screen.getByRole('button', { name: 'preview control' })
    ).toHaveFocus();
  });

  it('closes from the Close button and gives focus back to Resolve', async () => {
    const user = await blockOnTwoFields();
    const pane = await errorsPane();
    await user.click(
      within(pane).getByRole('button', { name: 'Close errors' })
    );
    expect(
      await screen.findByRole('button', { name: 'Show errors, 2' })
    ).toBeVisible();
    expect(screen.getByRole('button', { name: /^Resolve/ })).toHaveFocus();
  });

  it('tucks a floating pane on a click in the preview, but not a pinned one', async () => {
    document = { ...document, seo: { metaTitle: '' } };
    const user = userEvent.setup();
    renderAdmin(<p>preview area</p>);
    await user.type(await titleInput(), '!');
    await user.click(await saveButton());
    const pane = await errorsPane();
    await user.click(within(pane).getByRole('button', { name: 'Pin' }));
    await user.click(screen.getByText('preview area'));
    expect(await errorsPane()).toBeVisible();
    await user.click(within(pane).getByRole('button', { name: 'Pinned' }));
    await user.click(screen.getByText('preview area'));
    expect(
      await screen.findByRole('button', { name: 'Show errors, 1' })
    ).toBeVisible();
  });

  it('keeps a row gone once fixed, even when its field breaks again', async () => {
    const user = await blockOnTwoFields();
    await fixFieldOf(user, /^Meta title/);
    await waitFor(async () =>
      expect(rowsOf(await errorsPane())).toHaveLength(1)
    );
    await user.clear(screen.getByLabelText(/^Meta title\b/));
    expect(
      await screen.findByRole('button', { name: 'Resolve 1 error' })
    ).toBeVisible();
    expect(rowsOf(await errorsPane())).toHaveLength(1);
  });

  it('leaves the blocked state when the editor opens another document', async () => {
    const user = await blockOnTwoFields();
    await errorsPane();
    await user.click(
      screen.getByRole('button', { name: 'Return to navigator' })
    );
    await user.click(await screen.findByRole('button', { name: /two\.mdx/ }));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /^Resolve/ })).toBeNull()
    );
    expect(screen.queryByRole('complementary', { name: /^Errors/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Show errors/ })).toBeNull();
    expect(await screen.findByRole('textbox', { name: /^Title/ })).toHaveValue(
      'Two'
    );
  });
});

describe('the All fixed endings', () => {
  it('moves focus to Save when the last error is fixed while a row has focus', async () => {
    const user = await blockOnTwoFields();
    await fixFieldOf(user, /^Meta title/);
    const row = await rowNamed(/^Heading/);
    await user.click(row);
    const input = (await waitFor(() => {
      const found = focusedName();
      expect(found).toHaveAccessibleName(/^Heading\b/);
      return found;
    })) as HTMLInputElement;
    row.focus();
    fireEvent.change(input, { target: { value: 'Fixed' } });
    const save = await screen.findByRole('button', { name: 'Save' });
    await waitFor(() => expect(save).toHaveFocus());
  });

  it('starts a fresh blocked state and says the same words again when a Save blocks during the hold', async () => {
    const release = holdAnimations();
    const frames = holdFrames();
    try {
      const user = await blockOnTwoFields();
      await errorsPane();
      await frames.flush();
      const spoken = watchRegion('error-blocked-announcement');
      await fixFieldOf(user, /^Meta title/);
      await fixFieldOf(user, /^Heading/);
      expect(await screen.findByText('All fixed.')).toBeVisible();
      await user.clear(await titleInput());
      await user.clear(screen.getByLabelText(/^Meta title\b/));
      await user.click(await screen.findByRole('button', { name: 'Save' }));
      expect(
        await screen.findByRole('button', { name: 'Resolve 2 errors' })
      ).toBeVisible();
      expect(screen.queryByText('All fixed.')).toBeNull();
      const pane = await errorsPane();
      expect(
        within(pane)
          .getAllByRole('button', { name: /\. / })
          .some((row) => row.hasAttribute('aria-current'))
      ).toBe(false);
      await waitFor(async () => {
        await frames.flush();
        expect(spoken.texts.filter((text) => text !== '')).toHaveLength(1);
      });
      spoken.stop();
    } finally {
      frames.release();
      release();
    }
  });

  it('announces a repeated blocked Save twice, emptying the region between', async () => {
    const user = userEvent.setup();
    document = { ...document, seo: { metaTitle: '' } };
    renderAdmin();
    await user.type(await titleInput(), '!');
    const spoken = watchRegion('error-blocked-announcement');
    await user.click(await saveButton());
    await fixFieldOf(user, /^Meta title/);
    await user.click(await screen.findByRole('button', { name: 'Save' }));
    await waitFor(() => expect(saved).toHaveLength(1));
    await user.clear(await titleInput());
    await user.click(await screen.findByRole('button', { name: /^Save$/ }));
    await screen.findByRole('button', { name: 'Resolve 1 error' });
    const words = (text: string) => text.includes('Resolve 1 error');
    await waitFor(() => expect(spoken.texts.filter(words)).toHaveLength(2));
    expect(spoken.texts).toContain('');
    spoken.stop();
  });
});

describe('list changes while blocked', () => {
  const chooseAction = async (list: string, item: number, action: RegExp) => {
    const group = await screen.findByRole('group', { name: list });
    const trigger = Array.from(
      group.querySelectorAll<HTMLElement>('[aria-label^="Actions for"]')
    )[item - 1] as HTMLElement;
    await userEvent.click(trigger);
    await userEvent.click(
      await screen.findByRole('menuitem', { name: action })
    );
  };
  const viewItemThree = async () => {
    document = {
      ...document,
      items: [{ heading: 'A' }, { heading: 'B' }, { heading: '' }],
    };
    const user = userEvent.setup();
    renderAdmin();
    await user.type(await titleInput(), '!');
    await user.click(await saveButton());
    await user.click(await rowNamed(/^Heading, in Items › Item 3/));
    await waitFor(() =>
      expect(focusedName()).toHaveAccessibleName(/^Heading\b/)
    );
    return user;
  };

  it('keeps the viewed row on its item when an item is duplicated above it', async () => {
    await viewItemThree();
    await chooseAction('Items', 1, /^Duplicate/);
    const row = await rowNamed(/^Heading, in Items › Item 4/);
    expect(row).toHaveAttribute('aria-current', 'true');
    expect(
      screen.getByRole('button', { name: 'Resolve 1 error' })
    ).toBeVisible();
  });

  it('keeps the viewed row on its item when an item is inserted above it', async () => {
    await viewItemThree();
    await chooseAction('Items', 1, /^Insert above/);
    expect(await rowNamed(/^Heading, in Items › Item 4/)).toHaveAttribute(
      'aria-current',
      'true'
    );
  });

  it('keeps the row when an unrelated item is removed', async () => {
    await viewItemThree();
    await chooseAction('Items', 1, /^Remove/);
    expect(await rowNamed(/^Heading, in Items › Item 2/)).toHaveAttribute(
      'aria-current',
      'true'
    );
    expect(
      screen.getByRole('button', { name: 'Resolve 1 error' })
    ).toBeVisible();
  });

  it('announces once when a removed item held three listed errors', async () => {
    document = {
      ...document,
      seo: { metaTitle: '' },
      cards: [{ a: '', b: '', c: '' }],
    };
    const user = userEvent.setup();
    renderAdmin();
    await user.type(await titleInput(), '!');
    await user.click(await saveButton());
    expect(
      await screen.findByRole('button', { name: 'Resolve 4 errors' })
    ).toBeVisible();
    const spoken = watchRegion('error-announcement');
    await user.click(await rowNamed(/^Part a, in Cards/));
    await chooseAction('Cards', 1, /^Remove/);
    expect(
      await screen.findByRole('button', { name: 'Resolve 1 error' })
    ).toBeVisible();
    const heard = () => [
      ...new Set(spoken.texts.filter((text) => text !== '')),
    ];
    await waitFor(() => expect(heard()).toContain('1 error left.'));
    expect(heard()).toEqual(['1 error left.']);
    spoken.stop();
  });
});

describe('removing a listed item', () => {
  it('does not name an item that nobody fixed', async () => {
    document = {
      ...document,
      items: [{ heading: 'A' }, { heading: '' }, { heading: 'C' }],
      seo: { metaTitle: '' },
    };
    const user = userEvent.setup();
    renderAdmin();
    await user.type(await titleInput(), '!');
    await user.click(await saveButton());
    await screen.findByRole('button', { name: 'Resolve 2 errors' });
    const spoken = watchRegion('error-announcement');
    const group = await screen.findByRole('group', { name: 'Items' });
    const trigger = Array.from(
      group.querySelectorAll<HTMLElement>('[aria-label^="Actions for"]')
    )[1] as HTMLElement;
    await user.click(trigger);
    await user.click(await screen.findByRole('menuitem', { name: /^Remove/ }));
    await waitFor(() => expect(spoken.texts).toContain('1 error left.'));
    expect(spoken.texts.some((text) => /fixed\./.test(text))).toBe(false);
    spoken.stop();
  });
});

describe('a scalar list while blocked', () => {
  const blockWithBadThirdScore = async () => {
    document = { ...document, scores: [1, 2, null] };
    const user = userEvent.setup();
    renderAdmin();
    await user.type(await titleInput(), '!');
    await user.click(await saveButton());
    expect(
      await screen.findByRole('button', { name: 'Resolve 1 error' })
    ).toBeVisible();
    return user;
  };
  const chooseScoreAction = async (item: number, action: RegExp) => {
    const group = await screen.findByRole('group', { name: 'Scores' });
    const trigger = Array.from(
      group.querySelectorAll<HTMLElement>('[aria-label^="Actions for"]')
    )[item - 1] as HTMLElement;
    await userEvent.click(trigger);
    await userEvent.click(
      await screen.findByRole('menuitem', { name: action })
    );
  };

  it('keeps the row on its score when the score moves up', async () => {
    await blockWithBadThirdScore();
    await chooseScoreAction(3, /^Move up/);
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Resolve 1 error' })
      ).toBeVisible()
    );
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
  });

  it('keeps the row when a score above it is removed', async () => {
    await blockWithBadThirdScore();
    await chooseScoreAction(1, /^Remove/);
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Resolve 1 error' })
      ).toBeVisible()
    );
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
  });

  it('keeps the row when a score is inserted above it', async () => {
    await blockWithBadThirdScore();
    await chooseScoreAction(1, /^Insert above/);
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Resolve 1 error' })
      ).toBeVisible()
    );
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
  });
});

describe('a phone-width window', () => {
  it('tucks the pane when a row is pressed, so the field shows', async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(max-width: 1023px)',
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    try {
      const user = await blockOnTwoFields();
      await user.click(await rowNamed(/^Meta title/));
      await waitFor(() =>
        expect(
          screen.queryByRole('complementary', { name: /^Errors/ })
        ).toBeNull()
      );
      expect(
        screen.getByRole('button', { name: 'Show errors, 2' })
      ).toBeVisible();
      await waitFor(() =>
        expect(focusedName()).toHaveAccessibleName(/^Meta title\b/)
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('keeps the pane open on a wide window', async () => {
    const user = await blockOnTwoFields();
    await user.click(await rowNamed(/^Meta title/));
    expect(await errorsPane()).toBeVisible();
  });
});

describe('a stored draft that is resumed while blocked', () => {
  it('ends the blocked state without an All fixed face', async () => {
    localStorage.setItem(
      draftKey(toFormId(PATH)),
      JSON.stringify({
        version: 2,
        values: {
          title: 'Mine',
          seo: { metaTitle: 'Meta' },
          items: [{ heading: 'A' }],
          outer: { inner: { leaf: 'x' } },
          blocks: [],
          cards: [{ a: 'x', b: 'x', c: 'x' }],
          scores: [1, 2],
          quiet: 'x',
        },
        baseline: { title: 'Old' },
      })
    );
    document = { ...document, seo: { metaTitle: '' } };
    const user = userEvent.setup();
    renderAdmin();
    await screen.findByText('Resume your unsaved edits?');
    await user.type(await titleInput(), '!');
    await user.click(await saveButton());
    await screen.findByRole('button', { name: 'Resolve 1 error' });
    await user.click(screen.getByRole('button', { name: 'Resume' }));
    expect(await screen.findByRole('button', { name: 'Save' })).toBeEnabled();
    expect(screen.queryByText('All fixed.')).toBeNull();
    expect(screen.queryByRole('complementary', { name: /^Errors/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Show errors/ })).toBeNull();
  });
});
