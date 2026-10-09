import { TemplatePicker } from '../blocks/template-picker';
import {
  type Block,
  blockErrors,
  blockText,
  templateOf,
} from '../blocks/templates';
import { type CaseControlProps, type CaseSpec, defineCase } from '../case-row';
import { NestedField } from '../group/group-section';
import { type FieldsArgs, ItemList, type OpenMode } from '../group/item-list';
import { type ListItem, newItem } from '../list/use-list';

type Blocks = ListItem<Block>[];

const BLOCKS: Blocks = [
  {
    template: 'hero',
    fields: {
      heading: 'Welcome to Tina',
      subheading: 'Edit your site on your site.',
    },
  },
  { template: 'featureGrid', fields: { heading: 'Why teams pick Tina' } },
  {
    template: 'testimonial',
    fields: {
      quote: 'Our editors stopped asking us for changes.',
      person: 'Ada Lovelace',
    },
  },
].map(newItem);

// "Hero · Welcome to Tina", or "Hero" alone while the first field is empty.
function BlockSummary({ block }: { block: Block }) {
  const text = blockText(block);
  return (
    <>
      <span className='font-medium'>{templateOf(block.template).label}</span>
      {text ? <span className='text-muted-foreground'> · {text}</span> : null}
    </>
  );
}

const describeBlock = (block: Block) => {
  const text = blockText(block);
  const label = templateOf(block.template).label;
  return text ? `${label} · ${text}` : label;
};

function BlockFields({
  item,
  saved,
  locked,
  touched,
  update,
}: FieldsArgs<Block>) {
  const errors = touched ? blockErrors(item.value) : {};
  return (
    <>
      {templateOf(item.value.template).fields.map((field) => (
        <NestedField
          key={field.name}
          label={field.label}
          required={field.required}
          multiline={field.multiline}
          value={item.value.fields[field.name] ?? ''}
          saved={saved?.fields[field.name]}
          error={errors[field.name]}
          locked={locked}
          onChange={(text) =>
            update({
              ...item.value,
              fields: { ...item.value.fields, [field.name]: text },
            })
          }
        />
      ))}
    </>
  );
}

function makeBlocksControl(look: 'plain' | 'visual', mode: OpenMode) {
  return function BlocksControl(props: CaseControlProps<Blocks>) {
    return (
      <ItemList
        {...props}
        mode={mode}
        nouns={{ one: 'block', many: 'blocks' }}
        makeEmpty={() => ({ template: 'hero', fields: {} })}
        describe={describeBlock}
        summary={(block) => <BlockSummary block={block} />}
        errorCount={(block) => Object.keys(blockErrors(block)).length}
        renderFields={BlockFields}
        picker={(args) => <TemplatePicker {...args} look={look} />}
      />
    );
  };
}

const blocksSpec = {
  labelling: 'group' as const,
  label: 'Page sections',
  overflowLabel: 'Page sections, shown top to bottom on the page',
  empty: [],
  filled: BLOCKS,
  overflow: [
    {
      ...BLOCKS[0],
      value: {
        ...BLOCKS[0].value,
        fields: {
          ...BLOCKS[0].value.fields,
          heading: 'Welcome to Tina, the CMS that keeps your content in Git',
        },
      },
    },
    BLOCKS[1],
    BLOCKS[2],
  ],
  invalid: [
    BLOCKS[0],
    { ...BLOCKS[1], value: { ...BLOCKS[1].value, fields: { heading: '' } } },
    BLOCKS[2],
  ],
  dirty: [
    BLOCKS[0],
    BLOCKS[1],
    {
      ...BLOCKS[2],
      value: {
        ...BLOCKS[2].value,
        fields: { ...BLOCKS[2].value.fields, person: 'Grace Hopper' },
      },
    },
  ],
  required: true,
  validate: (items: Blocks, required: boolean) =>
    required && items.length === 0 ? ['Add at least one block.'] : [],
};

export const blocksPlainCase: CaseSpec<Blocks> = {
  ...blocksSpec,
  id: 'blocks-plain',
  title: 'Blocks, with the template picker',
  notInV4: true,
  note: 'Adding a block starts by choosing its template from a plain list, grouped by kind. Search appears once the list would scroll. A block keeps its template. Blocks here open in place.',
  Control: makeBlocksControl('plain', 'inPlace'),
};

export const blocksVisualCase: CaseSpec<Blocks> = {
  ...blocksSpec,
  id: 'blocks-visual',
  title: 'Blocks, with the visual block picker',
  notInV4: true,
  note: 'The same blocks, chosen from thumbnails. Blocks here open as the next level, so the two cases between them show both pickers and both ways of opening.',
  Control: makeBlocksControl('visual', 'nextLevel'),
};

export const blockCases = [
  defineCase(blocksPlainCase),
  defineCase(blocksVisualCase),
];
