import type { TinaField } from '@tinacms/schema-tools';
import { validateSchema } from './validate';
import { describe, expect, it } from 'vitest';

const baseField: TinaField = {
  label: 'Title',
  name: 'myTitle',
  type: 'string',
};

const baseCollection = {
  label: 'Some label',
  name: 'someName',
  path: 'content/some-path',
  fields: [baseField],
};

describe('The schema validation', () => {
  it(`Throws an error for "global" templates which aren't yet supported`, async () => {
    await expect(
      validateSchema({
        templates: [
          {
            name: 'globalTemplate',
            label: 'Global Template',
            fields: [baseField],
          },
        ],

        collections: [
          {
            ...baseCollection,
            fields: 'globalTemplate',
          },
        ],
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Global templates are not yet supported"`
    );
  });

  it(`Throws an error for field names that use title-casing`, async () => {
    await expect(
      validateSchema({
        collections: [
          {
            ...baseCollection,
            fields: [{ name: 'my-name', label: 'My Name', type: 'string' }],
          },
        ],
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Field's 'name' must match /^[a-zA-Z0-9_]*$/ at someName.my-name"`
    );
  });

  it(`Throws an error for field types that don't exist`, async () => {
    await expect(
      validateSchema({
        collections: [
          {
            ...baseCollection,
            // @ts-ignore
            fields: [{ ...baseField, type: 'some-type' }],
          },
        ],
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"'type' must be one of: string, number, boolean, datetime, image, reference, object, rich-text, password, displayOnly, but got 'some-type' at someName.myTitle"`
    );
  });

  it(`Trims the "collection.path" missing`, async () => {
    await expect(
      validateSchema({
        collections: [
          {
            ...baseCollection,
            path: undefined,
          },
        ],
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"path is a required field"`);
  });

  it(`Trims the "collection.path" configuration automatically`, async () => {
    const validSchema = await validateSchema({
      collections: [
        {
          ...baseCollection,
          path: 'some/path/',
        },
      ],
    });

    expect(validSchema).toMatchObject({
      collections: [
        {
          ...baseCollection,
          path: 'some/path',
        },
      ],
    });
  });

  it(`Throws a clear error when checkbox-group is used without list: true`, async () => {
    await expect(
      validateSchema({
        collections: [
          {
            ...baseCollection,
            fields: [
              {
                type: 'string',
                name: 'textDecoration',
                label: 'Text Decoration',
                options: ['underline', 'overline'],
                ui: { component: 'checkbox-group' },
              },
            ],
          },
        ],
      })
    ).rejects.toThrow(
      'Field "textDecoration" uses "checkbox-group" without list: true at someName.textDecoration. Add list: true or use "select" instead.'
    );
  });

  it(`Passes validation when checkbox-group is used with list: true`, async () => {
    await expect(
      validateSchema({
        collections: [
          {
            ...baseCollection,
            fields: [
              {
                type: 'string',
                name: 'textDecoration',
                label: 'Text Decoration',
                options: ['underline', 'overline'],
                list: true,
                ui: { component: 'checkbox-group' },
              },
            ],
          },
        ],
      })
    ).resolves.toBeDefined();
  });

  it(`Throws a clear error when a nested checkbox-group is used without list: true`, async () => {
    await expect(
      validateSchema({
        collections: [
          {
            ...baseCollection,
            fields: [
              {
                type: 'object',
                name: 'meta',
                label: 'Meta',
                fields: [
                  {
                    type: 'string',
                    name: 'tags',
                    label: 'Tags',
                    options: ['a', 'b'],
                    ui: { component: 'checkbox-group' },
                  },
                ],
              },
            ],
          },
        ],
      })
    ).rejects.toThrow(
      'Field "tags" uses "checkbox-group" without list: true at someName.meta.tags. Add list: true or use "select" instead.'
    );
  });
});
