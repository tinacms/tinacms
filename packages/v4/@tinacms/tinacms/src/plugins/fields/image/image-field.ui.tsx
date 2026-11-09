import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@tinacms/ui/components/dialog';
import { useLayoutEffect, useRef, useState } from 'react';
import { hasValidator } from '../../../core/schema/types';
import {
  useFieldActivation,
  useFieldAddress,
  useFieldFrame,
  useFieldSchema,
  useFieldValue,
  useMediaSlice,
} from '../../../editor';
import { useSaveSummary } from '../../../form/form-store';
import { MediaBrowser } from '../../media-manager/media-browser';
import { useImageUpload } from './image-upload';
import type { ImageFieldSchema } from './image-field.schema';
import { ImageFieldView } from './image-field.view';

export function ImageField() {
  const address = useFieldAddress();
  const field = useFieldSchema<ImageFieldSchema>();
  const [value, setValue] = useFieldValue<unknown>(address);
  const path = typeof value === 'string' ? value : null;
  const frame = useFieldFrame();
  const media = useMediaSlice();
  const saving = useSaveSummary().state === 'saving';
  const primaryRef = useRef<HTMLButtonElement>(null);
  const focusAfterRemove = useRef(false);
  const [picking, setPicking] = useState(false);
  const [stored, setStored] = useState(0);
  const store = (next: string) => {
    setStored((count) => count + 1);
    setValue(next);
  };
  const { upload, uploading, uploadError, clearError } = useImageUpload(
    media,
    store
  );

  useFieldActivation(() => primaryRef.current?.focus());
  useLayoutEffect(() => {
    if (focusAfterRemove.current && value == null) {
      focusAfterRemove.current = false;
      primaryRef.current?.focus();
    }
  }, [value]);

  const choose = () => {
    clearError();
    setPicking(true);
  };

  return (
    <>
      <ImageFieldView
        {...frame}
        errors={uploadError ? [...frame.errors, uploadError] : frame.errors}
        path={path}
        notAPath={value != null && path === null}
        look={field.cover}
        resolveUrl={media.resolveUrl}
        primaryRef={primaryRef}
        busy={uploading}
        holdReason={
          saving ? 'Saving. You can upload once it finishes.' : undefined
        }
        previewKey={stored}
        onChoose={choose}
        onReplace={choose}
        onRemove={
          hasValidator(field, 'required')
            ? undefined
            : () => {
                clearError();
                focusAfterRemove.current = true;
                setValue(null);
              }
        }
        onDropFile={media.features?.readOnly === true ? undefined : upload}
      />
      <Dialog open={picking} onOpenChange={setPicking}>
        <DialogContent
          finalFocus={primaryRef}
          className='flex h-[80vh] flex-col gap-0 p-0 max-w-5xl'
        >
          <DialogHeader className='border-b px-4 py-3'>
            <DialogTitle>Choose an image</DialogTitle>
          </DialogHeader>
          <MediaBrowser
            mode='pick'
            accept='image'
            onSelect={(item) => {
              store(item.path);
              setPicking(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
