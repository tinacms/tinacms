import { Button } from '@tinacms/ui/components/button';
import { useRef } from 'react';
import { UploadIcon } from './media-icons';
import { type UploadRules, inputAcceptOf } from './media-types';

export function MediaUploadButton({
  uploading,
  rules,
  onUpload,
}: {
  uploading: boolean;
  rules: UploadRules;
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
        accept={inputAcceptOf(rules)}
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
