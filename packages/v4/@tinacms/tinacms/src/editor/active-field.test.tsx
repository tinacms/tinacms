import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef } from 'react';
import { describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../config';
import type { CollectionSchema } from '../core/schema/types';
import { useFormStore } from '../form/form-store';
import { t } from '../index';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import {
  Field,
  FormProvider,
  TinaProvider,
  toFieldAddress,
  useActiveField,
} from './index';

const NO_COLLECTIONS = { collections: [] };

const collection: CollectionSchema = {
  name: 'post',
  format: 'mdx',
  fields: [
    t.string({ name: 'title', label: 'Title' }),
    t.string({ name: 'summary', label: 'Summary' }),
  ],
};

function ActivateProbe() {
  const { setActive } = useActiveField();
  return (
    <button type='button' onClick={() => setActive(toFieldAddress('title'))}>
      activate
    </button>
  );
}

function ActiveReadout() {
  const { active } = useActiveField();
  return <span data-testid='active'>{active ?? 'none'}</span>;
}

function ActivationLog({ entries }: { entries: string[] }) {
  const active = useFormStore((state) => state.active);
  const last = useRef<unknown>(null);
  if (active && active !== last.current) {
    last.current = active;
    entries.push(active.address);
  }
  return null;
}

describe('active-field rail', () => {
  it('focuses the field input when its address is activated', async () => {
    render(
      <TinaProvider
        config={asResolvedConfig({
          plugins: [stringFieldPlugin],
          schema: NO_COLLECTIONS,
        })}
      >
        <FormProvider
          collection={collection}
          path='content/posts/active.mdx'
          document={{ title: 'Hi' }}
        >
          <Field address='title' />
          <ActivateProbe />
        </FormProvider>
      </TinaProvider>
    );
    const input = await screen.findByLabelText('title');
    expect(input).not.toHaveFocus();

    await userEvent.click(screen.getByText('activate'));
    expect(input).toHaveFocus();
  });

  it('re-fires focus when the already-active field is activated again', async () => {
    render(
      <TinaProvider
        config={asResolvedConfig({
          plugins: [stringFieldPlugin],
          schema: NO_COLLECTIONS,
        })}
      >
        <FormProvider
          collection={collection}
          path='content/posts/active.mdx'
          document={{ title: 'Hi' }}
        >
          <Field address='title' />
          <ActivateProbe />
        </FormProvider>
      </TinaProvider>
    );
    const input = await screen.findByLabelText('title');
    await userEvent.click(screen.getByText('activate'));
    expect(input).toHaveFocus();

    (input as HTMLInputElement).blur();
    expect(input).not.toHaveFocus();
    await userEvent.click(screen.getByText('activate'));
    expect(input).toHaveFocus();
  });

  it('focus in the form makes the focused field the active field', async () => {
    render(
      <TinaProvider
        config={asResolvedConfig({
          plugins: [stringFieldPlugin],
          schema: NO_COLLECTIONS,
        })}
      >
        <FormProvider
          collection={collection}
          path='content/posts/active.mdx'
          document={{ title: 'Hi', summary: 'There' }}
        >
          <Field address='title' />
          <Field address='summary' />
          <ActiveReadout />
        </FormProvider>
      </TinaProvider>
    );
    expect(await screen.findByTestId('active')).toHaveTextContent('none');

    await userEvent.click(screen.getByLabelText('title'));
    expect(screen.getByTestId('active')).toHaveTextContent('title');

    await userEvent.click(screen.getByLabelText('summary'));
    expect(screen.getByTestId('active')).toHaveTextContent('summary');
  });

  it('an activation does not echo a second entry off the focus it causes', async () => {
    const entries: string[] = [];
    render(
      <TinaProvider
        config={asResolvedConfig({
          plugins: [stringFieldPlugin],
          schema: NO_COLLECTIONS,
        })}
      >
        <FormProvider
          collection={collection}
          path='content/posts/active.mdx'
          document={{ title: 'Hi' }}
        >
          <Field address='title' />
          <ActivateProbe />
          <ActivationLog entries={entries} />
        </FormProvider>
      </TinaProvider>
    );
    await userEvent.click(await screen.findByText('activate'));
    expect(screen.getByLabelText('title')).toHaveFocus();
    expect(entries).toEqual(['title']);
  });
});
