import { buttonVariants } from '@tinacms/ui/components/button';
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
          buttonVariants(),
          'peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50'
        )}
      >
        {uploading ? 'Uploading…' : 'Upload'}
        <CloudUploadIcon className='size-4' />
      </span>
    </label>
  );
}
