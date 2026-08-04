import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../config';
import type { CollectionSchema } from '../core/schema/types';
import { t } from '../index';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import { LabelledFields } from '../test/labelled-fields';
import { FormProvider, TinaProvider, useFormId, useFormStatus } from './index';

const NO_COLLECTIONS = { collections: [] };

const collection: CollectionSchema = {
  name: 'post',
  format: 'mdx',
  fields: [t.string({ name: 'title', label: 'Title' })],
};

function StatusProbe() {
  return <span data-testid='status'>{useFormStatus(useFormId())}</span>;
}

describe('FormProvider form-store wiring', () => {
  it('tracks pristine on mount, dirty on edit, clean when the original value is retyped', async () => {
    render(
      <TinaProvider
        config={asResolvedConfig({
          plugins: [stringFieldPlugin],
          schema: NO_COLLECTIONS,
        })}
      >
        <FormProvider
          collection={collection}
          path='content/posts/wiring.mdx'
          document={{ title: 'Hi' }}
        >
          <LabelledFields />
          <StatusProbe />
        </FormProvider>
      </TinaProvider>
    );
    const input = await screen.findByLabelText('Title');
    expect(screen.getByTestId('status')).toHaveTextContent('pristine');

    await userEvent.type(input, '!');
    expect(screen.getByTestId('status')).toHaveTextContent('dirty');

    await userEvent.type(input, '{backspace}');
    expect(screen.getByTestId('status')).toHaveTextContent('clean');
  });
});
