import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../config';
import { toFieldAddress } from '../core/field/address';
import type { CollectionSchema } from '../core/schema/types';
import { toFormId, useFormStore } from '../form/form-store';
import { t } from '../index';
import objectFieldPlugin from '../plugins/fields/object/object-field.plugin';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import coreValidatorsPlugin from '../plugins/validators/core-validators.plugin';
import { LabelledFields } from '../test/labelled-fields';
import { FormProvider, TinaProvider } from './index';

const PATH = 'content/pages/home.mdx';
const formId = toFormId(PATH);
const slug = toFieldAddress('slug');
const seoTitle = toFieldAddress('seo.title');
const seo = toFieldAddress('seo');

const collection: CollectionSchema = {
  name: 'page',
  label: 'Pages',
  format: 'mdx',
  fields: [
    t.string({ name: 'slug', label: 'Slug' }),
    t.object({
      name: 'seo',
      label: 'SEO',
      fields: [t.string({ name: 'title', label: 'Title' })],
    }),
  ],
};

const renderForm = () =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [objectFieldPlugin, stringFieldPlugin, coreValidatorsPlugin],
        schema: { collections: [] },
      })}
    >
      <FormProvider
        collection={collection}
        path={PATH}
        document={{ slug: 'home', seo: { title: 'Home' } }}
      >
        <LabelledFields />
      </FormProvider>
    </TinaProvider>
  );

const hovered = () => useFormStore.getState().hovered;

beforeEach(() => {
  useFormStore.getState().setHovered(formId, null);
  useFormStore.getState().setActive(formId, null);
});

describe('hovering a field in the form', () => {
  it('sets hovered on pointer over and clears it on pointer out', async () => {
    renderForm();
    const input = await screen.findByLabelText(/^Slug\b/);

    fireEvent.pointerOver(input);
    expect(hovered()).toEqual({ formId, address: slug });

    fireEvent.pointerOut(input, { relatedTarget: document.body });
    expect(hovered()).toBeNull();
  });

  it('lets the innermost field win and keeps the outer one after leaving it', async () => {
    renderForm();
    const inner = await screen.findByLabelText(/^Title\b/);

    fireEvent.pointerOver(inner);
    expect(hovered()).toEqual({ formId, address: seoTitle });

    const frame = inner
      .closest('[data-field-frame]')
      ?.parentElement?.closest('[data-field-frame]');
    expect(frame).toBeTruthy();
    fireEvent.pointerOut(inner, { relatedTarget: frame });
    fireEvent.pointerOver(frame as Element);
    expect(hovered()).toEqual({ formId, address: seo });
  });
});

describe('the active look in the form', () => {
  it('puts data-active on the active field only, and keeps it when focus leaves', async () => {
    renderForm();
    const slugInput = await screen.findByLabelText(/^Slug\b/);
    expect(slugInput).not.toHaveAttribute('data-active');

    act(() => useFormStore.getState().setActive(formId, slug));
    expect(slugInput).toHaveAttribute('data-active');
    act(() => slugInput.blur());
    expect(slugInput).not.toHaveFocus();
    expect(slugInput).toHaveAttribute('data-active');
    expect(await screen.findByLabelText(/^Title\b/)).not.toHaveAttribute(
      'data-active'
    );

    act(() => useFormStore.getState().setActive(formId, seoTitle));
    expect(slugInput).not.toHaveAttribute('data-active');
    expect(await screen.findByLabelText(/^Title\b/)).toHaveAttribute(
      'data-active'
    );
  });

  it('keeps the active look while the field is hovered', async () => {
    renderForm();
    const input = await screen.findByLabelText(/^Slug\b/);
    act(() => useFormStore.getState().setActive(formId, slug));
    fireEvent.pointerOver(input);
    expect(input).toHaveAttribute('data-active');
  });
});
