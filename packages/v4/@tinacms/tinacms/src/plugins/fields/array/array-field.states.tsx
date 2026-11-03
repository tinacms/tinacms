import {
  type ArrayFieldViewProps,
  type ArrayItemView,
  FULL_REASON,
} from './array-field.view';
import {
  BlockAddView,
  type BlockAddViewProps,
  type BlockOption,
} from './block-picker.view';

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

const block = (
  id: string,
  title: string,
  summary?: string,
  extra: Partial<ArrayItemView> = {}
): ArrayItemView => ({
  id,
  name: `Item ${id}`,
  kind: 'group',
  title,
  summary,
  opens: 'in-place',
  open: false,
  ...extra,
});

const blocksFilled = [
  block('1', 'Hero', 'Welcome to the site'),
  block('2', 'Call to action', 'Read the docs'),
  block('3', 'Quote'),
];

const blockOptions: BlockOption[] = [
  { name: 'hero', label: 'Hero' },
  { name: 'columns', label: 'Columns', category: 'Layout' },
  { name: 'quote', label: 'Quote', category: 'Layout' },
  { name: 'cta', label: 'Call to action', category: 'Content' },
];

const withPreview = (options: BlockOption[]): BlockOption[] =>
  options.map((option) => ({
    ...option,
    preview: <span className='aspect-video w-full rounded-sm bg-muted' />,
  }));

const blocksBase = {
  label: 'Blocks',
  labelId: 'blocks-label',
  emptyText: 'No blocks.',
} satisfies Partial<ArrayFieldViewProps>;

const picker =
  (
    extra: Partial<BlockAddViewProps> = {},
    look: BlockAddViewProps['look'] = 'list'
  ): ArrayFieldViewProps['addSlot'] =>
  ({ disabled }) => (
    <BlockAddView
      options={look === 'grid' ? withPreview(blockOptions) : blockOptions}
      look={look}
      onPick={() => {}}
      disabled={disabled}
      {...extra}
    />
  );

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
  {
    name: 'blocks empty',
    props: { ...blocksBase, items: [], addSlot: picker() },
  },
  {
    name: 'blocks filled',
    props: { ...blocksBase, items: blocksFilled, addSlot: picker() },
  },
  {
    name: 'blocks too long',
    props: {
      ...blocksBase,
      items: [
        block(
          '1',
          'A template with a very long name that cannot fit on one line of the card',
          'A first field with a very long value that cannot fit on one line of the card either'
        ),
      ],
      addSlot: picker(),
    },
  },
  {
    name: 'blocks required',
    props: {
      ...blocksBase,
      required: true,
      items: blocksFilled,
      addSlot: picker(),
    },
  },
  {
    name: 'blocks invalid',
    props: {
      ...blocksBase,
      errors: ['Blocks is required'],
      items: [
        block('1', 'Hero', 'Welcome', { errorCount: 2 }),
        blocksFilled[1],
      ],
      addSlot: picker(),
    },
  },
  {
    name: 'blocks disabled',
    props: {
      ...blocksBase,
      disabled: true,
      items: blocksFilled,
      addSlot: picker(),
    },
  },
  {
    name: 'blocks read-only',
    props: {
      ...blocksBase,
      readOnly: true,
      items: blocksFilled,
      addSlot: picker(),
    },
  },
  {
    name: 'blocks read-only empty',
    props: { ...blocksBase, readOnly: true, items: [], addSlot: picker() },
  },
  {
    name: 'blocks full',
    props: {
      ...blocksBase,
      full: true,
      items: blocksFilled,
      addSlot: picker({ reason: FULL_REASON }),
    },
  },
  {
    name: 'blocks plain picker open',
    props: {
      ...blocksBase,
      items: blocksFilled,
      addSlot: picker({ defaultOpen: true }),
    },
  },
  {
    name: 'blocks visual picker open',
    props: {
      ...blocksBase,
      items: blocksFilled,
      addSlot: picker({ defaultOpen: true }, 'grid'),
    },
  },
] satisfies { name: string; props: ArrayFieldViewProps }[];
