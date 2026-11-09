import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import type { DocumentEntry } from '../core/content/contract';
import { definePlugin } from '../core/plugin';
import type { TinaDocument } from '../core/schema/types';
import { useFormStore } from '../form/form-store';
import { t } from '../index';
import { required } from '../plugins/fields';
import arrayFieldPlugin from '../plugins/fields/array/array-field.plugin';
import objectFieldPlugin from '../plugins/fields/object/object-field.plugin';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import coreValidatorsPlugin from '../plugins/validators/core-validators.plugin';
import { TinaAdmin } from './admin';

const PATH = 'content/notes/one.mdx';
const saved: TinaDocument[] = [];
let document: TinaDocument;

const contentPlugin = definePlugin({
  name: 'test:content',
  provides: ['content'],
  client: async () => ({
    default: {
      slice: () => ({
        local: true,
        list: async () => [{ path: PATH }],
        get: async (): Promise<DocumentEntry> => ({ path: PATH, document }),
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
    stringFieldPlugin,
    objectFieldPlugin,
    arrayFieldPlugin,
    coreValidatorsPlugin,
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
        ],
      },
    ],
  },
});

const renderAdmin = () =>
  render(
    <TinaAdmin
      config={config}
      queryClient={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    />
  );

beforeEach(() => {
  saved.length = 0;
  document = {
    title: 'Hello',
    seo: { metaTitle: 'Meta' },
    items: [{ heading: 'A' }, { heading: 'B' }, { heading: 'C' }],
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
  screen.findByRole('button', { name: /^(Save|Resolve)/ });
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
