import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@tinacms/ui/components/alert-dialog';
import { Button } from '@tinacms/ui/components/button';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { hasValidator } from '../../../core/schema/types';
import {
  useFieldActivation,
  useFieldAddress,
  useFieldFrame,
  useFieldSchema,
  useFieldValue,
  useMediaSlice,
} from '../../../editor';
import { useMediaPicker, useOwnedPicker } from '../../../editor/media-picker';
import { UploadHost } from '../../../editor/uploads/upload-host';
import {
  REPLACE_KEEPS_OLD_FILE,
  replaceQuestion,
} from '../../../editor/uploads/upload-words';
import { mediaNameOf } from '../../media-manager/media-types';
import type { ImageFieldSchema } from './image-field.schema';
import { ImageFieldView } from './image-field.view';
import { useParentLabel } from './image-picker';
import { useImageUpload } from './image-upload';

export function ImageField() {
  const address = useFieldAddress();
  const field = useFieldSchema<ImageFieldSchema>();
  const [value, setValue] = useFieldValue<unknown>(address);
  const path = typeof value === 'string' ? value : null;
  const hasValue = value != null;
  const frame = useFieldFrame();
  const media = useMediaSlice();
  const upload = useImageUpload(media, address);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const focusAfterRemove = useRef(false);
  const focusAfterUpload = useRef(false);
  const focusAfterChoose = useRef(false);
  const picker = useMediaPicker();
  const parentLabel = useParentLabel(address);
  const { owner: target, target: openTarget } = useOwnedPicker();
  const choosing = openTarget !== null;
  const [missing, setMissing] = useState(false);
  const [replacement, setReplacement] = useState<File | null>(null);
  const [stored, setStored] = useState(0);

  const focusPrimary = () => primaryRef.current?.focus();

  // A dialog this field opens is a portal, and React sends its focus events through the
  // field's row, which activates the field. Focus must stay in that dialog, and in the picker.
  useFieldActivation(() => {
    if (document.activeElement?.closest('[data-slot="media-picker"]')) return;
    const dialog = document.activeElement?.closest(
      '[role="dialog"], [role="alertdialog"]'
    );
    if (dialog && !dialog.contains(groupRef.current)) return;
    focusPrimary();
  });
  useLayoutEffect(() => {
    if (focusAfterRemove.current && value == null) {
      focusAfterRemove.current = false;
      primaryRef.current?.focus();
    }
    if (focusAfterChoose.current && path !== null) {
      focusAfterChoose.current = false;
      primaryRef.current?.focus();
    }
  }, [value, path]);

  // A file that lands under the path the field already holds must still show the new picture.
  useEffect(() => {
    if (upload.landed !== null) setStored((count) => count + 1);
  }, [upload.landed]);

  // Retry and Replace take away the button that had focus. The group holds focus
  // while the file uploads, and the main button takes it back when the upload ends.
  const landedPath = upload.landedPath;
  useLayoutEffect(() => {
    if (!focusAfterUpload.current || upload.running) return;
    if (landedPath !== null && landedPath !== path) return;
    focusAfterUpload.current = false;
    const focused = document.activeElement;
    if (focused === groupRef.current || focused === document.body) {
      primaryRef.current?.focus();
    }
  }, [upload.running, landedPath, path]);

  const holdFocus = () => {
    focusAfterUpload.current = true;
    groupRef.current?.focus();
  };

  const store = (next: string) => {
    upload.dismiss();
    setStored((count) => count + 1);
    setValue(next);
  };

  // The request outlives this render, so a list edit while it is open must not strand its address.
  const choose = useRef((_picked: string[]) => {});
  useLayoutEffect(() => {
    choose.current = ([picked]) => {
      if (picked === undefined) return;
      focusAfterChoose.current = true;
      if (picked === path) {
        focusAfterChoose.current = false;
        setStored((count) => count + 1);
        primaryRef.current?.focus();
        return;
      }
      store(picked);
    };
  });

  const openPicker = () =>
    picker.open({
      mode: 'single',
      forLabel: field.label ?? field.name,
      parentLabel,
      target,
      replacing: path === null ? undefined : { path, missing },
      opener: primaryRef.current,
      choose: (picked) => choose.current(picked),
    });

  // A slow load can flip `missing` after the picker opened: send the request again.
  const resend = useRef(openPicker);
  useLayoutEffect(() => {
    resend.current = openPicker;
  });
  const wasMissing = useRef(missing);
  useEffect(() => {
    if (wasMissing.current === missing) return;
    wasMissing.current = missing;
    if (choosing) resend.current();
  }, [missing, choosing]);

  const failure = frame.disabled || frame.readOnly ? null : upload.failure;
  const retry = failure?.retry;
  const current = upload.current;

  return (
    <>
      <ImageFieldView
        {...frame}
        errors={failure ? [...frame.errors, failure.reason] : frame.errors}
        path={path}
        notAPath={hasValue && path === null}
        look={field.cover}
        resolveUrl={media.resolveUrl}
        primaryRef={primaryRef}
        groupRef={groupRef}
        busy={upload.running}
        progress={upload.percent}
        uploadName={current?.name ?? failure?.name}
        uploadPreview={current?.preview}
        note={
          upload.note && upload.note.path === path
            ? upload.note.text
            : undefined
        }
        holdReason={upload.hold?.reason}
        holdQuiet={upload.hold?.quiet}
        previewKey={stored}
        choosing={choosing}
        onMissingChange={setMissing}
        onChoose={openPicker}
        onReplace={openPicker}
        onRetry={
          retry
            ? () => {
                holdFocus();
                retry();
              }
            : undefined
        }
        onRemove={
          hasValidator(field, 'required')
            ? undefined
            : () => {
                upload.dismiss();
                focusAfterRemove.current = true;
                setValue(null);
              }
        }
        onDropFile={
          upload.canUpload
            ? (file) => {
                if (hasValue) setReplacement(file);
                else upload.send(file);
              }
            : undefined
        }
      />
      <UploadHost />
      <AlertDialog
        open={replacement !== null}
        onOpenChange={(open) => {
          if (!open) setReplacement(null);
        }}
      >
        <AlertDialogContent finalFocus={primaryRef}>
          <AlertDialogHeader>
            <AlertDialogTitle className='[overflow-wrap:anywhere]'>
              {replaceQuestion(
                path === null ? 'this value' : mediaNameOf(path)
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className='[overflow-wrap:anywhere]'>
              {REPLACE_KEEPS_OLD_FILE}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant='outline' />}>
              Cancel
            </AlertDialogClose>
            <Button
              type='button'
              variant='primary'
              onClick={() => {
                const file = replacement;
                setReplacement(null);
                if (!file) return;
                holdFocus();
                upload.send(file);
              }}
            >
              Replace
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
