import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { CollectionSchema } from '../core/schema/types';
import { t } from '../index';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import {
  Field,
  FormProvider,
  type SaveHandler,
  TinaProvider,
  useFormId,
  useFormSave,
  useFormStatus,
} from './index';

const collection: CollectionSchema = {
  name: 'post',
  fields: [t.string({ name: 'title', label: 'Title' })],
};

function SaveProbe() {
  const save = useFormSave();
  const status = useFormStatus(useFormId());
  return (
    <div>
      <button type='button' onClick={() => save().catch(() => {})}>
        save
      </button>
      <span data-testid='status'>{status}</span>
    </div>
  );
}

const renderWithSave = (onSave: SaveHandler) =>
  render(
    <TinaProvider plugins={[stringFieldPlugin]}>
      <FormProvider
        collection={collection}
        path='content/posts/save.mdx'
        document={{ title: 'Hi' }}
        onSave={onSave}
      >
        <Field address='title' />
        <SaveProbe />
      </FormProvider>
    </TinaProvider>
  );

describe('useFormSave', () => {
  it('delivers the digested document to onSave and marks the form clean', async () => {
    const onSave = vi.fn();
    renderWithSave(onSave);
    const input = await screen.findByLabelText('title');
    await userEvent.type(input, '!');
    expect(screen.getByTestId('status')).toHaveTextContent('dirty');

    await userEvent.click(screen.getByText('save'));
    expect(onSave).toHaveBeenCalledWith({ title: 'Hi!' });
    expect(await screen.findByTestId('status')).toHaveTextContent('clean');
  });

  it('leaves the form dirty when onSave rejects', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('save failed'));
    renderWithSave(onSave);
    const input = await screen.findByLabelText('title');
    await userEvent.type(input, '!');

    await userEvent.click(screen.getByText('save'));
    expect(onSave).toHaveBeenCalled();
    expect(screen.getByTestId('status')).toHaveTextContent('dirty');
  });
});
