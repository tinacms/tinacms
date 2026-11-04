import type { SelectFieldViewProps } from './select-field.view';

const base = {
  id: 'status',
  htmlFor: 'status',
  label: 'Status',
  items: [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
  ],
  value: null,
  onChange: () => {},
} satisfies SelectFieldViewProps;

/** Every look of the select field, for the design sign-off and the render test. */
export const selectFieldStates = [
  { name: 'empty', props: base },
  { name: 'filled', props: { ...base, value: 'published' } },
  { name: 'required', props: { ...base, required: true } },
  {
    name: 'error',
    props: {
      ...base,
      required: true,
      errors: ['Status is required'],
    },
  },
  {
    name: 'long value',
    props: {
      ...base,
      items: [
        {
          value: 'long',
          label:
            'Waiting for legal sign-off from every region before this post can be published',
        },
      ],
      value: 'long',
    },
  },
  { name: 'disabled', props: { ...base, value: 'published', disabled: true } },
  { name: 'read-only', props: { ...base, value: 'published', readOnly: true } },
  {
    name: 'disabled option',
    props: {
      ...base,
      items: [
        { value: 'draft', label: 'Draft' },
        {
          value: 'published',
          label: 'Published',
          disabled: true,
          hint: 'Needs an approver',
        },
      ],
    },
  },
  {
    name: 'help and warning',
    props: {
      ...base,
      value: 'draft',
      help: 'Only published posts appear on the site.',
      helpId: 'status-help',
      warnings: ['Another post already uses this status'],
    },
  },
  {
    name: 'unknown stored value',
    props: {
      ...base,
      value: 'scheduled',
      errors: ['Status must be one of the listed options'],
    },
  },
] satisfies { name: string; props: SelectFieldViewProps }[];

export type SelectFieldStateName = (typeof selectFieldStates)[number]['name'];

export const selectFieldState = (
  name: SelectFieldStateName
): SelectFieldViewProps => {
  const state = selectFieldStates.find((entry) => entry.name === name);
  if (!state) throw new Error(`No select field state named ${name}`);
  return state.props;
};
