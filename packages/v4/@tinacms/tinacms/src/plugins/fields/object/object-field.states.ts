import type { ObjectFieldViewProps } from './object-field.view';

const base = {
  label: 'SEO',
  labelId: 'seo-label',
  display: 'fieldset',
} satisfies ObjectFieldViewProps;

const longLabel =
  'Search engine and social sharing details for every region and language this page ships in';

/** Every look of the object field, for the design sign-off and the render test. */
export const objectFieldStates = [
  { name: 'fieldset', props: base },
  { name: 'fieldset invalid', props: { ...base, errors: ['SEO is required'] } },
  { name: 'fieldset long label', props: { ...base, label: longLabel } },
  {
    name: 'fieldset unbroken label',
    props: {
      ...base,
      label:
        'search-engine-and-social-sharing-details-for-every-region-and-language',
    },
  },
  { name: 'fieldset required', props: { ...base, required: true } },
  { name: 'fieldset disabled', props: { ...base, disabled: true } },
  { name: 'fieldset read-only', props: { ...base, readOnly: true } },
  {
    name: 'collapsible closed filled',
    props: {
      ...base,
      display: 'collapsible',
      open: false,
      summary: 'Home page',
    },
  },
  {
    name: 'collapsible closed required',
    props: {
      ...base,
      display: 'collapsible',
      open: false,
      summary: 'Home page',
      required: true,
    },
  },
  {
    name: 'collapsible closed empty',
    props: { ...base, display: 'collapsible', open: false },
  },
  {
    name: 'collapsible closed invalid',
    props: {
      ...base,
      display: 'collapsible',
      open: false,
      summary: 'Home page',
      invalidCount: 2,
    },
  },
  {
    name: 'collapsible closed long',
    props: {
      ...base,
      display: 'collapsible',
      open: false,
      label: longLabel,
      summary: longLabel,
    },
  },
  {
    name: 'collapsible open',
    props: { ...base, display: 'collapsible', open: true, invalidCount: 2 },
  },
  {
    name: 'collapsible open invalid',
    props: {
      ...base,
      display: 'collapsible',
      open: true,
      errors: ['SEO is required'],
    },
  },
  {
    name: 'collapsible disabled',
    props: {
      ...base,
      display: 'collapsible',
      open: false,
      summary: 'Home page',
      disabled: true,
    },
  },
  {
    name: 'collapsible read-only',
    props: {
      ...base,
      display: 'collapsible',
      open: false,
      summary: 'Home page',
      readOnly: true,
    },
  },
  {
    name: 'drill-in filled',
    props: { ...base, display: 'drillIn', summary: 'Home page' },
  },
  {
    name: 'drill-in required',
    props: {
      ...base,
      display: 'drillIn',
      summary: 'Home page',
      required: true,
    },
  },
  { name: 'drill-in empty', props: { ...base, display: 'drillIn' } },
  {
    name: 'drill-in invalid',
    props: {
      ...base,
      display: 'drillIn',
      summary: 'Home page',
      invalidCount: 3,
    },
  },
  {
    name: 'drill-in long',
    props: {
      ...base,
      display: 'drillIn',
      label: longLabel,
      summary: longLabel,
    },
  },
  {
    name: 'drill-in disabled',
    props: {
      ...base,
      display: 'drillIn',
      summary: 'Home page',
      disabled: true,
    },
  },
  {
    name: 'drill-in read-only',
    props: {
      ...base,
      display: 'drillIn',
      summary: 'Home page',
      readOnly: true,
    },
  },
] satisfies { name: string; props: ObjectFieldViewProps }[];
