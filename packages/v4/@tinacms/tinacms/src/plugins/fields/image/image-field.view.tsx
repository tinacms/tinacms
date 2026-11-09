import { Button } from '@tinacms/ui/components/button';
import {
  FieldWrapper,
  type FieldWrapperProps,
} from '@tinacms/ui/components/field-wrapper';
import { cn } from '@tinacms/ui/lib/utils';
import { type DragEvent, type Ref, useState } from 'react';
import type { ImageCoverLook } from './image-field.schema';
import {
  ImageTile,
  type ResolveImageUrl,
  tileCap,
  tileShape,
} from './image-tile';

export interface ImageFieldViewProps
  extends Pick<
    FieldWrapperProps,
    'label' | 'labelId' | 'errors' | 'help' | 'helpId' | 'warnings' | 'required'
  > {
  path: string | null;
  notAPath?: boolean;
  look?: ImageCoverLook;
  resolveUrl: ResolveImageUrl;
  onChoose: () => void;
  onReplace: () => void;
  onRemove?: () => void;
  onDropFile?: (file: File) => void;
  busy?: boolean;
  holdReason?: string;
  missing?: boolean;
  previewKey?: number;
  disabled?: boolean;
  readOnly?: boolean;
  primaryRef?: Ref<HTMLButtonElement>;
}

export const MISSING_IMAGE_WARNING =
  'This image is no longer in Media. Replace it, or remove it.';

export function ImageFieldView({
  label,
  labelId,
  errors,
  help,
  helpId,
  warnings = [],
  required,
  path,
  notAPath,
  look,
  resolveUrl,
  onChoose,
  onReplace,
  onRemove,
  onDropFile,
  busy,
  holdReason,
  missing,
  previewKey,
  disabled,
  readOnly,
  primaryRef,
}: ImageFieldViewProps) {
  const [dragging, setDragging] = useState(false);
  const [refusals, setRefusals] = useState(0);
  const [tileMissing, setTileMissing] = useState(false);
  const editable = !disabled && !readOnly;
  const invalid = !!errors?.length;
  const hasValue = path !== null || notAPath === true;
  const accepting = editable && onDropFile !== undefined;

  const dragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!accepting) return;
    event.preventDefault();
    setDragging(true);
  };

  const dragLeave = (event: DragEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    setDragging(false);
  };

  const drop = (event: DragEvent<HTMLDivElement>) => {
    if (!accepting) return;
    event.preventDefault();
    setDragging(false);
    const [file] = event.dataTransfer.files;
    if (!file || busy) return;
    if (holdReason) setRefusals((count) => count + 1);
    else onDropFile(file);
  };

  const shown = look ?? 'default';
  const allWarnings =
    path !== null && (missing || tileMissing)
      ? [...warnings, MISSING_IMAGE_WARNING]
      : warnings;

  return (
    <FieldWrapper
      label={label}
      labelId={labelId}
      required={required}
      help={help}
      helpId={helpId}
      errors={errors}
      warnings={allWarnings}
      disabled={disabled}
    >
      <div
        role='group'
        aria-labelledby={labelId}
        data-dragging={dragging ? 'true' : undefined}
        onDragEnter={dragOver}
        onDragOver={dragOver}
        onDragLeave={dragLeave}
        onDrop={drop}
      >
        {hasValue ? (
          <ImageTile
            path={path}
            placeholder='Not a media path'
            fallbackName='this value'
            resolveUrl={resolveUrl}
            look={shown}
            invalid={invalid}
            inert={!editable}
            missing={missing}
            onMissingChange={setTileMissing}
            previewKey={previewKey}
            busy={busy}
            dropTarget={dragging}
            replaceRef={primaryRef}
            onReplace={editable ? onReplace : undefined}
            onRemove={editable ? onRemove : undefined}
          />
        ) : !editable ? (
          <p className='m-0 text-sm text-muted-foreground'>No image.</p>
        ) : (
          <div
            className={cn(
              'flex w-full flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-input p-4 text-center transition',
              tileShape[shown],
              tileCap[shown],
              invalid && 'border-destructive',
              dragging && 'border-primary bg-selected'
            )}
          >
            {holdReason ? (
              <p
                key={refusals}
                role='status'
                className='m-0 text-sm text-muted-foreground'
              >
                {holdReason}
              </p>
            ) : accepting ? (
              <p className='m-0 text-sm text-muted-foreground'>
                {busy ? 'Uploading…' : 'Drop an image here, or'}
              </p>
            ) : null}
            <Button
              ref={primaryRef}
              variant='outline'
              size='sm'
              icon='media'
              busy={busy}
              onClick={onChoose}
            >
              Choose from Media
            </Button>
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}
