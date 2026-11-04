import type { BooleanFieldViewProps } from './boolean-field.view';

const base = {
  id: 'featured',
  label: 'Featured',
  checked: false,
  onChange: () => {},
} satisfies BooleanFieldViewProps;

/** Every look of the boolean field, for the design sign-off and the render test. */
export const booleanFieldStates = [
  { name: 'on', props: { ...base, checked: true } },
  { name: 'off', props: base },
  { name: 'disabled', props: { ...base, checked: true, disabled: true } },
  { name: 'read-only', props: { ...base, checked: true, readOnly: true } },
  {
    name: 'long label',
    props: {
      ...base,
      label:
        'Show this post on the home page and in every newsletter we send to subscribers this month',
    },
  },
  {
    name: 'help and warning',
    props: {
      ...base,
      checked: true,
      help: 'Pins the post to the top of the home page.',
      helpId: 'featured-help',
      warnings: ['Another post is already featured'],
    },
  },
  {
    name: 'error',
    props: { ...base, errors: ['Featured must be true or false'] },
  },
] satisfies { name: string; props: BooleanFieldViewProps }[];

export type BooleanFieldStateName = (typeof booleanFieldStates)[number]['name'];

export const booleanFieldState = (
  name: BooleanFieldStateName
): BooleanFieldViewProps => {
  const state = booleanFieldStates.find((entry) => entry.name === name);
  if (!state) throw new Error(`No boolean field state named ${name}`);
  return state.props;
};
