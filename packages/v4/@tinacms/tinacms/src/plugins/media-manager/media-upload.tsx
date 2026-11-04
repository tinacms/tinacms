import { buttonVariants } from '@tinacms/ui/components/button';
import { Icon } from '@tinacms/ui/components/icon';
import { cn } from '@tinacms/ui/lib/utils';
import { CloudUploadIcon } from 'lucide-react';

export function MediaUploadButton({
  uploading,
  accept,
  onUpload,
}: {
  uploading: boolean;
  accept: string;
  onUpload: (files: File[]) => void;
}) {
  return (
    <label className='inline-flex cursor-pointer'>
      <input
        type='file'
        multiple
        className='peer sr-only'
        accept={accept}
        disabled={uploading}
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          event.target.value = '';
          if (files.length > 0) onUpload(files);
        }}
      />
      <span
        className={cn(
          buttonVariants({ variant: 'primary' }),
          'peer-focus:shadow-focus-ring peer-disabled:cursor-not-allowed peer-disabled:opacity-50'
        )}
      >
        {uploading ? 'Uploading…' : 'Upload'}
        <Icon glyph={CloudUploadIcon} size={16} />
      </span>
    </label>
  );
}
