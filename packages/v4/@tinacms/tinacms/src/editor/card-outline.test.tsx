import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../config';
import { toFieldAddress } from '../core/field/address';
import type { CollectionSchema } from '../core/schema/types';
import { toFormId, useFormStore } from '../form/form-store';
import { t } from '../index';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import { FormProvider, TinaProvider } from './index';
import { useCardOutline } from './hooks';

const collection: CollectionSchema = {
  name: 'post',
  format: 'mdx',
  fields: [t.string({ name: 'title', label: 'Title' })],
};

function Outline({ list }: { list: string }) {
  const outline = useCardOutline(toFieldAddress(list));
  return (
    <button type='button' onClick={() => outline.focus(null)}>
      clear
    </button>
  );
}

describe('useCardOutline focus(null)', () => {
  it("leaves another form's focused card alone, even on a list with the same address", async () => {
    const other = toFormId('content/posts/a.mdx');
    render(
      <TinaProvider
        config={asResolvedConfig({
          plugins: [stringFieldPlugin],
          schema: { collections: [] },
        })}
      >
        <FormProvider
          collection={collection}
          path='content/posts/b.mdx'
          document={{ title: 'B' }}
        >
          <Outline list='blocks' />
        </FormProvider>
      </TinaProvider>
    );
    act(() => {
      useFormStore.getState().setFocusedCard(other, {
        list: toFieldAddress('blocks'),
        address: toFieldAddress('blocks.0'),
      });
    });
    const clear = await screen.findByRole('button', { name: 'clear' });
    act(() => clear.click());
    expect(useFormStore.getState().focusedCard).toMatchObject({
      formId: other,
      address: 'blocks.0',
    });
    act(() => useFormStore.getState().setFocusedCard(other, null));
  });
});
