import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { asResolvedConfig } from '../../../config';
import type {
  CollectionSchema,
  TinaDocument,
} from '../../../core/schema/types';
import { FormProvider, TinaProvider } from '../../../editor';
import { t } from '../../../index';
import { LabelledFields } from '../../../test/labelled-fields';
import numberFieldPlugin from '../number/number-field.plugin';
import stringFieldPlugin from '../string/string-field.plugin';
import arrayFieldPlugin from './array-field.plugin';

const PLUGINS = [arrayFieldPlugin, stringFieldPlugin, numberFieldPlugin];

const renderCollection = (
  collection: CollectionSchema,
  document?: TinaDocument
) =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: PLUGINS,
        schema: { collections: [] },
      })}
    >
      <FormProvider
        collection={collection}
        path='content/pages/home.mdx'
        document={document}
      >
        <LabelledFields />
      </FormProvider>
    </TinaProvider>
  );

const pageOf = (...fields: CollectionSchema['fields']): CollectionSchema => ({
  name: 'page',
  format: 'mdx',
  fields,
});

describe('defaultItem', () => {
  it('seeds a new object item, and omitted keys fall back to the field default', async () => {
    const user = userEvent.setup();
    renderCollection(
      pageOf(
        t.array({
          name: 'links',
          label: 'Links',
          defaultItem: { label: 'New link' },
          fields: [
            t.string({ name: 'label', label: 'Label' }),
            t.string({ name: 'url', label: 'URL', defaultValue: '/' }),
          ],
        })
      )
    );
    await user.click(await screen.findByRole('button', { name: 'Add item' }));
    expect(screen.getByLabelText('Label')).toHaveValue('New link');
    expect(screen.getByLabelText('URL')).toHaveValue('/');
  });

  it('seeds each template from its own defaultItem', async () => {
    const user = userEvent.setup();
    renderCollection(
      pageOf(
        t.array({
          name: 'blocks',
          label: 'Blocks',
          templates: [
            {
              name: 'hero',
              defaultItem: { headline: 'New hero' },
              fields: [t.string({ name: 'headline', label: 'Headline' })],
            },
          ],
        })
      )
    );
    await user.click(await screen.findByRole('button', { name: 'Add hero' }));
    expect(screen.getByLabelText('Headline')).toHaveValue('New hero');
  });

  it('seeds a scalar item, ahead of the item field default', async () => {
    const user = userEvent.setup();
    renderCollection(
      pageOf(
        t.array({
          name: 'tags',
          label: 'Tags',
          defaultItem: 'new',
          of: t.string({ name: 'tag', label: 'Tag', defaultValue: 'other' }),
        })
      )
    );
    await user.click(await screen.findByRole('button', { name: 'Add item' }));
    expect(screen.getByLabelText('Tag')).toHaveValue('new');
  });

  it('is a type error on the templates array itself', () => {
    t.array({
      name: 'blocks',
      // @ts-expect-error each template carries its own defaultItem
      defaultItem: { headline: 'x' },
      templates: [{ name: 'hero', fields: [] }],
    });
  });
});

describe('itemLabel', () => {
  const links = (itemLabel: (item: TinaDocument) => unknown) =>
    pageOf(
      t.array({
        name: 'links',
        label: 'Links',
        itemLabel,
        fields: [t.string({ name: 'label', label: 'Label' })],
      })
    );

  it('heads each row and follows typing', async () => {
    const user = userEvent.setup();
    renderCollection(
      links((item) => item.label),
      { links: [{ label: 'Docs' }] }
    );
    expect(await screen.findByText('Docs')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Label'), '!');
    expect(screen.getByText('Docs!')).toBeInTheDocument();
  });

  it.each([
    ['empty', () => ''],
    ['non-string', () => 42],
    [
      'throwing',
      () => {
        throw new Error('boom');
      },
    ],
  ])('falls back to "Item N" for an %s result', async (_name, itemLabel) => {
    renderCollection(links(itemLabel), { links: [{ label: 'Docs' }] });
    expect(await screen.findByText('Item 1')).toBeInTheDocument();
  });

  it('heads a block by its template itemLabel', async () => {
    renderCollection(
      pageOf(
        t.array({
          name: 'blocks',
          label: 'Blocks',
          templates: [
            {
              name: 'hero',
              label: 'Hero',
              itemLabel: (item) => item.headline,
              fields: [t.string({ name: 'headline', label: 'Headline' })],
            },
          ],
        })
      ),
      { blocks: [{ _template: 'hero', headline: 'Welcome' }] }
    );
    expect(await screen.findByText('Welcome')).toBeInTheDocument();
  });

  it('is a type error on a scalar array and on a rich-text template', () => {
    t.array({
      name: 'tags',
      // @ts-expect-error a scalar item is its own label
      itemLabel: () => 'x',
      of: t.string({ name: 'tag' }),
    });
    t.richText({
      name: 'body',
      templates: [
        {
          name: 'callout',
          // @ts-expect-error rich-text embed templates take no itemLabel
          itemLabel: () => 'x',
          fields: [],
        },
      ],
    });
  });
});
