import { Popover } from '@base-ui/react/popover';
import { Button } from '@tinacms/ui/components/button';
import { cn } from '@tinacms/ui/lib/utils';
import { useState } from 'react';

export interface ImageValue {
  src: string;
  name: string;
  alt: string;
  decorative: boolean;
}

// Stand-in pictures for the stand-in Media library: flat landscapes in a few
// colour pairs, drawn as SVG so the example needs no image files.
const picture = (sky: string, land: string, sun: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 100'><rect width='160' height='100' fill='${sky}'/><circle cx='120' cy='30' r='12' fill='${sun}'/><path d='M0 75 L45 40 L80 70 L110 50 L160 80 V100 H0Z' fill='${land}'/></svg>`
  )}`;

export const MEDIA = [
  { name: 'mountains.jpg', src: picture('#cbd5e1', '#64748b', '#f8fafc') },
  { name: 'sunset-beach.jpg', src: picture('#fed7aa', '#c2410c', '#fff7ed') },
  { name: 'forest-trail.jpg', src: picture('#bbf7d0', '#15803d', '#f0fdf4') },
  { name: 'city-at-night.jpg', src: picture('#1e293b', '#475569', '#fde68a') },
  { name: 'team-offsite.jpg', src: picture('#e0e7ff', '#4338ca', '#fef3c7') },
  { name: 'desert-road.jpg', src: picture('#fde68a', '#b45309', '#fffbeb') },
];

export const imageOf = (index: number, alt = ''): ImageValue => ({
  ...MEDIA[index],
  alt,
  decorative: false,
});

export const altWarning = (image: ImageValue | null) =>
  image && !image.decorative && image.alt.trim() === ''
    ? 'Add alt text, or mark the image as decorative.'
    : undefined;

// The Media library in pick mode. It picks one image, or several in the order
// they are clicked.
export function MediaPicker({
  open,
  anchor,
  multiple,
  onPick,
  onClose,
}: {
  open: boolean;
  anchor: HTMLElement | null;
  multiple?: boolean;
  onPick: (images: ImageValue[]) => void;
  onClose: () => void;
}) {
  const [chosen, setChosen] = useState<number[]>([]);
  const close = () => {
    setChosen([]);
    onClose();
  };
  const toggle = (index: number) =>
    setChosen(
      chosen.includes(index)
        ? chosen.filter((other) => other !== index)
        : [...chosen, index]
    );
  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <Popover.Portal>
        <Popover.Positioner
          anchor={anchor}
          side='bottom'
          align='start'
          sideOffset={4}
          collisionAvoidance={{ side: 'flip', fallbackAxisSide: 'none' }}
          className='isolate z-50'
        >
          <Popover.Popup
            data-slot='media-content'
            className='grid max-h-(--available-height) w-(--anchor-width) min-w-80 gap-2 overflow-y-auto rounded-md bg-popover p-2 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none'
          >
            <Popover.Title className='px-1 text-xs font-medium text-muted-foreground'>
              {multiple
                ? 'Choose images from Media'
                : 'Choose an image from Media'}
            </Popover.Title>
            <div className='grid grid-cols-3 gap-2'>
              {MEDIA.map((image, index) => {
                const order = chosen.indexOf(index);
                return (
                  <button
                    key={image.name}
                    type='button'
                    aria-pressed={multiple ? order >= 0 : undefined}
                    onClick={() =>
                      multiple
                        ? toggle(index)
                        : onPick([{ ...image, alt: '', decorative: false }])
                    }
                    className={cn(
                      'relative grid cursor-pointer gap-1 rounded-sm p-1 text-left outline-none hover:bg-muted focus-visible:focus-ring',
                      order >= 0 ? 'bg-muted ring-2 ring-foreground' : null
                    )}
                  >
                    <img
                      src={image.src}
                      alt=''
                      className='aspect-[16/10] w-full rounded-xs object-cover'
                    />
                    <span className='truncate text-xs'>{image.name}</span>
                    {order >= 0 ? (
                      <span className='absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background'>
                        {order + 1}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            {multiple ? (
              <div className='flex items-center justify-end gap-2 border-t border-border-subtle pt-2'>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='cursor-pointer'
                  onClick={close}
                >
                  Cancel
                </Button>
                <Button
                  type='button'
                  size='sm'
                  className='cursor-pointer'
                  disabled={chosen.length === 0}
                  onClick={() => {
                    onPick(
                      chosen.map((index) => ({
                        ...MEDIA[index],
                        alt: '',
                        decorative: false,
                      }))
                    );
                    setChosen([]);
                  }}
                >
                  {chosen.length > 1
                    ? `Add ${chosen.length} images`
                    : 'Add image'}
                </Button>
              </div>
            ) : null}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
