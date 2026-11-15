import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { use } from 'react';
import { describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../../../config';
import { FormProvider, TinaProvider } from '../../../editor';
import { FormScopeContext } from '../../../editor/context';
import { t } from '../../../index';
import coreValidatorsPlugin from '../../../plugins/validators/core-validators.plugin';
import { LabelledFields } from '../../../test/labelled-fields';
import arrayFieldPlugin from '../array/array-field.plugin';
import stringFieldPlugin from '../string/string-field.plugin';
import objectFieldPlugin from './object-field.plugin';

const collection = {
  name: 'page',
  label: 'Pages',
  format: 'mdx' as const,
  fields: [
    t.object({
      name: 'seo',
      label: 'SEO',
      display: 'collapsible',
      fields: [t.string({ name: 'title', label: 'Title' })],
    }),
    t.array({
      name: 'rows',
      label: 'Rows',
      fields: [t.string({ name: 'label', label: 'Label' })],
    }),
  ],
};

function Menu() {
  const view = use(FormScopeContext)?.view;
  return (
    <>
      <button type='button' onClick={() => view?.getState().setExpansion(true)}>
        expand
      </button>
      <button
        type='button'
        onClick={() => view?.getState().setExpansion(false)}
      >
        collapse
      </button>
    </>
  );
}

const renderForm = (
  document = { seo: { title: 'Home' }, rows: [{ label: 'One' }] }
) =>
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
        document={document}
      >
        <Menu />
        <LabelledFields />
      </FormProvider>
    </TinaProvider>
  );

describe('Expand all and Collapse all', () => {
  it('opens every collapsible object and card, and closes them again', async () => {
    renderForm();
    const user = userEvent.setup();
    await screen.findByRole('button', { name: 'expand' });
    expect(screen.queryByLabelText(/^Title\b/)).toBeNull();
    expect(screen.queryByLabelText(/^Label\b/)).toBeNull();

    await user.click(screen.getByRole('button', { name: 'expand' }));
    expect(await screen.findByLabelText(/^Title\b/)).toBeVisible();
    expect(await screen.findByLabelText(/^Label\b/)).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'collapse' }));
    expect(screen.queryByLabelText(/^Title\b/)).toBeNull();
    expect(screen.queryByLabelText(/^Label\b/)).toBeNull();
  });
});
