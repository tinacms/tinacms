import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { CollectionSchema } from '../core/schema/types';
import { t } from '../index';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import {
  Field,
  FormProvider,
  TinaProvider,
  toFieldAddress,
  useActiveField,
} from './index';

const collection: CollectionSchema = {
  name: 'post',
  fields: [t.string({ name: 'title', label: 'Title' })],
};

// Drives the activation rail the way the preview's click listener does — through
// useActiveField — without needing postMessage.
function ActivateProbe() {
  const { setActive } = useActiveField();
  return (
    <button type='button' onClick={() => setActive(toFieldAddress('title'))}>
      activate
    </button>
  );
}

describe('active-field rail', () => {
  it('focuses the field input when its address is activated', async () => {
    render(
      <TinaProvider plugins={[stringFieldPlugin]}>
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
      <TinaProvider plugins={[stringFieldPlugin]}>
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

    // Blur (e.g. the user clicked elsewhere), then activate the same field again.
    (input as HTMLInputElement).blur();
    expect(input).not.toHaveFocus();
    await userEvent.click(screen.getByText('activate'));
    expect(input).toHaveFocus();
  });
});
