import { Button } from '@tinacms/ui/components/button';
import { Icon } from '@tinacms/ui/components/icon';
import { cn } from '@tinacms/ui/lib/utils';
import { GripVerticalIcon, ReplaceIcon } from 'lucide-react';
import { type KeyboardEvent, type ReactNode, type Ref, useEffect } from 'react';
import { mediaNameOf } from '../../media-manager/media-types';
import type { ImageCoverLook } from './image-field.schema';
import { PREVIEW_SIZE, useImagePreview } from './image-preview';

export type ImageTileLook = ImageCoverLook | 'default' | 'square';

export const tileShape = {
  default: 'aspect-3/2',
  wide: 'aspect-video',
  tall: 'aspect-4/3',
  square: 'aspect-square',
} as const satisfies Record<ImageTileLook, string>;

export const tileCap = {
  default: 'max-w-xs',
  wide: 'max-w-2xl',
  tall: 'max-w-xl',
  square: undefined,
} as const satisfies Record<ImageTileLook, string | undefined>;

export type ResolveImageUrl = (
  path: string,
  size: typeof PREVIEW_SIZE
) => string;

export interface ImageTileProps {
  path: string | null;
  placeholder?: string;
  resolveUrl: ResolveImageUrl;
  look?: ImageTileLook;
  invalid?: boolean;
  inert?: boolean;
  missing?: boolean;
  onMissingChange?: (missing: boolean) => void;
  previewKey?: number;
  busy?: boolean;
  fallbackName?: string;
  onReplace?: () => void;
  onRemove?: () => void;
  replaceRef?: Ref<HTMLButtonElement>;
  lifted?: boolean;
  dropTarget?: boolean;
  handle?: ReactNode;
  /** A muted line under the file name, such as the name an upload was saved under. */
  note?: string;
  /** The words on the veil while a file uploads to this tile, such as "Uploading 40%". */
  veil?: string;
  /** The words over the picture while a file is dragged over it. */
  dropLabel?: string;
  /** The picture of the file that uploads, shown while the tile has no path. */
  localSrc?: string;
}

export function ImageTile({
  path,
  placeholder,
  resolveUrl,
  look = 'default',
  invalid,
  inert,
  missing: forcedMissing,
  onMissingChange,
  previewKey,
  busy,
  fallbackName = 'image',
  onReplace,
  onRemove,
  replaceRef,
  lifted,
  dropTarget,
  handle,
  note,
  veil,
  dropLabel,
  localSrc,
}: ImageTileProps) {
  const preview = useImagePreview(path, resolveUrl, previewKey);
  const missing = path === null || forcedMissing || preview.missing;
  const name = path === null ? fallbackName : mediaNameOf(path);

  useEffect(() => {
    onMissingChange?.(path !== null && (forcedMissing || preview.missing));
  }, [path, forcedMissing, preview.missing, onMissingChange]);

  return (
    <figure
      data-slot='image-tile'
      data-lifted={lifted ? 'true' : undefined}
      className={cn(
        'm-0 flex w-full min-w-0 flex-col gap-1 transition select-none',
        tileCap[look],
        lifted && 'opacity-60'
      )}
    >
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-sm border bg-muted transition',
          tileShape[look],
          invalid && 'border-destructive',
          dropTarget && 'border-primary bg-selected',
          dropLabel !== undefined && !invalid && 'border-primary'
        )}
      >
        {path === null && veil !== undefined ? (
          localSrc ? (
            <img
              src={localSrc}
              alt=''
              draggable={false}
              className='size-full object-cover'
            />
          ) : null
        ) : missing ? (
          <span className='flex size-full items-center justify-center text-muted-foreground'>
            <Icon glyph='image-missing' size={20} />
          </span>
        ) : (
          <img
            src={preview.src ?? undefined}
            alt={name}
            draggable={false}
            hidden={!preview.loaded}
            className='size-full object-cover'
            onLoad={preview.onLoad}
            onError={preview.onError}
          />
        )}
        {veil !== undefined ? (
          <TileOverlay>
            <Icon glyph='spinner' size={20} />
            <span>{veil}</span>
          </TileOverlay>
        ) : dropLabel !== undefined ? (
          <TileOverlay>
            <span>{dropLabel}</span>
          </TileOverlay>
        ) : null}
        {handle ? (
          <div data-handle='' className='absolute bottom-2 left-2'>
            {handle}
          </div>
        ) : null}
        {inert ? null : (
          <div className='absolute top-2 right-2 flex gap-1'>
            {onReplace ? (
              <Button
                ref={replaceRef}
                variant='icon'
                size='sm'
                icon={ReplaceIcon}
                disabled={busy}
                className={cn(
                  'bg-card shadow-xs',
                  look === 'square' && 'size-6'
                )}
                onClick={onReplace}
              >
                {`Replace ${name}`}
              </Button>
            ) : null}
            {onRemove ? (
              <Button
                variant='icon'
                size='sm'
                destructive
                disabled={busy}
                className={cn(
                  'bg-card shadow-xs',
                  look === 'square' && 'size-6'
                )}
                onClick={onRemove}
              >
                {`Remove ${name}`}
              </Button>
            ) : null}
          </div>
        )}
      </div>
      <figcaption
        title={path ?? placeholder}
        className='truncate text-xs text-muted-foreground'
      >
        {path === null ? placeholder : missing ? 'File not found' : name}
      </figcaption>
      {note ? (
        <p className='m-0 text-xs text-muted-foreground [overflow-wrap:anywhere]'>
          {note}
        </p>
      ) : null}
    </figure>
  );
}

function TileOverlay({ children }: { children: ReactNode }) {
  return (
    <div className='absolute inset-0 flex flex-col items-center justify-center gap-1 bg-card/80 p-2 text-center text-sm font-medium [overflow-wrap:anywhere]'>
      {children}
    </div>
  );
}

export function MoveHandle({
  label,
  ref,
  onKeyDown,
}: {
  label: string;
  ref?: Ref<HTMLButtonElement>;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}) {
  return (
    <Button
      ref={ref}
      variant='icon'
      size='sm'
      icon={GripVerticalIcon}
      aria-label={label}
      className='size-6 cursor-grab touch-none bg-card shadow-xs'
      onKeyDown={onKeyDown}
    />
  );
}
