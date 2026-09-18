import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import { definePlugin } from '../core/plugin';
import type { CollectionSchema } from '../core/schema/types';
import { toFormId } from '../form/form-store';
import { t } from '../index';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import coreValidatorsPlugin from '../plugins/validators/core-validators.plugin';
import { LabelledFields } from '../test/labelled-fields';
import { FormProvider, TinaProvider } from './index';

const collection: CollectionSchema = {
  name: 'post',
  format: 'mdx',
  fields: [t.string({ name: 'title', label: 'Title' })],
};

describe('afterEdit hook', () => {
  it('fires with the changed address and value on every edit', async () => {
    const afterEdit = vi.fn();
    const observer = definePlugin({
      name: 'test:hooks:edit-observer',
      provides: ['hooks'],
      client: async () => ({ default: { hooks: { afterEdit } } }),
    });
    render(
      <TinaProvider
        config={asResolvedConfig({
          plugins: [stringFieldPlugin, coreValidatorsPlugin, observer],
          schema: { collections: [] },
        })}
      >
        <FormProvider
          collection={collection}
          path='content/posts/edit.mdx'
          document={{ title: 'Hi' }}
        >
          <LabelledFields />
        </FormProvider>
      </TinaProvider>
    );
    const input = await screen.findByLabelText('Title');
    expect(afterEdit).not.toHaveBeenCalled();

    await userEvent.type(input, '!?');
    expect(afterEdit).toHaveBeenCalledTimes(2);
    expect(afterEdit).toHaveBeenLastCalledWith(
      { address: 'title', value: 'Hi!?' },
      expect.objectContaining({
        formId: toFormId('content/posts/edit.mdx'),
        path: 'content/posts/edit.mdx',
        collection,
      })
    );
  });
});
