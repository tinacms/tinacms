import { useState } from 'react';
import type { MediaProvider } from '../../../core/media/contract';
import {
  extensionsForCategory,
  uploadRejectionOf,
  uploadRulesOf,
} from '../../media-manager/media-types';

const IMAGE_UPLOAD_RULES = uploadRulesOf(extensionsForCategory('image'));

const messageOf = (cause: unknown): string => {
  if (cause instanceof Error) {
    return cause.message;
  } else {
    return String(cause);
  }
};

export function useImageUpload(
  media: Pick<MediaProvider, 'upload' | 'features'>,
  store: (path: string) => void
) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const upload = async (file: File) => {
    if (uploading) return;
    const rejection = uploadRejectionOf(
      file,
      IMAGE_UPLOAD_RULES,
      media.features?.maxSize
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

  return {
    upload,
    uploading,
    uploadError,
    clearError: () => setUploadError(null),
  };
}
