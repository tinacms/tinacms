import type { StringFieldViewProps } from './string-field.view';

type StringFieldState = {
  name: string;
  props: StringFieldViewProps;
};

const base = {
  id: 'title',
  label: 'Title',
  htmlFor: 'title',
  labelId: 'title-label',
  value: '',
} satisfies StringFieldViewProps;

const longLine =
  'A very long title that runs well past the edge of the box and needs an ellipsis to stay on one line';

/** Every look of the String field, for the design review and the render test. */
export const stringFieldStates: StringFieldState[] = [
  { name: 'empty', props: { ...base, placeholder: 'Enter a title' } },
  { name: 'filled', props: { ...base, value: 'Hello world' } },
  { name: 'required', props: { ...base, required: true } },
  {
    name: 'invalid',
    props: { ...base, errors: ['Title is required'], required: true },
  },
  { name: 'too long', props: { ...base, value: longLine } },
  {
    name: 'disabled',
    props: { ...base, value: 'Hello world', disabled: true },
  },
  {
    name: 'read-only',
    props: { ...base, value: 'Hello world', readOnly: true },
  },
  {
    name: 'multi-line',
    props: { ...base, multiline: true, value: 'First line\nSecond line' },
  },
  {
    name: 'multi-line invalid',
    props: { ...base, multiline: true, errors: ['Title is too short'] },
  },
  {
    name: 'help and warning',
    props: {
      ...base,
      help: 'Shown in search results.',
      helpId: 'title-help',
      warnings: ['Longer than 60 characters'],
    },
  },
  { name: 'mono', props: { ...base, mono: true, value: 'my-post-slug' } },
];

export const stringFieldState = (name: string): StringFieldViewProps => {
  const state = stringFieldStates.find((entry) => entry.name === name);
  if (!state) throw new Error(`No String field state named ${name}`);
  return state.props;
};
