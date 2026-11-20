import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../config';
import { ContentError } from '../core/content/contract';
import { toFieldAddress } from '../core/field/address';
import type { CollectionSchema } from '../core/schema/types';
import {
  isEdited,
  toDocument,
  toFormId,
  useFormStore,
} from '../form/form-store';
import { t } from '../index';
import arrayFieldPlugin from '../plugins/fields/array/array-field.plugin';
import objectFieldPlugin from '../plugins/fields/object/object-field.plugin';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import coreValidatorsPlugin from '../plugins/validators/core-validators.plugin';
import { LabelledFields } from '../test/labelled-fields';
import { FormProvider, TinaProvider, useFormSave } from './index';

const PATH = 'content/posts/list.mdx';

const collection: CollectionSchema = {
  name: 'post',
  format: 'mdx',
  fields: [
    t.string({ name: 'title', label: 'Title' }),
    t.string({ name: 'note', label: 'Note' }),
    t.array({
      name: 'authors',
      label: 'Authors',
      fields: [
        t.string({ name: 'name', label: 'Name' }),
        t.string({ name: 'alias', label: 'Alias' }),
      ],
    }),
  ],
};

function SaveButton() {
  const save = useFormSave();
  return (
    <button type='button' onClick={() => save().catch(() => {})}>
      save
    </button>
  );
}

const errorAddresses = () => {
  const form = useFormStore.getState().forms[toFormId(PATH)];
  return Object.entries(isEdited(form) ? form.errors : {})
    .filter(([, messages]) => messages && messages.length > 0)
    .map(([address]) => address)
    .sort();
};

const REFUSED = ['authors.1.alias', 'title'];

const refusal = () =>
  new ContentError('validation', undefined, {
    [toFieldAddress('authors.1.alias')]: ['Alias is taken'],
    [toFieldAddress('title')]: ['Title is taken'],
  });

const refuse = async (): Promise<void> => {
  throw refusal();
};

const renderAuthors = (onSave: () => Promise<void> = refuse) =>
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
        path={PATH}
        document={{
          title: 'Hi',
          note: '',
          authors: [
            { name: 'n0', alias: 'a' },
            { name: 'n1', alias: 'b' },
            { name: 'n2', alias: 'c' },
          ],
        }}
        onSave={onSave}
      >
        <LabelledFields />
        <SaveButton />
      </FormProvider>
    </TinaProvider>
  );

// Edits the third author so the form is dirty, saves, and waits for the refusal.
const refused = async () => {
  renderAuthors();
  await userEvent.click(
    await screen.findByRole('button', { name: /^Item 3:/ })
  );
  await userEvent.type(
    await screen.findByRole('textbox', { name: /^Alias\b/ }),
    'x'
  );
  await userEvent.click(await screen.findByText('save'));
  await waitFor(() =>
    expect(errorAddresses()).toEqual(expect.arrayContaining(REFUSED))
  );
};

const shownMessages = () =>
  screen
    .queryAllByRole('alert')
    .filter((alert) => /is taken/.test(alert.textContent ?? ''));

const openItem = async (index: number) =>
  userEvent.click(
    await screen.findByRole('button', { name: new RegExp(`^Item ${index}:`) })
  );

const menuAction = async (action: RegExp) => {
  const group = await screen.findByRole('group', { name: 'Authors' });
  const trigger = group.querySelector<HTMLElement>(
    '[aria-label^="Actions for"]'
  );
  await userEvent.click(trigger as HTMLElement);
  await userEvent.click(await screen.findByRole('menuitem', { name: action }));
};

describe('server messages on a form: they hold, then all end together', () => {
  it('shows on the refused item only', async () => {
    await refused();
    expect(errorAddresses()).not.toContain('authors.0.alias');
    expect(errorAddresses()).not.toContain('authors.2.alias');
  });

  it.each([
    [
      'an unrefused field',
      async () => {
        await userEvent.type(await screen.findByLabelText(/^Note\b/), 'x');
      },
    ],
    [
      'the refused field',
      async () => {
        await userEvent.type(await screen.findByLabelText(/^Title\b/), 'x');
      },
    ],
    [
      'a sibling of the refused field',
      async () => {
        await openItem(2);
        const names = await screen.findAllByRole('textbox', {
          name: /^Name\b/,
        });
        await userEvent.type(names[1], 'x');
      },
    ],
    ['removing another item', async () => menuAction(/^Remove/)],
    ['duplicating an item', async () => menuAction(/^Duplicate/)],
  ])('ends every message on a change: %s', async (_name, change) => {
    await refused();
    await change();
    await waitFor(() => expect(errorAddresses()).toEqual([]));
    expect(shownMessages()).toHaveLength(0);
  });

  it('ends every message once an edit is typed back to the old value, and does not bring them back', async () => {
    await refused();
    const note = await screen.findByLabelText(/^Note\b/);
    await userEvent.type(note, 'x');
    await waitFor(() => expect(errorAddresses()).toEqual([]));
    await userEvent.type(note, '{Backspace}');
    expect(errorAddresses()).toEqual([]);
  });

  it('keeps every message when a field is only focused', async () => {
    await refused();
    await userEvent.click(await screen.findByLabelText(/^Note\b/));
    await userEvent.tab();
    expect(errorAddresses()).toEqual(expect.arrayContaining(REFUSED));
  });

  it('shows no message for a list that changed while the save ran', async () => {
    let answer: () => void = () => {};
    renderAuthors(
      () =>
        new Promise<void>((_resolve, reject) => {
          answer = () => reject(refusal());
        })
    );
    await openItem(3);
    await userEvent.type(
      await screen.findByRole('textbox', { name: /^Alias\b/ }),
      'x'
    );
    await userEvent.click(await screen.findByText('save'));
    await waitFor(() => expect(answer).not.toBe(undefined));
    await menuAction(/^Remove/);
    await waitFor(() =>
      expect(
        toDocument(useFormStore.getState().forms[toFormId(PATH)]?.values ?? {})
          .authors
      ).toHaveLength(2)
    );
    answer();
    await waitFor(() =>
      expect(Object.values(useFormStore.getState().saves).at(0)).toMatchObject({
        phase: 'failed',
      })
    );
    // Authors moved up, so `authors.1.alias` now holds another item. Only the title still judges the sent value.
    expect(errorAddresses()).not.toContain('authors.1.alias');
    expect(errorAddresses()).not.toContain('authors.0.alias');
  });
});
