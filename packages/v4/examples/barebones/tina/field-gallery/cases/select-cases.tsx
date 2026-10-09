import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@tinacms/ui/components/combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tinacms/ui/components/select';
import { cn } from '@tinacms/ui/lib/utils';
import { type CaseControlProps, type CaseSpec, defineCase } from '../case-row';
import { groupControlClasses, triggerControlClasses } from '../field-frame';

interface Option {
  value: string;
  label: string;
}

const CATEGORIES: Option[] = [
  { value: 'guide', label: 'Guide' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'release-notes', label: 'Release notes' },
  { value: 'case-study', label: 'Case study' },
];
const LONG_CATEGORY: Option = {
  value: 'upgrade',
  label: 'Release notes and upgrade guides for self-hosted teams',
};
const NONE: Option = { value: '', label: 'None' };

const leftField = (event: React.FocusEvent) => {
  const next = event.relatedTarget;
  return !(next instanceof Element && next.closest('[data-slot$=-content]'));
};

function DropdownControl({
  control,
  flags,
  value,
  onChange,
  onBlur,
}: CaseControlProps<string | null>) {
  const options = [...CATEGORIES, LONG_CATEGORY];
  const items = flags.required ? options : [NONE, ...options];
  return (
    <Select
      items={items}
      value={value}
      onValueChange={(next) => onChange(next ? String(next) : null)}
      disabled={control.disabled}
      readOnly={control.readOnly}
    >
      <SelectTrigger
        {...control}
        className={cn('w-full min-w-0', triggerControlClasses)}
        onBlur={(event) => {
          if (leftField(event)) onBlur();
        }}
      >
        <SelectValue placeholder='Choose a category' />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export const dropdownCase: CaseSpec<string | null> = {
  id: 'select-dropdown',
  title: 'Dropdown',
  note: 'The default. An optional field adds "None" to the list.',
  label: 'Category',
  overflowLabel: 'Category, used to group posts on the blog index',
  empty: null,
  filled: 'tutorial',
  overflow: LONG_CATEGORY.value,
  required: true,
  validate: (value, required) =>
    required && !value ? ['Choose a category.'] : [],
  Control: DropdownControl,
};

const FORMATS: Option[] = [
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Video' },
  { value: 'podcast', label: 'Podcast episode' },
];

const radioClasses = [
  'peer mt-0.5 size-4 shrink-0 cursor-pointer appearance-none rounded-full border border-input bg-card outline-none',
  'hover:border-(--input-hover) focus-visible:border-ring focus-visible:shadow-[0_0_0_3px_var(--focus-glow)] in-data-[force=hover]:border-(--input-hover) in-data-[force=focus]:checked:shadow-[0_0_0_3px_var(--focus-glow)]',
  'checked:border-primary checked:bg-[radial-gradient(circle,var(--primary)_0_3.5px,var(--card)_4px)] checked:hover:border-primary-hover checked:hover:bg-[radial-gradient(circle,var(--primary-hover)_0_3.5px,var(--card)_4px)] in-data-[force=hover]:checked:border-primary-hover in-data-[force=hover]:checked:bg-[radial-gradient(circle,var(--primary-hover)_0_3.5px,var(--card)_4px)]',
  'disabled:cursor-not-allowed disabled:border-border disabled:bg-card disabled:hover:border-border disabled:checked:border-border disabled:checked:bg-[radial-gradient(circle,var(--muted-foreground)_0_3.5px,var(--card)_4px)] disabled:checked:hover:border-border disabled:checked:hover:bg-[radial-gradient(circle,var(--muted-foreground)_0_3.5px,var(--card)_4px)]',
].join(' ');

// Read-only keeps the radio shape but drops the call to act: the chosen dot
// takes the read-only checkbox look, and the other circles fade back.
function ReadOnlyDot({ chosen }: { chosen: boolean }) {
  return chosen ? (
    <span className='flex size-4 items-center justify-center rounded-full border border-border bg-muted'>
      <span className='size-1.5 rounded-full bg-foreground' />
    </span>
  ) : (
    <span className='size-4 rounded-full border border-border-subtle' />
  );
}

function RadioControl({
  control,
  value,
  onChange,
  onBlur,
}: CaseControlProps<string | null>) {
  const { id, disabled, readOnly, ...groupProps } = control;
  return (
    <div
      {...groupProps}
      role='radiogroup'
      aria-readonly={readOnly ? true : undefined}
      aria-disabled={disabled ? true : undefined}
      className='grid gap-2'
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onBlur();
      }}
    >
      {FORMATS.map((option, index) => (
        <label
          key={option.value}
          className={cn(
            'flex cursor-pointer items-start gap-2 text-sm has-disabled:cursor-not-allowed has-disabled:opacity-60',
            readOnly
              ? 'cursor-default rounded-xs has-focus-visible:focus-ring'
              : null,
            readOnly && value !== option.value ? 'text-muted-foreground' : null
          )}
        >
          <input
            type='radio'
            id={index === 0 ? id : undefined}
            name={id}
            value={option.value}
            checked={value === option.value}
            disabled={disabled}
            className={readOnly ? 'peer sr-only' : radioClasses}
            onChange={() => {
              if (!readOnly) onChange(option.value);
            }}
          />
          {readOnly ? (
            <span className='mt-0.5 flex size-4 shrink-0 items-center justify-center'>
              <ReadOnlyDot chosen={value === option.value} />
            </span>
          ) : null}
          <span className='min-w-0 break-words'>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

export const radioCase: CaseSpec<string | null> = {
  id: 'select-radio',
  title: 'Radio buttons',
  notInV4: true,
  note: 'The schema author picks radio buttons when every option should be visible at once.',
  labelling: 'group',
  label: 'Format',
  overflowLabel: 'Format, shown as a badge on the post card',
  empty: null,
  filled: 'video',
  required: true,
  validate: (value, required) =>
    required && !value ? ['Choose a format.'] : [],
  Control: RadioControl,
};

const TOPICS: Option[] = [
  { value: 'editing', label: 'Editing' },
  { value: 'media', label: 'Media' },
  { value: 'search', label: 'Search' },
  { value: 'deployment', label: 'Deployment' },
  { value: 'self-hosting', label: 'Self-hosting' },
  { value: 'authentication', label: 'Authentication' },
];

const inOptionOrder = (values: string[]) =>
  TOPICS.filter((topic) => values.includes(topic.value)).map((t) => t.value);

function MultiSelectControl({
  control,
  value,
  onChange,
  onBlur,
}: CaseControlProps<string[]>) {
  const anchor = useComboboxAnchor();
  const selected = TOPICS.filter((topic) => value.includes(topic.value));
  return (
    <Combobox
      multiple
      items={TOPICS}
      value={selected}
      onValueChange={(next: Option[]) =>
        onChange(inOptionOrder(next.map((option) => option.value)))
      }
      disabled={control.disabled}
      readOnly={control.readOnly}
    >
      <ComboboxChips
        ref={anchor}
        className={cn('w-full min-w-0', groupControlClasses)}
      >
        <ComboboxValue>
          {(chosen: Option[]) =>
            chosen.map((option) => (
              <ComboboxChip
                key={option.value}
                showRemove={!control.disabled && !control.readOnly}
                className={
                  control.readOnly ? 'bg-card ring-1 ring-border' : undefined
                }
              >
                {option.label}
              </ComboboxChip>
            ))
          }
        </ComboboxValue>
        <ComboboxChipsInput
          {...control}
          className='w-0'
          placeholder={selected.length > 0 ? '' : 'Choose topics'}
          onBlur={onBlur}
        />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No topics match.</ComboboxEmpty>
        <ComboboxList>
          {(option: Option) => (
            <ComboboxItem key={option.value} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export const multiSelectCase: CaseSpec<string[]> = {
  id: 'select-multi',
  title: 'Multi-select',
  notInV4: true,
  note: 'Chosen values keep the order of the options list, not the order they were picked in.',
  label: 'Topics',
  overflowLabel: 'Topics, used for related posts and the search filters',
  empty: [],
  filled: ['editing', 'media'],
  overflow: TOPICS.map((topic) => topic.value),
  required: true,
  validate: (value, required) =>
    required && value.length === 0 ? ['Choose at least one topic.'] : [],
  Control: MultiSelectControl,
};

export const selectCases = [
  defineCase(dropdownCase),
  defineCase(radioCase),
  defineCase(multiSelectCase),
];
