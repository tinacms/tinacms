import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tinacms/ui/components/select';
import { SearchBox } from '@tinacms/ui/components/search-box';
import {
  Segmented,
  type SegmentedOption,
} from '@tinacms/ui/components/segmented';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@tinacms/ui/components/tooltip';
import {
  FileIcon,
  FolderIcon,
  LayoutGridIcon,
  ListIcon,
  LockIcon,
} from 'lucide-react';
import {
  MEDIA_CATEGORY_LABELS,
  MEDIA_KIND_OPTIONS,
  type MediaAccept,
  type MediaCategory,
  type MediaExtension,
  type MediaKindFilter,
  type MediaTypeFilterValue,
  type MediaViewMode,
  acceptEntryLabel,
} from './media-types';

const VIEW_MODE_OPTIONS = [
  { value: 'grid', label: 'Grid view', icon: LayoutGridIcon, iconOnly: true },
  { value: 'list', label: 'List view', icon: ListIcon, iconOnly: true },
] as const satisfies readonly SegmentedOption<MediaViewMode>[];

export function ViewModeToggle({
  value,
  onChange,
}: {
  value: MediaViewMode;
  onChange: (value: MediaViewMode) => void;
}) {
  return (
    <Segmented
      aria-label='View'
      size='sm'
      options={VIEW_MODE_OPTIONS}
      value={value}
      onValueChange={onChange}
    />
  );
}

const KIND_ICONS = { all: undefined, folders: FolderIcon, files: FileIcon };

const KIND_OPTIONS = MEDIA_KIND_OPTIONS.map((option) => ({
  ...option,
  icon: KIND_ICONS[option.value],
}));

export function MediaKindToggle({
  value,
  onChange,
}: {
  value: MediaKindFilter;
  onChange: (value: MediaKindFilter) => void;
}) {
  return (
    <Segmented
      aria-label='Show'
      size='sm'
      options={KIND_OPTIONS}
      value={value}
      onValueChange={onChange}
    />
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
    <SearchBox
      label='Search media library'
      placeholder='Search this library...'
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onClear={() => onChange('')}
      className='max-w-md min-w-50 flex-1'
    />
  );
}

const TYPE_ITEMS: { value: MediaTypeFilterValue; label: string }[] = [
  { value: 'all', label: 'Any type' },
  ...(Object.keys(MEDIA_CATEGORY_LABELS) as MediaCategory[]).map(
    (category) => ({
      value: category,
      label: MEDIA_CATEGORY_LABELS[category],
    })
  ),
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
        className={
          value === 'all'
            ? undefined
            : 'border-primary text-primary hover:border-primary data-popup-open:border-primary'
        }
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
        className='flex items-center gap-1.5 rounded-sm border border-dashed bg-muted px-3 py-1.5 text-sm whitespace-nowrap text-muted-foreground'
      >
        <LockIcon className='size-3.5' />
        {label}
        <span className='sr-only'>{description}</span>
      </TooltipTrigger>
      <TooltipContent>{description}</TooltipContent>
    </Tooltip>
  );
}
