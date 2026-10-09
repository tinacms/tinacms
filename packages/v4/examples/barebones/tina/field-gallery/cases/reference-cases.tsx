import { Button } from '@tinacms/ui/components/button';
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from '@tinacms/ui/components/combobox';
import { cn } from '@tinacms/ui/lib/utils';
import { type CaseControlProps, type CaseSpec, defineCase } from '../case-row';
import { groupControlClasses } from '../field-frame';

interface ReferencedDocument {
  value: string;
  label: string;
  collection: string;
}

interface CollectionGroup {
  value: string;
  items: ReferencedDocument[];
}

const doc = (
  collection: string,
  path: string,
  title?: string
): ReferencedDocument => ({ value: path, label: title ?? path, collection });

const AUTHORS: CollectionGroup = {
  value: 'Authors',
  items: [
    doc('Authors', 'content/authors/ada.md', 'Ada Lovelace'),
    doc('Authors', 'content/authors/grace.md', 'Grace Hopper'),
    doc(
      'Authors',
      'content/authors/margaret.md',
      'Margaret Hamilton, Director of Software Engineering at the MIT Instrumentation Laboratory'
    ),
    doc('Authors', 'content/authors/alan.md'),
  ],
};

const POSTS: CollectionGroup = {
  value: 'Posts',
  items: [
    doc(
      'Posts',
      'content/posts/getting-started.mdx',
      'Getting started with TinaCMS'
    ),
    doc(
      'Posts',
      'content/posts/visual-editing.mdx',
      'Visual editing, explained'
    ),
  ],
};

const PAGES: CollectionGroup = {
  value: 'Pages',
  items: [
    doc('Pages', 'content/pages/about.mdx', 'About us'),
    doc('Pages', 'content/pages/contact.mdx', 'Contact'),
  ],
};

const findDocument = (groups: CollectionGroup[], path: string | null) =>
  groups.flatMap((group) => group.items).find((item) => item.value === path);

function OpenIcon() {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 16 16'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M6 3.5H3.5v9h9V10M9 3.5h3.5V7M12.5 3.5 7 9' />
    </svg>
  );
}

function DocumentItem({ item }: { item: ReferencedDocument }) {
  return (
    <ComboboxItem value={item}>
      <span className='grid min-w-0'>
        <span className='break-words'>{item.label}</span>
        <span className='truncate text-xs text-muted-foreground'>
          {item.collection} · {item.value}
        </span>
      </span>
    </ComboboxItem>
  );
}

function makeReferenceControl(groups: CollectionGroup[]) {
  const grouped = groups.length > 1;
  return function ReferenceControl({
    control,
    flags,
    value,
    onChange,
    onBlur,
  }: CaseControlProps<string | null>) {
    const found = findDocument(groups, value);
    const missing: ReferencedDocument | null =
      value && !found ? { value, label: value, collection: 'Missing' } : null;
    const selected = found ?? missing;
    const items = grouped
      ? groups
      : [...(missing ? [missing] : []), ...groups[0].items];
    return (
      <div className='flex min-w-0 items-center gap-1'>
        <Combobox
          items={items}
          value={selected}
          onValueChange={(next: ReferencedDocument | null) =>
            onChange(next?.value ?? null)
          }
          disabled={control.disabled}
          readOnly={control.readOnly}
        >
          <ComboboxInput
            {...control}
            className={cn(
              'w-full min-w-0',
              control.readOnly
                ? '[&_[data-slot=input-group-button]]:hidden!'
                : null,
              groupControlClasses
            )}
            showClear={
              !flags.required &&
              !control.readOnly &&
              !control.disabled &&
              value !== null
            }
            placeholder={
              control.disabled ? 'Loading documents…' : 'Search documents…'
            }
            onBlur={onBlur}
          />
          <ComboboxContent>
            <ComboboxEmpty>No documents match.</ComboboxEmpty>
            <ComboboxList>
              {grouped
                ? (group: CollectionGroup) => (
                    <ComboboxGroup key={group.value} items={group.items}>
                      <ComboboxLabel>{group.value}</ComboboxLabel>
                      <ComboboxCollection>
                        {(item: ReferencedDocument) => (
                          <DocumentItem key={item.value} item={item} />
                        )}
                      </ComboboxCollection>
                    </ComboboxGroup>
                  )
                : (item: ReferencedDocument) => (
                    <DocumentItem key={item.value} item={item} />
                  )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        {found ? (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            aria-label={`Open ${found.label}`}
            className='cursor-pointer'
            disabled={control.disabled}
          >
            <OpenIcon />
          </Button>
        ) : null}
      </div>
    );
  };
}

export const documentTitle = (path: string | null) =>
  findDocument([AUTHORS, POSTS, PAGES], path)?.label;

const requiredAuthor = (value: string | null, required: boolean) =>
  required && !value ? ['Choose an author.'] : [];

export const oneCollectionCase: CaseSpec<string | null> = {
  id: 'reference-one',
  title: 'One collection',
  note: 'Shows each document by its title, with the collection and path underneath. A document with no title shows its path.',
  label: 'Author',
  overflowLabel: 'Author, shown in the byline and on the author page',
  empty: null,
  filled: 'content/authors/ada.md',
  overflow: 'content/authors/margaret.md',
  required: true,
  validate: requiredAuthor,
  Control: makeReferenceControl([AUTHORS]),
};

export const severalCollectionsCase: CaseSpec<string | null> = {
  id: 'reference-several',
  title: 'Several collections',
  note: 'The list groups documents under their collection. Search looks in every collection.',
  label: 'Related content',
  overflowLabel: 'Related content, shown at the end of the post',
  empty: null,
  filled: 'content/pages/about.mdx',
  overflow: 'content/posts/getting-started.mdx',
  required: true,
  validate: (value, required) =>
    required && !value ? ['Choose a document.'] : [],
  Control: makeReferenceControl([POSTS, PAGES]),
};

const MISSING_PATH = 'content/authors/charles-babbage.md';

export const missingReferenceCase: CaseSpec<string | null> = {
  id: 'reference-missing',
  title: 'Missing reference',
  note: 'The stored document no longer exists. This is a warning, so saving still works.',
  label: 'Author',
  overflowLabel: 'Author, shown in the byline and on the author page',
  empty: null,
  filled: MISSING_PATH,
  overflow:
    'content/authors/archive/2019/contributors/charles-babbage-analytical-engine.md',
  validate: requiredAuthor,
  warn: (value) =>
    value && !findDocument([AUTHORS], value)
      ? ['This document no longer exists.']
      : [],
  doesNotApply: {
    empty: 'Nothing is missing.',
    invalid: 'A warning, never an error.',
  },
  Control: makeReferenceControl([AUTHORS]),
};

export const referenceCases = [
  defineCase(oneCollectionCase),
  defineCase(severalCollectionsCase),
  defineCase(missingReferenceCase),
];
