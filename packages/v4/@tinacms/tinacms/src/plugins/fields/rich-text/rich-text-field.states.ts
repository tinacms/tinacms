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

const long = Array.from(
  { length: 14 },
  (_, index) => `Paragraph ${index + 1} keeps the box growing.`
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
