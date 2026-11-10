import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../config';
import { toFieldAddress } from '../core/field/address';
import type {
  CollectionSchema,
  FieldSchema,
  TinaDocument,
} from '../core/schema/types';
import { FormProvider, TinaProvider, useActiveField } from '../editor';
import { t } from '../index';
import arrayFieldPlugin from '../plugins/fields/array/array-field.plugin';
import objectFieldPlugin from '../plugins/fields/object/object-field.plugin';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import { DocumentForm } from './document-form';

type Lock = 'readOnly' | 'disabled';
const LOCKS: Lock[] = ['readOnly', 'disabled'];

const isLocked = (input: HTMLElement, lock: Lock) =>
  lock === 'readOnly'
    ? input.hasAttribute('readonly')
    : input.hasAttribute('disabled');

function Activate({ address }: { address: string }) {
  const { setActive } = useActiveField();
  return (
    <button type='button' onClick={() => setActive(toFieldAddress(address))}>
      preview
    </button>
  );
}

const renderLevel = (
  fields: FieldSchema[],
  document: TinaDocument,
  previewAddress?: string
) => {
  const collection: CollectionSchema = {
    name: 'page',
    label: 'Pages',
    format: 'mdx',
    fields,
  };
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [objectFieldPlugin, arrayFieldPlugin, stringFieldPlugin],
        schema: { collections: [] },
      })}
    >
      <FormProvider
        collection={collection}
        path='content/pages/home.mdx'
        document={document}
      >
        <DocumentForm />
        {previewAddress ? <Activate address={previewAddress} /> : null}
      </FormProvider>
    </TinaProvider>
  );
};

const links = (state: Partial<Record<Lock, true>>) =>
  t.array({
    name: 'links',
    label: 'Links',
    ...state,
    fields: [t.string({ name: 'label', label: 'Link label' })],
  });

const linkDocument = { label: 'stored' };

describe.each(LOCKS)('a form level opened under a %s field', (lock) => {
  const state = { [lock]: true } as const;

  it('locks an object that drills in under a locked object', async () => {
    const user = userEvent.setup();
    renderLevel(
      [
        t.object({
          name: 'one',
          label: 'One',
          ...state,
          fields: [
            t.object({
              name: 'two',
              label: 'Two',
              fields: [
                t.object({
                  name: 'three',
                  label: 'Three',
                  fields: [t.string({ name: 'handle', label: 'Handle' })],
                }),
              ],
            }),
          ],
        }),
      ],
      { one: { two: { three: { handle: 'hi' } } } },
      'one.two.three.handle'
    );
    await user.click(await screen.findByRole('button', { name: 'preview' }));
    expect(isLocked(await screen.findByLabelText(/^Handle\b/), lock)).toBe(
      true
    );
  });

  it('locks a list item opened from the preview under a locked list', async () => {
    const user = userEvent.setup();
    renderLevel(
      [
        t.array({
          name: 'sections',
          label: 'Sections',
          ...state,
          fields: [links({})],
        }),
      ],
      { sections: [{ links: [linkDocument] }] },
      'sections.0.links.0.label'
    );
    await user.click(await screen.findByRole('button', { name: 'preview' }));
    expect(isLocked(await screen.findByLabelText(/^Link label\b/), lock)).toBe(
      true
    );
  });

  it('locks a list item of a locked list inside a plain object', async () => {
    const user = userEvent.setup();
    renderLevel(
      [
        t.object({
          name: 'wrap',
          label: 'Wrap',
          fields: [links(state)],
        }),
      ],
      { wrap: { links: [linkDocument] } },
      'wrap.links.0.label'
    );
    await user.click(await screen.findByRole('button', { name: 'preview' }));
    expect(isLocked(await screen.findByLabelText(/^Link label\b/), lock)).toBe(
      true
    );
  });

  it('keeps the same list item editable when nothing above it is locked', async () => {
    const user = userEvent.setup();
    renderLevel(
      [
        t.object({
          name: 'wrap',
          label: 'Wrap',
          fields: [links({})],
        }),
      ],
      { wrap: { links: [linkDocument] } },
      'wrap.links.0.label'
    );
    await user.click(await screen.findByRole('button', { name: 'preview' }));
    expect(isLocked(await screen.findByLabelText(/^Link label\b/), lock)).toBe(
      false
    );
  });
});

describe('a locked list item opened by clicking its card', () => {
  it('stays read-only', async () => {
    const user = userEvent.setup();
    renderLevel(
      [
        t.array({
          name: 'sections',
          label: 'Sections',
          readOnly: true,
          fields: [links({})],
        }),
      ],
      { sections: [{ links: [linkDocument] }] }
    );
    await user.click(await screen.findByRole('button', { name: /^Item 1:/ }));
    const cards = await screen.findAllByRole('button', { name: /^Item 1:/ });
    await user.click(cards[cards.length - 1]);
    expect(await screen.findByLabelText(/^Link label\b/)).toHaveAttribute(
      'readonly'
    );
  });
});
