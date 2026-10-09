import { Button } from '@tinacms/ui/components/button';
import { Checkbox } from '@tinacms/ui/components/checkbox';
import { cn } from '@tinacms/ui/lib/utils';
import { useState } from 'react';
import { type CaseControlProps, type CaseSpec, defineCase } from '../case-row';
import { markFocusClasses } from '../field-frame';
import { type Locked, NestedField } from '../group/group-section';
import { type FieldsArgs, ItemList } from '../group/item-list';
import {
  altWarning,
  type ImageValue,
  imageOf,
  MediaPicker,
} from '../images/media';
import { type ListItem, newItem } from '../list/use-list';

function ImageIcon() {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 24 24'
      className='size-6 text-muted-foreground'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <rect x='3.5' y='4.5' width='17' height='15' rx='2' />
      <circle cx='9' cy='10' r='1.75' />
      <path d='m20.5 15.5-4.5-4.5-8 8.5' />
    </svg>
  );
}

// Alt text and the decorative choice belong to this use of the image.
function AltFields({
  image,
  saved,
  locked,
  altRequired,
  error,
  onChange,
}: {
  image: ImageValue;
  saved?: ImageValue | null;
  locked: Locked;
  altRequired?: boolean;
  error?: string;
  onChange: (image: ImageValue) => void;
}) {
  return (
    <>
      <NestedField
        label='Alt text'
        description='Describe what the image shows in this place.'
        required={altRequired && !image.decorative}
        error={error}
        value={image.decorative ? '' : image.alt}
        saved={saved ? (saved.decorative ? '' : saved.alt) : undefined}
        locked={{ ...locked, disabled: locked.disabled || image.decorative }}
        onChange={(alt) => onChange({ ...image, alt })}
      />
      <label
        className={cn(
          'flex w-fit items-center gap-2 text-sm',
          locked.disabled
            ? 'cursor-not-allowed opacity-60'
            : locked.readOnly
              ? 'cursor-default'
              : 'cursor-pointer'
        )}
      >
        <Checkbox
          checked={image.decorative}
          disabled={locked.disabled}
          readOnly={locked.readOnly}
          className={markFocusClasses}
          onCheckedChange={(checked) =>
            onChange({ ...image, decorative: checked === true })
          }
        />
        Decorative image
      </label>
    </>
  );
}

const makeImageControl = (altRequired: boolean) =>
  function ImageControl({
    control,
    flags,
    value,
    saved,
    onChange,
    onBlur,
  }: CaseControlProps<ImageValue | null>) {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const [dragging, setDragging] = useState(false);
    const locked: Locked = {
      readOnly: Boolean(control.readOnly),
      disabled: Boolean(control.disabled),
    };
    const busy = locked.readOnly || locked.disabled;
    const choose = (event: React.MouseEvent<HTMLElement>) => {
      const target = event.currentTarget;
      setTimeout(() => setAnchor(target));
    };
    return (
      <div
        role='group'
        aria-labelledby={control['aria-labelledby']}
        aria-describedby={control['aria-describedby']}
        className='grid gap-3'
        onBlur={(event) => {
          const next = event.relatedTarget;
          if (
            next instanceof Element &&
            next.closest('[data-slot=media-content]')
          )
            return;
          if (!event.currentTarget.contains(next)) onBlur();
        }}
      >
        {value ? (
          <>
            <div
              data-force={control['data-force']}
              className={cn(
                'flex min-w-0 items-center gap-3 rounded-sm border border-input bg-card p-2 transition-colors',
                busy
                  ? null
                  : 'hover:border-(--input-hover) data-[force=hover]:border-(--input-hover)',
                locked.disabled ? 'border-border opacity-60' : null,
                locked.readOnly ? 'border-border-subtle bg-muted' : null
              )}
            >
              <img
                src={value.src}
                alt=''
                className='h-16 w-24 shrink-0 rounded-xs object-cover'
              />
              <p className='min-w-0 flex-1 truncate text-sm font-medium'>
                {value.name}
              </p>
              {busy ? null : (
                <div className='flex shrink-0 items-center gap-1'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    id={control.id}
                    className={cn(
                      'cursor-pointer',
                      control['data-force'] === 'focus' ? 'focus-ring' : null
                    )}
                    onClick={choose}
                  >
                    Replace
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='cursor-pointer'
                    onClick={() => onChange(null)}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
            <AltFields
              image={value}
              saved={saved}
              locked={locked}
              altRequired={altRequired}
              error={
                altRequired && flags.touched ? altWarning(value) : undefined
              }
              onChange={onChange}
            />
          </>
        ) : (
          <div
            data-dragging={dragging ? true : undefined}
            data-invalid={control['aria-invalid'] ? true : undefined}
            data-force={control['data-force']}
            onDragOver={(event) => {
              if (busy) return;
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const file = event.dataTransfer.files[0];
              if (busy || !file || !file.type.startsWith('image/')) return;
              onChange({
                src: URL.createObjectURL(file),
                name: file.name,
                alt: '',
                decorative: false,
              });
            }}
            className={cn(
              'grid place-items-center gap-2 rounded-sm border border-dashed border-input px-4 py-6 text-center transition-colors data-dragging:border-ring data-dragging:bg-muted/60 data-[force=hover]:border-(--input-hover) data-invalid:border-destructive',
              locked.disabled ? 'border-border opacity-60' : null,
              locked.readOnly ? 'border-border-subtle bg-muted' : null
            )}
          >
            <ImageIcon />
            {locked.readOnly ? (
              <p className='text-sm text-muted-foreground'>No image.</p>
            ) : (
              <>
                <p className='text-sm text-muted-foreground'>
                  Drop an image here, or
                </p>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  id={control.id}
                  disabled={locked.disabled}
                  className={cn(
                    'cursor-pointer',
                    control['data-force'] === 'focus' ? 'focus-ring' : null
                  )}
                  onClick={choose}
                >
                  Choose from Media
                </Button>
              </>
            )}
          </div>
        )}
        <MediaPicker
          open={anchor !== null}
          anchor={anchor}
          onPick={([image]) => {
            onChange(image);
            setAnchor(null);
          }}
          onClose={() => setAnchor(null)}
        />
      </div>
    );
  };

const COVER = imageOf(0, 'Snow on the peaks above the valley at dawn.');

export const imageCase: CaseSpec<ImageValue | null> = {
  id: 'image-single',
  title: 'Image',
  notInV4: true,
  labelling: 'group',
  note: 'Choose from Media, or drop a file to upload it. Alt text belongs to this use of the image. Empty alt text is a warning, not an error, and "Decorative image" clears it.',
  label: 'Cover image',
  overflowLabel:
    'Cover image, shown at the top of the post and in link previews',
  empty: null,
  filled: COVER,
  overflow: {
    ...COVER,
    name: 'company-offsite-2026-mountain-retreat-team-photo-final-edit.jpg',
    alt: 'The whole team on the ridge above the valley, with snow on the peaks behind them and the lake below.',
  },
  dirty: { ...COVER, alt: 'Mountains at dawn.' },
  invalid: null,
  required: true,
  validate: (image, required) =>
    required && !image ? ['Choose an image.'] : [],
  warn: (image) => {
    const warning = altWarning(image);
    return warning ? [warning] : [];
  },
  Control: makeImageControl(false),
};

export const imageAltRequiredCase: CaseSpec<ImageValue | null> = {
  ...imageCase,
  id: 'image-alt-required',
  title: 'Image, alt text required',
  note: 'The schema author makes alt text required. Empty alt text is then an error on the alt text field, not a warning. "Decorative image" still clears it.',
  invalid: { ...COVER, alt: '' },
  warn: undefined,
  Control: makeImageControl(true),
};

type Images = ListItem<ImageValue>[];

const GALLERY: Images = [
  imageOf(1, 'Sun setting over the beach.'),
  imageOf(2, ''),
  { ...imageOf(3), decorative: true },
].map(newItem);

function GalleryFields({
  item,
  saved,
  locked,
  update,
}: FieldsArgs<ImageValue>) {
  return (
    <AltFields
      image={item.value}
      saved={saved}
      locked={locked}
      onChange={update}
    />
  );
}

function GallerySummary({ image }: { image: ImageValue }) {
  return (
    <span className='flex min-w-0 items-center gap-2'>
      <img
        src={image.src}
        alt=''
        className='size-7 shrink-0 rounded-xs object-cover'
      />
      <span className='min-w-0 truncate'>{image.name}</span>
      {altWarning(image) ? (
        <span className='shrink-0 text-xs text-(--status-warning)'>
          No alt text
        </span>
      ) : null}
    </span>
  );
}

function GalleryControl(props: CaseControlProps<Images>) {
  return (
    <ItemList
      {...props}
      mode='inPlace'
      nouns={{ one: 'image', many: 'images' }}
      makeEmpty={() => imageOf(0)}
      describe={(image) => image.name}
      summary={(image) => <GallerySummary image={image} />}
      errorCount={() => 0}
      renderFields={GalleryFields}
      picker={({ open, anchor, onPickAll, onClose }) => (
        <MediaPicker
          multiple
          open={open}
          anchor={anchor}
          onPick={onPickAll}
          onClose={onClose}
        />
      )}
    />
  );
}

export const imageGalleryCase: CaseSpec<Images> = {
  id: 'image-gallery',
  title: 'Image gallery',
  notInV4: true,
  labelling: 'group',
  note: 'A list of images. Pick several from Media at once; they are added in the order picked. Each image opens in place for its alt text, and the list reorders, removes and undoes like every other list.',
  label: 'Gallery',
  overflowLabel: 'Gallery, shown as a carousel under the post',
  empty: [],
  filled: GALLERY,
  overflow: [
    ...GALLERY,
    newItem({
      ...imageOf(4, 'The team.'),
      name: 'company-offsite-2026-mountain-retreat-team-photo-final-edit.jpg',
    }),
  ],
  dirty: [
    GALLERY[0],
    { ...GALLERY[1], value: { ...GALLERY[1].value, alt: 'A forest trail.' } },
    GALLERY[2],
  ],
  required: true,
  validate: (images, required) =>
    required && images.length === 0 ? ['Add at least one image.'] : [],
  Control: GalleryControl,
};

export const imageCases = [
  defineCase(imageCase),
  defineCase(imageAltRequiredCase),
  defineCase(imageGalleryCase),
];
