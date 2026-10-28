import { render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../config';
import type { CollectionSchema } from '../core/schema/types';
import { toFieldAddress } from '../core/field/address';
import { FormProvider, TinaProvider, useActiveField } from '../editor';
import { t } from '../index';
import { required } from '../plugins/fields';
import arrayFieldPlugin from '../plugins/fields/array/array-field.plugin';
import objectFieldPlugin from '../plugins/fields/object/object-field.plugin';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import coreValidatorsPlugin from '../plugins/validators/core-validators.plugin';
import { DocumentForm } from './document-form';

const collection: CollectionSchema = {
  name: 'page',
  label: 'Pages',
  format: 'mdx',
  fields: [
    t.string({ name: 'title', label: 'Title' }),
    t.object({
      name: 'one',
      label: 'One',
      fields: [
        t.object({
          name: 'two',
          label: 'Two',
          fields: [
            t.object({
              name: 'three',
              label: 'Three',
              fields: [
                t.string({
                  name: 'handle',
                  label: 'Handle',
                  validators: [required()],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
};

const groupCollection: CollectionSchema = {
  name: 'page',
  label: 'Pages',
  format: 'mdx',
  fields: [
    t.object({
      name: 'seo',
      label: 'SEO',
      fields: [
        t.string({ name: 'title', label: 'Title', validators: [required()] }),
        t.string({ name: 'desc', label: 'Desc' }),
      ],
    }),
    t.array({
      name: 'blocks',
      label: 'Blocks',
      fields: [
        t.object({
          name: 'meta',
          label: 'Meta',
          fields: [
            t.object({
              name: 'deep',
              label: 'Deep',
              fields: [t.string({ name: 'note', label: 'Note' })],
            }),
          ],
        }),
      ],
    }),
  ],
};

const renderGroups = () =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [
          objectFieldPlugin,
          arrayFieldPlugin,
          stringFieldPlugin,
          coreValidatorsPlugin,
        ],
        schema: { collections: [] },
      })}
    >
      <FormProvider
        collection={groupCollection}
        path='content/pages/groups.mdx'
        document={{
          seo: { title: '', desc: '' },
          blocks: [{ meta: { deep: { note: 'n' } } }],
        }}
      >
        <DocumentForm />
      </FormProvider>
    </TinaProvider>
  );

const renderForm = (extra?: ReactNode) =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [
          objectFieldPlugin,
          arrayFieldPlugin,
          stringFieldPlugin,
          coreValidatorsPlugin,
        ],
        schema: { collections: [] },
      })}
    >
      <FormProvider
        collection={collection}
        path='content/pages/home.mdx'
        document={{ title: 'Home', one: { two: { three: { handle: 'hi' } } } }}
      >
        <DocumentForm />
        {extra}
      </FormProvider>
    </TinaProvider>
  );

function Activate({ address, name }: { address: string; name: string }) {
  const { setActive } = useActiveField();
  return (
    <button type='button' onClick={() => setActive(toFieldAddress(address))}>
      {name}
    </button>
  );
}

describe('nested form levels', () => {
  it('expands levels 1 and 2 in place and opens level 3 as its own form level', async () => {
    const user = userEvent.setup();
    renderForm();
    expect(await screen.findByText('Two')).toBeVisible();
    expect(screen.queryByLabelText(/^Handle\b/)).toBeNull();
    expect(screen.queryByRole('navigation', { name: 'Field path' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Open Three' }));
    expect(await screen.findByLabelText(/^Handle\b/)).toHaveValue('hi');
    expect(
      screen.getByRole('navigation', { name: 'Field path' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Up to home.mdx' }));
    expect(
      await screen.findByRole('button', { name: 'Open Three' })
    ).toBeVisible();
  });

  it('shows an error under the field once it is left, and a red dot on each trail step above it', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(await screen.findByRole('button', { name: 'Open Three' }));
    const handle = await screen.findByLabelText(/^Handle\b/);
    await user.clear(handle);
    expect(screen.queryByRole('alert')).toBeNull();

    await user.tab();
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0);
    expect(
      screen.getByRole('button', { name: /home\.mdx.*has errors/ })
    ).toBeVisible();
    const trail = screen.getByRole('navigation', { name: 'Field path' });
    expect(
      within(trail).getByText('Three').closest('[aria-current]')
    ).toHaveTextContent(/has errors/);
  });

  it('keeps showing the error of an edited field after a save is tried', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(await screen.findByRole('button', { name: 'Open Three' }));
    await user.clear(await screen.findByLabelText(/^Handle\b/));
    await user.click(
      await screen.findByRole('button', { name: /Up to home\.mdx/ })
    );
    await user.type(await screen.findByLabelText(/^Title\b/), '!');
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(0);
  });

  it('closes an open level when the edits are discarded', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(await screen.findByRole('button', { name: 'Open Three' }));
    await user.type(await screen.findByLabelText(/^Handle\b/), '!');
    expect(
      screen.getByRole('navigation', { name: 'Field path' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Discard' }));
    expect(screen.queryByRole('navigation', { name: 'Field path' })).toBeNull();
    expect(
      await screen.findByRole('button', { name: 'Open Three' })
    ).toBeVisible();
  });

  it('keeps a group quiet about a required child the editor never visited', async () => {
    const user = userEvent.setup();
    renderGroups();
    await user.type(await screen.findByLabelText(/^Desc\b/), 'x');
    await user.tab();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows the exact message of an unvisited required field once a save is tried', async () => {
    const user = userEvent.setup();
    renderGroups();
    await user.type(await screen.findByLabelText(/^Desc\b/), 'x');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    const alerts = await screen.findAllByRole('alert');
    expect(alerts[0]).toHaveTextContent('Title is required');
  });

  it('opens level 3 of an array item as its own form level', async () => {
    const user = userEvent.setup();
    renderGroups();
    await user.click(await screen.findByRole('button', { name: 'Open Deep' }));
    expect(await screen.findByLabelText(/^Note\b/)).toHaveValue('n');
    const trail = screen.getByRole('navigation', { name: 'Field path' });
    expect(within(trail).getByText('Deep')).toBeVisible();
  });

  it('opens the levels on the way to a field activated from the preview', async () => {
    const user = userEvent.setup();
    renderForm(<Activate address='one.two.three.handle' name='preview' />);
    expect(await screen.findByText('Two')).toBeVisible();
    expect(screen.queryByLabelText(/^Handle\b/)).toBeNull();

    await user.click(screen.getByRole('button', { name: 'preview' }));
    expect(await screen.findByLabelText(/^Handle\b/)).toHaveFocus();
  });

  it('closes an open level when a field outside it is activated from the preview', async () => {
    const user = userEvent.setup();
    renderForm(<Activate address='title' name='preview' />);
    await user.click(await screen.findByRole('button', { name: 'Open Three' }));
    expect(await screen.findByLabelText(/^Handle\b/)).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'preview' }));
    expect(await screen.findByLabelText(/^Title\b/)).toHaveFocus();
    expect(screen.queryByLabelText(/^Handle\b/)).toBeNull();
  });
});
