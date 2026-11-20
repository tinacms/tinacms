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
    t.array({
      name: 'authors',
      label: 'Authors',
      fields: [t.string({ name: 'alias', label: 'Alias' })],
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

const renderAuthors = () =>
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
          authors: [{ alias: 'a' }, { alias: 'b' }, { alias: 'c' }],
        }}
        onSave={async () => {
          throw new ContentError('validation', undefined, {
            [toFieldAddress('authors.1.alias')]: ['Alias is taken'],
          });
        }}
      >
        <LabelledFields />
        <SaveButton />
      </FormProvider>
    </TinaProvider>
  );

describe('a server message on a list item', () => {
  it('shows on the refused item only, and never on another item after a remove', async () => {
    renderAuthors();
    await userEvent.click(
      await screen.findByRole('button', { name: /^Item 3:/ })
    );
    await userEvent.type(
      await screen.findByRole('textbox', { name: /^Alias\b/ }),
      'x'
    );
    await userEvent.click(await screen.findByText('save'));
    await waitFor(() => expect(errorAddresses()).toContain('authors.1.alias'));
    expect(errorAddresses()).not.toContain('authors.0.alias');
    expect(errorAddresses()).not.toContain('authors.2.alias');

    const group = await screen.findByRole('group', { name: 'Authors' });
    const first = group.querySelector<HTMLElement>(
      '[aria-label^="Actions for"]'
    );
    await userEvent.click(first as HTMLElement);
    await userEvent.click(
      await screen.findByRole('menuitem', { name: /^Remove/ })
    );
    await waitFor(() =>
      expect(
        toDocument(useFormStore.getState().forms[toFormId(PATH)]?.values ?? {})
          .authors
      ).toHaveLength(2)
    );
    // Item "b" is now at index 0. The message follows it or clears.
    expect(errorAddresses()).not.toContain('authors.1.alias');
    expect(errorAddresses()).not.toContain('authors.2.alias');
  });

  it('survives a list action that re-validates the list while the refused value is unchanged', async () => {
    renderAuthors();
    await userEvent.click(
      await screen.findByRole('button', { name: /^Item 3:/ })
    );
    await userEvent.type(
      await screen.findByRole('textbox', { name: /^Alias\b/ }),
      'x'
    );
    await userEvent.click(await screen.findByText('save'));
    await waitFor(() => expect(errorAddresses()).toContain('authors.1.alias'));

    const group = await screen.findByRole('group', { name: 'Authors' });
    await userEvent.click(
      group.querySelector('[data-slot=add-button]') as HTMLElement
    );
    await waitFor(() =>
      expect(
        toDocument(useFormStore.getState().forms[toFormId(PATH)]?.values ?? {})
          .authors
      ).toHaveLength(4)
    );
    expect(errorAddresses()).toContain('authors.1.alias');
  });
});
