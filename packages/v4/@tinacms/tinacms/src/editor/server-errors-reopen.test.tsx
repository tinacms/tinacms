import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../config';
import { ContentError } from '../core/content/contract';
import { definePlugin, resolveClientSegments } from '../core/plugin';
import { createValidatorRegistry } from '../core/validator/registry';
import { toFieldAddress } from '../core/field/address';
import { resolveFieldPlugins } from '../core/field/registry';
import type { CollectionSchema } from '../core/schema/types';
import { isEdited, toFormId, useFormStore } from '../form/form-store';
import { t } from '../index';
import arrayFieldPlugin from '../plugins/fields/array/array-field.plugin';
import objectFieldPlugin from '../plugins/fields/object/object-field.plugin';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import coreValidatorsPlugin from '../plugins/validators/core-validators.plugin';
import { LabelledFields } from '../test/labelled-fields';
import { FormProvider, TinaProvider } from './index';
import { saveDocument } from './save-pipeline';

const PATH = 'content/posts/reopen.mdx';
// A rule that reads siblings is not self-contained, so the form re-validates its field on any change.
const siblingRule = definePlugin({
  name: 'test:validators',
  provides: ['validator'],
  validators: ['acme.passes'],
  client: async () => ({
    default: { validators: { 'acme.passes': () => () => null } },
  }),
});

const PLUGINS = [
  siblingRule,
  arrayFieldPlugin,
  objectFieldPlugin,
  stringFieldPlugin,
  coreValidatorsPlugin,
];

const collection: CollectionSchema = {
  name: 'post',
  format: 'mdx',
  fields: [
    t.string({
      name: 'title',
      label: 'Title',
      validators: [{ name: 'acme.passes' }],
    }),
    t.array({
      name: 'authors',
      label: 'Authors',
      fields: [
        t.string({
          name: 'alias',
          label: 'Alias',
          validators: [{ name: 'acme.passes' }],
        }),
      ],
    }),
  ],
};

const document = { title: 'Hi', authors: [{ alias: 'a' }, { alias: 'b' }] };

const mount = () =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: PLUGINS,
        schema: { collections: [] },
      })}
    >
      <FormProvider
        collection={collection}
        path={PATH}
        document={document}
        onSave={async () => {}}
      >
        <LabelledFields />
      </FormProvider>
    </TinaProvider>
  );

const storeErrors = () => {
  const form = useFormStore.getState().forms[toFormId(PATH)];
  return isEdited(form) ? Object.keys(form.errors).sort() : [];
};

const refuseWhileClosed = async (address: string) => {
  const registry = await resolveFieldPlugins(PLUGINS);
  await saveDocument(
    {
      formId: toFormId(PATH),
      path: PATH,
      collection,
      hooks: [],
      registry,
      validators: createValidatorRegistry(await resolveClientSegments(PLUGINS)),
    },
    () => undefined,
    {
      write: async () => {
        throw new ContentError('validation', undefined, {
          [toFieldAddress(address)]: ['Server says no'],
        });
      },
    }
  ).catch(() => {});
};

describe('server messages for a form that was closed during Save all', () => {
  it.each([
    ['a top-level field', 'title'],
    ['a field of a list item', 'authors.1.alias'],
  ])('shows %s when the form opens again', async (_name, address) => {
    const first = mount();
    await userEvent.type(await screen.findByLabelText(/^Title\b/), '!');
    first.unmount();

    await refuseWhileClosed(address);
    expect(storeErrors()).toContain(address);

    mount();
    if (address.startsWith('authors')) {
      await userEvent.click(
        await screen.findByRole('button', { name: /^Item 2:/ })
      );
    }
    await waitFor(() =>
      expect(
        screen
          .getAllByRole('alert')
          .some((alert) => /Server says no/.test(alert.textContent ?? ''))
      ).toBe(true)
    );
    expect(storeErrors()).toContain(address);

    // The first change to any value ends every message of a reopened form too.
    await userEvent.type(await screen.findByLabelText(/^Title\b/), '?');
    await waitFor(() => expect(storeErrors()).toEqual([]));
    expect(
      screen
        .queryAllByRole('alert')
        .some((alert) => /Server says no/.test(alert.textContent ?? ''))
    ).toBe(false);
  });
});
