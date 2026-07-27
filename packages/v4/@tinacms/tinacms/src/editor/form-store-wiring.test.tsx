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
  useFormId,
  useFormStatus,
} from './index';

const collection: CollectionSchema = {
  name: 'post',
  fields: [t.string({ name: 'title', label: 'Title' })],
};

function StatusProbe() {
  return <span data-testid='status'>{useFormStatus(useFormId())}</span>;
}

describe('FormProvider form-store wiring', () => {
  it('tracks pristine on mount, dirty on edit, clean when the original value is retyped', async () => {
    render(
      <TinaProvider plugins={[stringFieldPlugin]}>
        <FormProvider
          collection={collection}
          path='content/posts/wiring.mdx'
          document={{ title: 'Hi' }}
        >
          <Field address='title' />
          <StatusProbe />
        </FormProvider>
      </TinaProvider>
    );
    const input = await screen.findByLabelText('title');
    expect(screen.getByTestId('status')).toHaveTextContent('pristine');

    await userEvent.type(input, '!');
    expect(screen.getByTestId('status')).toHaveTextContent('dirty');

    // Back to the registered baseline — proves status is a diff, not a touched flag.
    await userEvent.type(input, '{backspace}');
    expect(screen.getByTestId('status')).toHaveTextContent('clean');
  });
});
