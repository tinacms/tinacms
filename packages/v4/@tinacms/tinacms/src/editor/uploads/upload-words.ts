// Placeholder words from the Media Manager prototype, for UX Copy (#7925).

export const UPLOAD_SETTLE_MS = 5000;
export const UPLOAD_NAME_TRIES = 20;
export const UPLOADS_AT_ONCE = 3;

export const SAVING_HOLD = 'Saving. You can upload once it finishes.';
export const NO_UPLOAD_PERMISSION = "You don't have permission to upload.";
export const NO_ACCESS = "Your account doesn't have access to this project.";
export const SESSION_EXPIRED = 'Your session has expired. Sign in again.';
export const READ_ONLY_UPLOAD =
  "This storage is read-only. Files can't be uploaded here.";
export const BRANCH_CHANGED = 'The branch changed, so this stopped.';
export const WAITING_FOR_SAVE = 'Waiting for the save to finish';
export const CONNECTION_FAILURE =
  "Couldn't upload. Check your connection, then retry.";
export const UNCONFIRMED =
  "Couldn't confirm the upload. Check Media before you upload it again.";
export const WRONG_TYPE = "This file type can't be uploaded here.";
export const NOT_AN_IMAGE = 'Only images can go in this field.';
export const FOLDER_DROPPED =
  "Folders can't be uploaded. Drop the files instead.";

/** The note on a protected branch, where Upload, Delete and Move are all off. */
export const protectedBranchWords = (branch: string) =>
  `${branch} is protected. Switch to another branch to upload, delete or move files.`;

export const filesWord = (count: number) =>
  `${count} ${count === 1 ? 'file' : 'files'}`;

/** "Media" at the root, else the last folder of the path. */
export const folderLabelOf = (folder: string): string =>
  folder.split('/').at(-1) || 'Media';

export const sizeLabelOf = (bytes: number): string => {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

export const tooLargeReason = (maxSize: number) =>
  `Too large. The limit is ${Math.floor(maxSize / (1024 * 1024))} MB.`;

export const takenNote = (picked: string, saved: string) =>
  `${picked} was taken, saved as ${saved}`;

export const NEW_BADGE = 'New';

export const dropVeilWords = (folder: string) =>
  `Drop to upload to ${folderLabelOf(folder)}`;

export const DROP_TO_REPLACE = 'Drop to replace';
export const RETRY = 'Retry';
export const REPLACE_KEEPS_OLD_FILE = 'The old file stays in Media.';

export const replaceQuestion = (oldName: string) => `Replace ${oldName}?`;

export const retryUploadLabel = (name: string) => `Retry uploading ${name}`;

/** An image field's error about one file. The file's name comes first. */
export const fileErrorWords = (name: string, reason: string) =>
  `${name}: ${reason}`;

/** The words on the picture of an image field while its file uploads. */
export const fieldUploadWords = (percent: number | null) =>
  percent === null ? 'Uploading' : `Uploading ${percent}%`;
