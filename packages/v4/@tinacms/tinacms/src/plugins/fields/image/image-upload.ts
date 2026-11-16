import { useMemo } from 'react';
import type { MediaProvider } from '../../../core/media/contract';
import type { FieldTarget } from '../../../editor/uploads/upload-list';
import {
  NOT_AN_IMAGE,
  READ_ONLY_UPLOAD,
  SAVING_HOLD,
  fileErrorWords,
} from '../../../editor/uploads/upload-words';
import {
  uploadCheckOf,
  useFieldUpload,
  useUploadHold,
  useUploadList,
} from '../../../editor/uploads/use-uploads';
import {
  extensionsForCategory,
  uploadRejectionOf,
  uploadRulesOf,
} from '../../media-manager/media-types';

const IMAGE_UPLOAD_RULES = uploadRulesOf(extensionsForCategory('image'));

const isImageFile = (file: File): boolean =>
  uploadRejectionOf(file, IMAGE_UPLOAD_RULES, undefined) === null;

// An image field outside a form provider never uploads; this target matches nothing.
const NO_FORM: FieldTarget = { form: {}, address: '' };

export interface ImageUploadFailure {
  /** The words under the field. An error about a file starts with the file's name. */
  reason: string;
  /** The file to name on Retry. */
  name: string;
  retry?: () => void;
}

/**
 * The upload state of one image field, read from the upload list by form and
 * address. The form writer fills the field when the file lands, so this
 * hook never writes the value.
 */
export function useImageUpload(
  media: Pick<MediaProvider, 'features'>,
  address: string
) {
  const uploads = useUploadList();
  const { form, entry, note } = useFieldUpload();
  const target = useMemo(
    () => (form ? { form, address } : null),
    [form, address]
  );
  const origin = useMemo(
    () => ({ kind: 'field' as const, ...(target ?? NO_FORM) }),
    [target]
  );
  const uploadHold = useUploadHold();
  const maxSize = media.features?.maxSize;

  const running = entry?.status === 'waiting' || entry?.status === 'uploading';
  const fraction = entry?.fraction ?? null;

  let hold: { reason: string; quiet: boolean } | null = null;
  if (uploadHold !== null) {
    hold = { reason: uploadHold, quiet: uploadHold !== SAVING_HOLD };
  } else if (media.features?.readOnly === true) {
    hold = { reason: READ_ONLY_UPLOAD, quiet: true };
  }

  let failure: ImageUploadFailure | null = null;
  if (entry?.status === 'failed' && entry.reason !== undefined) {
    const { id } = entry;
    failure = {
      reason: fileErrorWords(entry.name, entry.reason),
      name: entry.name,
      retry: entry.recovery === 'retry' ? () => uploads.retry(id) : undefined,
    };
  }

  const dismiss = () => {
    if (!target) return;
    uploads.dismissField(target);
  };

  return {
    canUpload: target !== null,
    running,
    /** The file that uploads now, for the picture under the veil. */
    current: running ? entry : undefined,
    /** A whole percent, at most 99, or null when the provider reports no progress. */
    percent:
      fraction === null ? null : Math.min(99, Math.round(fraction * 100)),
    /** The id of the upload that last filled the field, while it is listed. */
    landed: entry?.status === 'done' ? entry.id : null,
    /** The path that upload returned. The field holds it once the form writer ran. */
    landedPath: entry?.status === 'done' ? (entry.path ?? null) : null,
    note,
    hold,
    failure,
    /** Clears a failure and the taken-name note, when another image takes the field. */
    dismiss,
    send: (file: File) => {
      if (!target || running) return;
      // The list drops the taken-name note when it lists the file. A held submit lists nothing.
      uploads.dismissField(target, true);
      uploads.submit({
        files: [file],
        folder: '',
        origin,
        field: target,
        check: uploadCheckOf(isImageFile, maxSize, NOT_AN_IMAGE),
      });
    },
  };
}
