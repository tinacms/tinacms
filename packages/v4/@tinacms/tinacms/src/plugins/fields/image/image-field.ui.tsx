import { Button, buttonVariants } from '@tinacms/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@tinacms/ui/components/dialog';
import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import { cn } from '@tinacms/ui/lib/utils';
import { CloudUploadIcon, ImageIcon, ImageOffIcon } from 'lucide-react';
import { type DragEvent, useEffect, useRef, useState } from 'react';
import { hasValidator } from '../../../core/schema/types';
import {
  useFieldActivation,
  useFieldAddress,
  useFieldErrors,
  useFieldSchema,
  useFieldValue,
  useMediaSlice,
} from '../../../editor';
import { MediaBrowser } from '../../media-manager/media-browser';
import { checkerboardStyle } from '../../media-manager/media-grid';
import {
  extensionsForCategory,
  inputAcceptOf,
  mediaNameOf,
  uploadRejectionOf,
  uploadRulesOf,
} from '../../media-manager/media-types';
import type { ImageFieldSchema } from './image-field.schema';

const IMAGE_UPLOAD_RULES = uploadRulesOf(extensionsForCategory('image'));

// A just-uploaded file can 404 until the dev server or CDN sees it, and the
// browser caches that 404 for the URL. Each retry asks for a new URL.
const RETRY_DELAYS_MS = [500, 1000, 2000];

const withRetry = (url: string, attempt: number): string =>
  attempt === 0
    ? url
    : `${url}${url.includes('?') ? '&' : '?'}retry=${attempt}`;

const messageOf = (cause: unknown): string => {
  if (cause instanceof Error) {
    return cause.message;
  } else {
    return String(cause);
  }
};

export function ImageField() {
  const address = useFieldAddress();
  const field = useFieldSchema<ImageFieldSchema>();
  const [value, setValue] = useFieldValue<unknown>(address);
  const path = typeof value === 'string' ? value : null;
  const notAPath = value != null && path === null;
  const errors = useFieldErrors(address);
  const media = useMediaSlice();
  const mainButtonRef = useRef<HTMLButtonElement>(null);
  const retryTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [picking, setPicking] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [failure, setFailure] = useState<{
    path: string;
    count: number;
  } | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  useFieldActivation(() => mainButtonRef.current?.focus());
  useEffect(() => () => clearTimeout(retryTimer.current), []);

  const features = media.features ?? {};
  const canUpload = features.readOnly !== true;
  const failures = path !== null && failure?.path === path ? failure.count : 0;
  const missing = notAPath || failures > RETRY_DELAYS_MS.length;
  const thumbnailSrc =
    path === null
      ? null
      : withRetry(
          media.resolveUrl(path, { width: 400, height: 400 }),
          failures
        );

  const store = (path: string) => {
    clearTimeout(retryTimer.current);
    setFailure(null);
    setValue(path);
  };

  const imageFailed = (path: string) => {
    const next = { path, count: failures + 1 };
    const delay = RETRY_DELAYS_MS[failures];
    if (delay === undefined) {
      setFailure(next);
    } else {
      retryTimer.current = setTimeout(() => setFailure(next), delay);
    }
  };

  const upload = async (file: File) => {
    const rejection = uploadRejectionOf(
      file,
      IMAGE_UPLOAD_RULES,
      features.maxSize
    );
    if (rejection) {
      setUploadError(`${file.name}: ${rejection}`);
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      store(await media.upload(file));
    } catch (cause) {
      setUploadError(messageOf(cause));
    } finally {
      setUploading(false);
    }
  };

  const dragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!canUpload) return;
    event.preventDefault();
    setDragging(true);
  };

  const dragLeave = (event: DragEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    setDragging(false);
  };

  const drop = (event: DragEvent<HTMLDivElement>) => {
    if (!canUpload) return;
    event.preventDefault();
    setDragging(false);
    const [file] = event.dataTransfer.files;
    if (file && !uploading) void upload(file);
  };

  const choose = () => {
    setUploadError(null);
    setPicking(true);
  };

  return (
    <FieldWrapper errors={uploadError ? [...errors, uploadError] : errors}>
      <div
        role='group'
        aria-labelledby={`${address}-label`}
        data-dragging={dragging ? 'true' : undefined}
        className={cn(
          'flex flex-col gap-2 rounded-sm border p-2 transition',
          value == null ? 'border-dashed' : null,
          dragging ? 'border-orange-500' : null
        )}
        onDragEnter={dragOver}
        onDragOver={dragOver}
        onDragLeave={dragLeave}
        onDrop={drop}
      >
        <div className='flex min-w-0 items-center gap-3'>
          {value == null ? (
            <>
              <ImageIcon
                aria-hidden='true'
                className='size-6 shrink-0 text-muted-foreground'
              />
              <span className='text-sm text-muted-foreground'>
                {canUpload ? 'Drop an image here' : 'No image'}
              </span>
            </>
          ) : (
            <>
              {missing ? (
                <span className='flex size-16 shrink-0 items-center justify-center rounded-sm border bg-muted/50'>
                  <ImageOffIcon
                    aria-hidden='true'
                    className='size-6 text-muted-foreground'
                  />
                </span>
              ) : (
                <span
                  style={checkerboardStyle}
                  className='size-16 shrink-0 overflow-hidden rounded-sm border'
                >
                  <img
                    src={thumbnailSrc ?? undefined}
                    alt={path === null ? '' : mediaNameOf(path)}
                    hidden={loadedSrc !== thumbnailSrc}
                    className='size-full object-cover'
                    onLoad={() => setLoadedSrc(thumbnailSrc)}
                    onError={() => path !== null && imageFailed(path)}
                  />
                </span>
              )}
              <span
                className='min-w-0 flex-1 truncate text-sm'
                title={path ?? undefined}
              >
                {path === null
                  ? 'Not a media path'
                  : missing
                    ? `${path} (missing)`
                    : mediaNameOf(path)}
              </span>
            </>
          )}
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <Button
            ref={mainButtonRef}
            type='button'
            variant='toolbar'
            size='sm'
            disabled={uploading}
            onClick={choose}
          >
            {value == null ? 'Choose image' : 'Replace'}
          </Button>
          {canUpload ? (
            <label className='inline-flex cursor-pointer'>
              <input
                type='file'
                className='peer sr-only'
                accept={inputAcceptOf(IMAGE_UPLOAD_RULES)}
                disabled={uploading}
                onChange={(event) => {
                  const [file] = event.target.files ?? [];
                  event.target.value = '';
                  if (file) void upload(file);
                }}
              />
              <span
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'peer-focus:shadow-focus-ring peer-disabled:cursor-not-allowed peer-disabled:opacity-50'
                )}
              >
                {uploading ? 'Uploading…' : 'Upload'}
                <CloudUploadIcon aria-hidden='true' className='size-4' />
              </span>
            </label>
          ) : null}
          {value == null || hasValidator(field, 'required') ? null : (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              disabled={uploading}
              onClick={() => {
                setUploadError(null);
                setValue(null);
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
      <Dialog open={picking} onOpenChange={setPicking}>
        <DialogContent
          finalFocus={mainButtonRef}
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
    </FieldWrapper>
  );
}
