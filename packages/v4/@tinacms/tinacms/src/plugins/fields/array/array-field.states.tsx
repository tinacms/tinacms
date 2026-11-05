import type { ArrayFieldViewProps, ArrayItemView } from './array-field.view';

const base = {
  label: 'Authors',
  labelId: 'authors-label',
} satisfies Partial<ArrayFieldViewProps>;

const author = (id: string, summary?: string): ArrayItemView => ({
  id,
  name: `Item ${id}`,
  kind: 'group',
  summary,
  opens: 'in-place',
  open: false,
});

const closed = [author('1', 'Ivan'), author('2', 'Brook'), author('3')];

const tag = (id: string, value: string): ArrayItemView => ({
  id,
  name: `Item ${id}`,
  kind: 'value',
  value,
});

/** Every look of the array field, for the design sign-off and the render test. */
export const arrayFieldStates = [
  { name: 'empty', props: { ...base, items: [] } },
  { name: 'filled', props: { ...base, items: closed } },
  {
    name: 'item open',
    props: {
      ...base,
      items: [
        {
          ...closed[0],
          open: true,
          children: <input aria-label='Name' defaultValue='Ivan' />,
        },
        closed[1],
        closed[2],
      ],
    },
  },
  {
    name: 'next level',
    props: {
      ...base,
      items: closed.map((item) => ({ ...item, opens: 'next-level' as const })),
    },
  },
  { name: 'required', props: { ...base, required: true, items: closed } },
  {
    name: 'invalid',
    props: {
      ...base,
      errors: ['Authors is required'],
      items: [{ ...closed[0], errorCount: 2 }, closed[1], closed[2]],
    },
  },
  {
    name: 'scalar values',
    props: {
      ...base,
      label: 'Tags',
      add: 'input',
      addLabel: 'Add item',
      items: [tag('1', 'news'), tag('2', 'release')],
    },
  },
  {
    name: 'scalar invalid',
    props: {
      ...base,
      label: 'Tags',
      add: 'input',
      items: [{ ...tag('1', ''), error: 'Tag is required' }],
    },
  },
  { name: 'disabled', props: { ...base, disabled: true, items: closed } },
  { name: 'read-only', props: { ...base, readOnly: true, items: closed } },
  { name: 'read-only empty', props: { ...base, readOnly: true, items: [] } },
  { name: 'full', props: { ...base, full: true, items: closed } },
] satisfies { name: string; props: ArrayFieldViewProps }[];
