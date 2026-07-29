import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../config';
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

// These tests render a runtime directly, and not a configured app. They therefore pass
// TinaProvider the resolved shape, and do not call defineConfig.
const NO_COLLECTIONS = { collections: [] };

const collection: CollectionSchema = {
  name: 'post',
  format: 'mdx',
  fields: [t.string({ name: 'title', label: 'Title' })],
};

// This drives the activation path in the same way as the click listener of the preview.
// It calls useActiveField, and it needs no postMessage.
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

    // Blur the field, as a click elsewhere does, and then activate the same field
    // again.
    (input as HTMLInputElement).blur();
    expect(input).not.toHaveFocus();
    await userEvent.click(screen.getByText('activate'));
    expect(input).toHaveFocus();
  });
});
