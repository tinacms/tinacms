import { Button } from '@tinacms/ui/components/button';
import { useEffect, useState } from 'react';
import type { MediaItem, MediaUrlOptions } from '../../core/media/contract';
import { checkerboardStyle } from './media-grid';
import {
  ArrowDownToLineIcon,
  ClapperboardIcon,
  CopyIcon,
  FileIcon,
  TextCursorInputIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import { absoluteUrlOf, isImage, isVideo, mediaNameOf } from './media-types';

const COPIED_FOR_MS = 3000;

function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_FOR_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    setFailure(null);
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch (cause) {
      if (cause instanceof Error) {
        setFailure(`Could not copy the URL: ${cause.message}`);
      } else {
        setFailure(`Could not copy the URL: ${String(cause)}`);
      }
    }
  };

  return (
    <div className='flex w-full flex-col gap-1'>
      <span className='text-sm font-semibold'>URL</span>
      <button
        type='button'
        disabled={copied}
        className='relative flex w-full items-center gap-1.5 overflow-hidden rounded-sm border bg-muted/50 px-3 py-2 text-left text-sm break-all transition hover:bg-background hover:text-primary disabled:pointer-events-none'
        onClick={copy}
      >
        <CopyIcon className='size-4 shrink-0 text-primary' />
        <span className='sr-only'>Copy URL </span>
        {value}
        {copied ? (
          <span className='absolute inset-0 flex items-center justify-center bg-background/90 font-medium text-primary'>
            Copied to clipboard!
          </span>
        ) : null}
      </button>
      <span role='status' className='sr-only'>
        {copied ? 'Copied to clipboard!' : ''}
      </span>
      {failure ? (
        <p role='alert' className='text-sm text-destructive'>
          {failure}
        </p>
      ) : null}
    </div>
  );
}

export function MediaPreview({
  item,
  resolveUrl,
  onClose,
  onInsert,
  onRename,
  onDelete,
}: {
  item: MediaItem;
  resolveUrl: (path: string, options?: MediaUrlOptions) => string;
  onClose: () => void;
  onInsert: ((item: MediaItem) => void) | null;
  onRename: (() => void) | null;
  onDelete: (() => void) | null;
}) {
  const name = mediaNameOf(item.path);
  const Icon = isVideo(name) ? ClapperboardIcon : FileIcon;
  return (
    <aside
      aria-label={`Details of ${name}`}
      className='flex w-[35%] max-w-[560px] min-w-60 shrink-0 flex-col items-start gap-3 overflow-y-auto border-l bg-background p-4 shadow-md'
    >
      <div className='flex w-full items-center justify-between gap-2'>
        <h3 className='flex-1 truncate text-lg' title={name}>
          {name}
        </h3>
        <Button
          type='button'
          variant='ghost'
          size='icon-sm'
          aria-label='Close details'
          onClick={onClose}
        >
          <XIcon className='size-4' />
        </Button>
      </div>
      {isImage(name) ? (
        <img
          src={resolveUrl(item.path, { width: 1000, height: 1000 })}
          alt={name}
          style={checkerboardStyle}
          className='m-auto block max-h-[50vh] max-w-full rounded border object-contain shadow'
        />
      ) : (
        <span className='rounded border bg-muted/50 p-3 shadow'>
          <Icon className='size-14 text-muted-foreground' />
        </span>
      )}
      <CopyField value={absoluteUrlOf(resolveUrl(item.path))} />
      <div className='mt-auto flex w-full flex-wrap gap-2'>
        {onInsert ? (
          <Button type='button' onClick={() => onInsert(item)}>
            <ArrowDownToLineIcon className='size-4' />
            Insert
          </Button>
        ) : null}
        {onRename ? (
          <Button type='button' variant='outline' onClick={onRename}>
            <TextCursorInputIcon className='size-4' />
            Rename
          </Button>
        ) : null}
        {onDelete ? (
          <Button type='button' variant='destructive' onClick={onDelete}>
            <Trash2Icon className='size-4' />
            Delete
          </Button>
        ) : null}
      </div>
    </aside>
  );
}
