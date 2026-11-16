import type { RichTextValue } from '@tinacms/rich-text';
import type { RichTextFieldViewProps } from './rich-text-field.view';

const paragraph = (text: string) => ({
  type: 'p',
  children: [{ type: 'text', text }],
});

const doc = (...texts: string[]): RichTextValue => ({
  type: 'root',
  children: texts.map(paragraph),
});

const empty: RichTextValue = {
  type: 'root',
  children: [paragraph('')],
};

const callout = {
  type: 'mdxJsxFlowElement',
  name: 'Callout',
  props: { text: 'Mind the gap' },
  children: [{ type: 'text', text: '' }],
};

const field = {
  templates: [
    {
      name: 'Callout',
      label: 'Callout',
      key: 'callout',
      fields: [{ name: 'text', type: 'string' }],
    },
  ],
} satisfies RichTextFieldViewProps['field'];

const manyTemplates = Array.from({ length: 12 }, (_, index) => ({
  name: `Block${index + 1}`,
  label: `Block ${index + 1}`,
  key: `block-${index + 1}`,
  fields: [{ name: 'text', type: 'string' }],
}));

const filled = doc(
  'TinaCMS keeps content in your repo.',
  'Edit it here and the file on disk changes.'
);

const base = {
  id: 'body',
  htmlFor: 'body',
  label: 'Body',
  value: filled,
  field,
  onChange: () => {},
} satisfies RichTextFieldViewProps;

const tableCell = (type: 'th' | 'td', text: string) => ({
  type,
  children: [paragraph(text)],
});

const withTable: RichTextValue = {
  type: 'root',
  children: [
    paragraph('Before the table.'),
    {
      type: 'table',
      children: [1, 2, 3, 4].map((row) => ({
        type: 'tr',
        children: [1, 2, 3].map((col) =>
          tableCell(row === 1 ? 'th' : 'td', 'r' + row + 'c' + col)
        ),
      })),
    },
    paragraph('After the table.'),
  ],
};

const long = Array.from(
  { length: 14 },
  (_, index) => `Paragraph ${index + 1} keeps the box growing.`
);

const longBody = doc(
  ...Array.from(
    { length: 40 },
    (_, index) => `Paragraph ${index + 1} keeps the body growing past a screen.`
  )
);

export const richTextFieldStates = [
  { name: 'empty', props: { ...base, value: empty } },
  { name: 'filled', props: base },
  {
    name: 'too long for the box',
    props: {
      ...base,
      value: doc(
        'Averyveryverylongwordwithnospacesthatgoeson'.repeat(6),
        ...long
      ),
    },
  },
  { name: 'required', props: { ...base, required: true } },
  {
    name: 'invalid',
    props: {
      ...base,
      value: empty,
      required: true,
      errors: ['Body is required'],
    },
  },
  { name: 'disabled', props: { ...base, disabled: true } },
  { name: 'read-only', props: { ...base, readOnly: true } },
  {
    name: 'with an embed',
    props: {
      ...base,
      value: { type: 'root', children: [paragraph('Before'), callout] },
    },
  },
  {
    name: 'read-only with an embed',
    props: {
      ...base,
      readOnly: true,
      value: { type: 'root', children: [paragraph('Before'), callout] },
    },
  },
  { name: 'body', props: { ...base, body: true } },
  { name: 'body empty', props: { ...base, body: true, value: empty } },
  {
    name: 'body invalid',
    props: {
      ...base,
      body: true,
      errors: ['Body is required'],
      warnings: ['This body is very long.'],
    },
  },
  { name: 'body read-only', props: { ...base, body: true, readOnly: true } },
  { name: 'body disabled', props: { ...base, body: true, disabled: true } },
  { name: 'body long', props: { ...base, body: true, value: longBody } },
  { name: 'with a table', props: { ...base, value: withTable } },
  {
    name: 'limited toolbar',
    props: {
      ...base,
      field: {
        ...field,
        overrides: {
          toolbar: ['bold', 'italic', 'link'],
          headingLevels: ['h2'],
        },
      },
    },
  },
  {
    name: 'with many templates',
    props: { ...base, field: { templates: manyTemplates } },
  },
] satisfies { name: string; props: RichTextFieldViewProps }[];

export type RichTextFieldStateName =
  (typeof richTextFieldStates)[number]['name'];

export const richTextFieldState = (
  name: RichTextFieldStateName
): RichTextFieldViewProps => {
  const state = richTextFieldStates.find((entry) => entry.name === name);
  if (!state) throw new Error(`No rich-text field state named ${name}`);
  return state.props;
};
