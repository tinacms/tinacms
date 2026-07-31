import { Input } from '@toolkit/fields';
// Direct path rather than the '@tinacms/toolkit' barrel: the barrel re-exports
// this module, so going through it resolves to undefined at runtime.
import { LoadingDots } from '@toolkit/form-builder';
import {
  Modal,
  ModalActions,
  ModalBody,
  ModalHeader,
  PopupModal,
} from '@toolkit/react-modals';
import { Button } from '@toolkit/styles';
import React from 'react';
import { sanitizeFilename, splitFilename } from './utils';

interface DeleteModalProps {
  close(): void;
  deleteFunc(): Promise<void>;
  filename: string;
}
interface NewFolderModalProps {
  onSubmit(filename: string): void;
  close(): void;
}

interface RenameModalProps {
  close(): void;
  renameFunc(newFilename: string): Promise<void>;
  filename: string;
}

const renameErrorMessage = (error: any, attemptedName: string): string => {
  switch (error?.code) {
    case 'NAME_COLLISION':
      return `A file named "${attemptedName}" already exists in this folder. Choose a different name.`;
    case 'NOT_FOUND':
      return 'This file no longer exists. Refresh the media library and try again.';
    case 'INVALID_FILENAME':
    case 'INVALID_PATH':
      return "That name isn't valid. Avoid slashes and special characters.";
    case 'UNAUTHORIZED':
      return "You don't have permission to rename this file.";
    case 'UNSUPPORTED':
      return error?.message || 'This media store does not support renaming.';
    default:
      return error?.message || 'Failed to rename the file. Please try again.';
  }
};

export const RenameModal = ({
  close,
  renameFunc,
  filename,
}: RenameModalProps) => {
  const { base, ext } = splitFilename(filename);
  const [nextBase, setNextBase] = React.useState(base);
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const trimmedBase = nextBase.trim();
  // Sanitize the base on its own and re-attach the original extension, so a
  // base containing slashes or dots can never rewrite or drop it.
  const sanitizedBase = sanitizeFilename(trimmedBase);
  const sanitized = `${sanitizedBase}${ext}`;
  const isEmpty = trimmedBase.length === 0;
  // Nothing usable survived, so sanitizeFilename fell back to its placeholder
  // instead of producing something derived from the input.
  const isStripped =
    !isEmpty && sanitizedBase === 'file' && trimmedBase !== 'file';
  const isUnchanged = sanitized === filename;
  const canSubmit = !processing && !isEmpty && !isStripped && !isUnchanged;
  const showPreview = !isEmpty && !isStripped && sanitizedBase !== trimmedBase;

  let hint: string | null = null;
  if (isEmpty) {
    hint = 'Enter a file name.';
  } else if (isStripped) {
    hint = "That name isn't valid. Try using letters, numbers or hyphens.";
  }

  return (
    <Modal>
      <PopupModal>
        <ModalHeader close={close}>Rename {filename}</ModalHeader>
        <ModalBody padded={true}>
          <p className='text-sm text-gray-500 mb-4 italic'>
            <span className='font-bold'>Note</span> &ndash; Renaming this file
            will not update existing content that references the old path.
          </p>
          <div className='flex items-center gap-2'>
            <Input
              value={nextBase}
              placeholder='File name'
              required
              disabled={processing}
              onChange={(e) => {
                setNextBase(e.target.value);
                setError(null);
              }}
            />
            {ext && (
              <span className='text-base text-gray-500 shrink-0'>{ext}</span>
            )}
          </div>
          {showPreview && (
            <p className='text-sm text-gray-500 mt-2'>
              Will be saved as <strong>{sanitized}</strong>
            </p>
          )}
          {hint && <p className='text-sm text-gray-500 mt-2'>{hint}</p>}
          {error && (
            <p role='alert' className='text-sm text-red-500 mt-2'>
              {error}
            </p>
          )}
        </ModalBody>
        <ModalActions>
          <Button style={{ flexGrow: 2 }} disabled={processing} onClick={close}>
            Cancel
          </Button>
          <Button
            style={{ flexGrow: 3 }}
            variant='primary'
            disabled={!canSubmit}
            onClick={async () => {
              // Button only renders `disabled` as pointer-events-none styling,
              // so the guard has to live here to stop a double submit.
              if (!canSubmit) return;
              setProcessing(true);
              setError(null);
              try {
                await renameFunc(sanitized);
                close();
              } catch (e) {
                setError(renameErrorMessage(e, sanitized));
                setProcessing(false);
              }
            }}
          >
            <span className='mr-1'>Rename</span>
            {processing && <LoadingDots />}
          </Button>
        </ModalActions>
      </PopupModal>
    </Modal>
  );
};

export const DeleteModal = ({
  close,
  deleteFunc,
  filename,
}: DeleteModalProps) => {
  const [processing, setProcessing] = React.useState(false);
  return (
    <Modal>
      <PopupModal>
        <ModalHeader close={close}>Delete {filename}</ModalHeader>
        <ModalBody padded={true}>
          <p>
            Are you sure you want to delete <strong>{filename}</strong>?
          </p>
        </ModalBody>
        <ModalActions>
          <Button style={{ flexGrow: 2 }} disabled={processing} onClick={close}>
            Cancel
          </Button>
          <Button
            style={{ flexGrow: 3 }}
            disabled={processing}
            variant='danger'
            onClick={async () => {
              setProcessing(true);
              try {
                await deleteFunc();
              } catch (e) {
                console.error(e);
              } finally {
                close();
              }
            }}
          >
            <span className='mr-1'>Delete</span>
            {processing && <LoadingDots />}
          </Button>
        </ModalActions>
      </PopupModal>
    </Modal>
  );
};

export const NewFolderModal = ({ onSubmit, close }: NewFolderModalProps) => {
  const [folderName, setFolderName] = React.useState('');
  return (
    <Modal>
      <PopupModal>
        <ModalHeader close={close}>New Folder</ModalHeader>
        <ModalBody padded={true}>
          <p className='text-base text-gray-700 mb-2'>
            Please provide a name for your folder.
          </p>
          <p className='text-sm text-gray-500 mb-4 italic'>
            <span className='font-bold'>Note</span> &ndash; If you navigate away
            before uploading a media item, the folder will disappear.
          </p>
          <Input
            value={folderName}
            placeholder='Folder Name'
            required
            onChange={(e) => setFolderName(e.target.value)}
          />
        </ModalBody>
        <ModalActions>
          <Button style={{ flexGrow: 2 }} onClick={close}>
            Cancel
          </Button>
          <Button
            disabled={!folderName}
            style={{ flexGrow: 3 }}
            variant='primary'
            onClick={() => {
              if (!folderName) return;
              onSubmit(folderName);
              close();
            }}
          >
            Create New Folder
          </Button>
        </ModalActions>
      </PopupModal>
    </Modal>
  );
};
