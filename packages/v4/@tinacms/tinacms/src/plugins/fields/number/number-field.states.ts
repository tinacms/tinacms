import type { NumberFieldViewProps } from './number-field.view';

const base = {
  id: 'rating',
  htmlFor: 'rating',
  label: 'Rating',
  value: null,
  onChange: () => {},
} satisfies NumberFieldViewProps;

/** Every look of the number field, for the design sign-off and the render test. */
export const numberFieldStates = [
  { name: 'empty', props: base },
  { name: 'filled', props: { ...base, value: '3' } },
  { name: 'required', props: { ...base, required: true } },
  {
    name: 'invalid',
    props: { ...base, required: true, errors: ['Rating is required'] },
  },
  { name: 'at the minimum', props: { ...base, value: '1', min: 1, max: 5 } },
  { name: 'at the maximum', props: { ...base, value: '5', min: 1, max: 5 } },
  {
    name: 'past the maximum',
    props: {
      ...base,
      value: '6',
      min: 1,
      max: 5,
      errors: ['Rating must be at most 5'],
    },
  },
  { name: 'decimal step', props: { ...base, value: '1.5', step: 0.5 } },
  { name: 'negative value', props: { ...base, value: '-4' } },
  {
    name: 'help and warning',
    props: {
      ...base,
      value: '3',
      help: 'Stars out of five.',
      helpId: 'rating-help',
      warnings: ['Ratings below 2 get reviewed'],
    },
  },
  { name: 'disabled', props: { ...base, value: '3', disabled: true } },
  { name: 'read-only', props: { ...base, value: '3', readOnly: true } },
] satisfies { name: string; props: NumberFieldViewProps }[];

export type NumberFieldStateName = (typeof numberFieldStates)[number]['name'];

export const numberFieldState = (
  name: NumberFieldStateName
): NumberFieldViewProps => {
  const state = numberFieldStates.find((entry) => entry.name === name);
  if (!state) throw new Error(`No number field state named ${name}`);
  return state.props;
};
