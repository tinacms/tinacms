import { Button } from '@tinacms/ui/components/button';
import { useRef } from 'react';
import { UploadIcon } from './media-icons';

export function MediaUploadButton({
  uploading,
  accept,
  onUpload,
}: {
  uploading: boolean;
  accept: string[];
  onUpload: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={inputRef}
        type='file'
        multiple
        hidden
        accept={accept.join(',')}
        aria-label='Choose files to upload'
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          event.target.value = '';
          if (files.length > 0) onUpload(files);
        }}
      />
      <Button
        type='button'
        disabled={uploading}
        aria-busy={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? 'Uploading…' : 'Upload'}
        <UploadIcon className='size-4' />
      </Button>
    </>
  );
}
