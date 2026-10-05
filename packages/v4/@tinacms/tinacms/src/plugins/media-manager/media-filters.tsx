import { Button } from '@tinacms/ui/components/button';
import { Input } from '@tinacms/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tinacms/ui/components/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@tinacms/ui/components/tooltip';
import { cn } from '@tinacms/ui/lib/utils';
import type { MediaViewMode } from './media-grid';
import {
  CloseIcon,
  FileIcon,
  FolderIcon,
  GridIcon,
  ListIcon,
  LockIcon,
  SearchIcon,
} from './media-icons';
import {
  MEDIA_CATEGORY_LABELS,
  MEDIA_CATEGORY_NAMES,
  type MediaAccept,
  type MediaCategory,
  type MediaExtension,
  acceptEntryLabel,
} from './media-types';

export type MediaKindFilter = 'all' | 'folders' | 'files';

export type MediaTypeFilterValue = MediaCategory | 'all';

const segmentClass = (active: boolean) =>
  cn(
    'rounded-none border-0 first:rounded-l-lg last:rounded-r-lg [&:not(:first-child)]:border-l',
    active ? 'bg-background text-primary' : 'bg-muted/50 text-muted-foreground'
  );

export function ViewModeToggle({
  value,
  onChange,
}: {
  value: MediaViewMode;
  onChange: (value: MediaViewMode) => void;
}) {
  return (
    <div role='group' aria-label='View' className='flex rounded-lg border'>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        aria-label='Grid view'
        aria-pressed={value === 'grid'}
        className={segmentClass(value === 'grid')}
        onClick={() => onChange('grid')}
      >
        <GridIcon className='size-4' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        aria-label='List view'
        aria-pressed={value === 'list'}
        className={segmentClass(value === 'list')}
        onClick={() => onChange('list')}
      >
        <ListIcon className='size-4' />
      </Button>
    </div>
  );
}

const KIND_OPTIONS: { value: MediaKindFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'folders', label: 'Folders' },
  { value: 'files', label: 'Files' },
];

export function MediaKindToggle({
  value,
  onChange,
}: {
  value: MediaKindFilter;
  onChange: (value: MediaKindFilter) => void;
}) {
  return (
    <div role='group' aria-label='Show' className='flex rounded-lg border'>
      {KIND_OPTIONS.map((option) => (
        <Button
          key={option.value}
          type='button'
          variant='ghost'
          aria-pressed={value === option.value}
          className={segmentClass(value === option.value)}
          onClick={() => onChange(option.value)}
        >
          {option.value === 'folders' ? (
            <FolderIcon className='size-4' />
          ) : option.value === 'files' ? (
            <FileIcon className='size-4' />
          ) : null}
          {option.label}
        </Button>
      ))}
    </div>
  );
}

export function MediaSearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className='relative flex max-w-md min-w-50 flex-1 items-center'>
      <SearchIcon className='pointer-events-none absolute left-2.5 size-4 text-muted-foreground' />
      <Input
        type='search'
        value={value}
        aria-label='Search media library'
        placeholder='Search this library...'
        className='pr-8 pl-8'
        onChange={(event) => onChange(event.target.value)}
      />
      {value ? (
        <Button
          type='button'
          variant='ghost'
          size='icon-xs'
          aria-label='Clear search'
          className='absolute right-1.5'
          onClick={() => onChange('')}
        >
          <CloseIcon className='size-3' />
        </Button>
      ) : null}
    </div>
  );
}

const TYPE_ITEMS: { value: MediaTypeFilterValue; label: string }[] = [
  { value: 'all', label: 'Any type' },
  ...MEDIA_CATEGORY_NAMES.map((category) => ({
    value: category,
    label: MEDIA_CATEGORY_LABELS[category],
  })),
];

export function MediaTypeFilter({
  value,
  onChange,
}: {
  value: MediaTypeFilterValue;
  onChange: (value: MediaTypeFilterValue) => void;
}) {
  return (
    <Select
      items={TYPE_ITEMS}
      value={value}
      onValueChange={(next) => {
        const item = TYPE_ITEMS.find((option) => option.value === next);
        if (item) onChange(item.value);
      }}
    >
      <SelectTrigger
        aria-label='File type'
        className={value === 'all' ? undefined : 'border-primary text-primary'}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TYPE_ITEMS.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function LockedAcceptChip({
  accept,
  extensions,
}: {
  accept: MediaAccept[];
  extensions: MediaExtension[];
}) {
  const label =
    accept.length > 3
      ? `${accept.length} types only`
      : `${accept.map(acceptEntryLabel).join(', ')} only`;
  const description = `This field accepts ${extensions.join(', ')}`;
  return (
    <Tooltip>
      <TooltipTrigger
        render={<span />}
        className='flex items-center gap-1.5 rounded-lg border border-dashed bg-muted px-3 py-1.5 text-sm whitespace-nowrap text-muted-foreground'
      >
        <LockIcon className='size-3.5' />
        {label}
        <span className='sr-only'>{description}</span>
      </TooltipTrigger>
      <TooltipContent>{description}</TooltipContent>
    </Tooltip>
  );
}
