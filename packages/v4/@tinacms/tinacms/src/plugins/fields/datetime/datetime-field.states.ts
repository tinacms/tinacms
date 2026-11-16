import type { DatetimeFieldViewProps } from './datetime-field.view';

const base = {
  id: 'published',
  htmlFor: 'published',
  label: 'Published',
  value: '',
  onChange: () => {},
} satisfies DatetimeFieldViewProps;

const filled = '2024-05-01T09:30';

/** Every look of the datetime field, for the design sign-off and the render test. */
export const datetimeFieldStates = [
  { name: 'empty', props: base },
  { name: 'filled', props: { ...base, value: filled } },
  { name: 'required', props: { ...base, required: true } },
  {
    name: 'invalid',
    props: {
      ...base,
      required: true,
      errors: ['Published must be a valid date'],
    },
  },
  { name: 'disabled', props: { ...base, value: filled, disabled: true } },
  { name: 'read-only', props: { ...base, value: filled, readOnly: true } },
  {
    name: 'long label',
    props: {
      ...base,
      label:
        'Date and time this post goes live on the public site in every region',
    },
  },
  {
    name: 'help and warning',
    props: {
      ...base,
      value: filled,
      help: 'Shown in your time zone.',
      helpId: 'published-help',
      warnings: ['Another post goes live at this time'],
    },
  },
] satisfies { name: string; props: DatetimeFieldViewProps }[];

export type DatetimeFieldStateName =
  (typeof datetimeFieldStates)[number]['name'];

export const datetimeFieldState = (
  name: DatetimeFieldStateName
): DatetimeFieldViewProps => {
  const state = datetimeFieldStates.find((entry) => entry.name === name);
  if (!state) throw new Error(`No datetime field state named ${name}`);
  return state.props;
};
