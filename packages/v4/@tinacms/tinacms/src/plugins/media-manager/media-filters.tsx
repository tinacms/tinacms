import {
  Segmented,
  type SegmentedOption,
} from '@tinacms/ui/components/segmented';
import { LayoutGridIcon, ListIcon } from 'lucide-react';
import type { MediaViewMode } from './media-types';

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
