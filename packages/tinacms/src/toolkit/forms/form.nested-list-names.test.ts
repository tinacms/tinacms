import { describe, expect, it, vi } from 'vitest';
import { calculateBreadcrumbs } from '../tina-state';
import { Form } from './form';

const text = {
  name: 'content',
  label: 'Text',
  fields: [{ name: 'body', type: 'string' }],
};

const checkList = {
  name: 'checkList',
  label: 'Check List',
  fields: [{ name: 'items', type: 'string' }],
};

const accordion = {
  name: 'accordion',
  label: 'Accordion',
  fields: [
    { name: 'title', type: 'string' },
    {
      name: 'blocks',
      label: 'Contents',
      type: 'object',
      list: true,
      templates: { content: text, checkList },
    },
  ],
};

const column = {
  name: 'column',
  label: 'Column',
  fields: [
    {
      name: 'blocks',
      type: 'object',
      list: true,
      templates: { accordion, content: text },
    },
  ],
};

const row = {
  name: 'row',
  label: 'Row',
  fields: [{ name: 'cols', type: 'object', list: true, templates: { column } }],
};

const band = {
  name: 'band',
  label: 'Band',
  fields: [{ name: 'heading', type: 'string' }],
};

const makeForm = () =>
  new Form({
    id: 'page',
    label: 'Page',
    onSubmit: vi.fn(),
    fields: [
      {
        name: 'blocks',
        label: 'Page Blocks',
        type: 'object',
        list: true,
        templates: { band, row, content: text, accordion },
      } as any,
    ],
    initialValues: {
      blocks: [
        { _template: 'band', heading: 'one' },
        { _template: 'content', body: 'two' },
        {
          _template: 'row',
          cols: [
            {
              _template: 'column',
              blocks: [
                { _template: 'content', body: 'inner' },
                {
                  _template: 'accordion',
                  title: 'Preserve Working Capital',
                  blocks: [{ _template: 'content', body: 'deep' }],
                },
              ],
            },
          ],
        },
      ],
    },
  });

const ACCORDION = 'blocks.2.cols.0.blocks.1';

describe('getActiveField within a nested list sharing the root list name', () => {
  it('names the fields of the item a path ends on', () => {
    const group = makeForm().getActiveField(ACCORDION);

    expect(group.label).toBe('Accordion');
    expect(group.fields.map((field) => field.name)).toEqual([
      `${ACCORDION}.title`,
      `${ACCORDION}.blocks`,
    ]);
  });

  it('names them the same way when the path ends on the list rather than an item', () => {
    const group = makeForm().getActiveField(`${ACCORDION}.blocks`);

    expect(group.label).toBe('Accordion');
    expect(group.fields.map((field) => field.name)).toEqual([
      `${ACCORDION}.title`,
      `${ACCORDION}.blocks`,
    ]);
  });

  it('leaves the form’s own fields unprefixed', () => {
    const group = makeForm().getActiveField('blocks');

    expect(group.fields.map((field) => field.name)).toEqual(['blocks']);
  });

  it('names the fields of a list nested one level down', () => {
    const column = 'blocks.2.cols.0';
    const group = makeForm().getActiveField(`${column}.blocks`);

    expect(group.label).toBe('Column');
    expect(group.fields.map((field) => field.name)).toEqual([
      `${column}.blocks`,
    ]);
  });
});

describe('breadcrumbs into a nested list', () => {
  it('reaches every group between the form and the edited block', () => {
    const form = makeForm();
    const activeFieldName = `${ACCORDION}.blocks.0`;

    const crumbs = calculateBreadcrumbs(
      [{ activeFieldName, tinaForm: form }],
      'page',
      activeFieldName
    );

    expect(crumbs.map((crumb) => crumb.label)).toEqual([
      'Page',
      'Row',
      'Column',
      'Accordion',
      'Text',
    ]);
  });

  it('resolves the accordion crumb to the accordion’s own fields', () => {
    const form = makeForm();
    const accordionCrumb = `${ACCORDION}.blocks`;

    expect(
      form.getActiveField(accordionCrumb).fields.map((field) => field.name)
    ).toEqual([`${ACCORDION}.title`, `${ACCORDION}.blocks`]);
  });
});
