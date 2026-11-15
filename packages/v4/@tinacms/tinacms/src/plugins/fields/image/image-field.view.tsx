import { Button } from '@tinacms/ui/components/button';
import {
  FieldWrapper,
  type FieldWrapperProps,
} from '@tinacms/ui/components/field-wrapper';
import { cn } from '@tinacms/ui/lib/utils';
import { type DragEvent, type Ref, useState } from 'react';
import {
  DROP_TO_REPLACE,
  RETRY,
  fieldUploadWords,
  retryUploadLabel,
} from '../../../editor/uploads/upload-words';
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
  /** A file uploads to this field. Further drops are ignored. */
  busy?: boolean;
  /** The whole percent of the running upload. Null or absent shows no number. */
  progress?: number | null;
  /** The name of the file that uploads, or of the file that failed. */
  uploadName?: string;
  /** A local picture of the file that uploads, for a field with no image yet. */
  uploadPreview?: string;
  /** Shows Retry for a failed upload. The reason is in `errors`. */
  onRetry?: () => void;
  /** A muted line under the file name. */
  note?: string;
  /** Why a drop is turned away. The field refuses a drop while it is set. */
  holdReason?: string;
  /** Shows `holdReason` only while a file is dragged over the field or after a refused drop. */
  holdQuiet?: boolean;
  missing?: boolean;
  previewKey?: number;
  disabled?: boolean;
  readOnly?: boolean;
  primaryRef?: Ref<HTMLButtonElement>;
  groupRef?: Ref<HTMLDivElement>;
}

export const MISSING_IMAGE_WARNING =
  'This image is no longer in Media. Replace it, or remove it.';

const carriesFiles = (event: DragEvent<HTMLDivElement>): boolean =>
  Array.from(event.dataTransfer.types).includes('Files');

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
  progress,
  uploadName,
  uploadPreview,
  onRetry,
  note,
  holdReason,
  holdQuiet,
  missing,
  previewKey,
  disabled,
  readOnly,
  primaryRef,
  groupRef,
}: ImageFieldViewProps) {
  const [dragging, setDragging] = useState(false);
  const [refused, setRefused] = useState<{
    reason: string;
    count: number;
  } | null>(null);
  const [tileMissing, setTileMissing] = useState(false);
  const editable = !disabled && !readOnly;
  const invalid = !!errors?.length;
  const hasValue = path !== null || notAPath === true;
  const taking = editable && (onDropFile !== undefined || !!holdReason);
  const accepting = taking && !holdReason && !busy;

  if (refused !== null && refused.reason !== holdReason) setRefused(null);

  // Without preventDefault on a drag of files, the browser opens the dropped file.
  const dragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!taking || !carriesFiles(event)) return;
    event.preventDefault();
    setDragging(true);
  };

  const dragLeave = (event: DragEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    setDragging(false);
  };

  const drop = (event: DragEvent<HTMLDivElement>) => {
    if (!taking) return;
    event.preventDefault();
    setDragging(false);
    const [file] = event.dataTransfer.files;
    if (!file || busy) return;
    if (holdReason) {
      setRefused((last) => ({
        reason: holdReason,
        count: (last?.count ?? 0) + 1,
      }));
    } else {
      onDropFile?.(file);
    }
  };

  const shown = look ?? 'default';
  const dropLook = dragging && accepting;
  const refusal =
    holdReason && (!holdQuiet || dragging || refused !== null)
      ? holdReason
      : undefined;
  const allWarnings =
    path !== null && (missing || tileMissing)
      ? [...warnings, MISSING_IMAGE_WARNING]
      : warnings;
  const retry =
    editable && onRetry && !busy ? (
      <Button
        variant='outline'
        size='sm'
        aria-label={uploadName ? retryUploadLabel(uploadName) : undefined}
        onClick={onRetry}
      >
        {RETRY}
      </Button>
    ) : null;
  const refusalLine = refusal ? (
    <p
      key={refused?.count ?? 0}
      role='status'
      className='m-0 text-sm text-muted-foreground'
    >
      {refusal}
    </p>
  ) : null;

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
        ref={groupRef}
        role='group'
        tabIndex={-1}
        aria-labelledby={labelId}
        data-dragging={dragging ? 'true' : undefined}
        className='flex min-w-0 flex-col items-start gap-2 outline-none'
        onDragEnter={dragOver}
        onDragOver={dragOver}
        onDragLeave={dragLeave}
        onDrop={drop}
      >
        {hasValue || busy ? (
          <>
            <ImageTile
              path={path}
              placeholder={
                hasValue ? 'Not a media path' : (uploadName ?? 'New image')
              }
              fallbackName='this value'
              resolveUrl={resolveUrl}
              look={shown}
              invalid={invalid}
              inert={!editable}
              missing={missing}
              onMissingChange={setTileMissing}
              previewKey={previewKey}
              busy={busy}
              veil={busy ? fieldUploadWords(progress ?? null) : undefined}
              localSrc={uploadPreview}
              dropLabel={dropLook && hasValue ? DROP_TO_REPLACE : undefined}
              note={note}
              replaceRef={primaryRef}
              onReplace={editable && hasValue ? onReplace : undefined}
              onRemove={editable && hasValue ? onRemove : undefined}
            />
            {refusalLine}
            {retry}
          </>
        ) : !editable ? (
          <p className='m-0 text-sm text-muted-foreground'>No image.</p>
        ) : (
          <div
            className={cn(
              'flex w-full flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-input p-4 text-center transition',
              tileShape[shown],
              tileCap[shown],
              invalid && 'border-destructive',
              dropLook && 'bg-selected',
              dropLook && !invalid && 'border-primary'
            )}
          >
            {refusalLine ??
              (onDropFile !== undefined && !holdReason ? (
                <p className='m-0 text-sm text-muted-foreground'>
                  Drop an image here, or
                </p>
              ) : null)}
            <div className='flex flex-wrap items-center justify-center gap-2'>
              <Button
                ref={primaryRef}
                variant='outline'
                size='sm'
                icon='media'
                onClick={onChoose}
              >
                Choose from Media
              </Button>
              {retry}
            </div>
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}
