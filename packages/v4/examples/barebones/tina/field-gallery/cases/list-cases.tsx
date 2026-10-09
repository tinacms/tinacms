import { type CaseControlProps, type CaseSpec, defineCase } from '../case-row';
import { type ListItem, newItem } from '../list/use-list';
import { ValueList } from '../list/value-list';

type Items = ListItem<string>[];

const TAGS: Items = ['Getting started', 'Visual editing', 'Self-hosting'].map(
  newItem
);
const TAG_NOUNS = { one: 'tag', many: 'tags' };

function TagsControl({
  control,
  flags,
  value,
  onChange,
  onBlur,
}: CaseControlProps<Items>) {
  return (
    <ValueList
      control={control}
      flags={flags}
      items={value}
      onChange={onChange}
      onBlur={onBlur}
      limits={{}}
      nouns={TAG_NOUNS}
      describe={(tag) => tag}
      makeEmpty={() => ''}
      itemError={(tag) =>
        tag.trim() === '' ? 'Enter a tag, or remove it.' : undefined
      }
      parse={(text) => text}
      renderInput={(item, { ref, ...input }, update) => (
        <input
          {...input}
          ref={ref}
          placeholder='Empty tag'
          value={item.value}
          onChange={(event) => update(event.target.value)}
        />
      )}
    />
  );
}

export const textListCase: CaseSpec<Items> = {
  id: 'list-text',
  title: 'List of text',
  note: 'Every list adds, removes and reorders the same way. Drag the handle, or focus it and press the arrow keys.',
  labelling: 'group',
  label: 'Tags',
  overflowLabel: 'Tags, used for related posts and the search filters',
  empty: [],
  filled: TAGS,
  overflow: [
    ...TAGS,
    newItem('Content modelling for multilingual sites with shared components'),
    newItem('Media'),
    newItem('Search'),
  ],
  invalid: [TAGS[0], newItem('')],
  dirty: [TAGS[0], { ...TAGS[1], value: 'Visual editing basics' }, TAGS[2]],
  required: true,
  validate: (items, required) =>
    required && items.length === 0 ? ['Add at least one tag.'] : [],
  Control: TagsControl,
};

const WIDTH_LIMITS = { min: 1, max: 4 };
const WIDTH_NOUNS = { one: 'width', many: 'widths' };
const WIDTHS: Items = ['640', '960', '1280', '1920'].map(newItem);

function WidthsControl({
  control,
  flags,
  value,
  onChange,
  onBlur,
}: CaseControlProps<Items>) {
  return (
    <ValueList
      control={control}
      flags={flags}
      items={value}
      onChange={onChange}
      onBlur={onBlur}
      limits={WIDTH_LIMITS}
      nouns={WIDTH_NOUNS}
      describe={(width) => width}
      makeEmpty={() => ''}
      itemError={(width) =>
        Number.isNaN(Number.parseFloat(width))
          ? 'Enter a number, or remove it.'
          : undefined
      }
      parse={(text) => text}
      inputType='number'
      renderInput={(item, { ref, ...input }, update) => (
        <input
          {...input}
          ref={ref}
          type='number'
          inputMode='numeric'
          className={`${input.className} tabular-nums`}
          value={item.value}
          onChange={(event) => update(event.target.value)}
        />
      )}
    />
  );
}

export const numberListCase: CaseSpec<Items> = {
  id: 'list-number-limits',
  title: 'List of numbers, at its limits',
  note: 'From 1 to 4 widths. At a limit, the actions that would break it turn off and say why.',
  labelling: 'group',
  label: 'Image widths (px)',
  empty: [],
  filled: WIDTHS,
  invalid: [WIDTHS[0], newItem('')],
  dirty: [WIDTHS[0], WIDTHS[1], { ...WIDTHS[2], value: '1440' }, WIDTHS[3]],
  required: true,
  validate: (items) =>
    items.length < WIDTH_LIMITS.min
      ? [`Add at least ${WIDTH_LIMITS.min} width.`]
      : [],
  doesNotApply: {
    overflow: 'At most 4 widths, each a short number.',
  },
  Control: WidthsControl,
};

export const listCases = [defineCase(textListCase), defineCase(numberListCase)];
