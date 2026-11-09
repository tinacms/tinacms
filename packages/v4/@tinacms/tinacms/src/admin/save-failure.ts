import { ContentError } from '../core/content/contract';
import { AfterSaveHookError, FormValidationError } from '../editor/hooks';

export interface SaveFailureWords {
  title: string;
  text: string;
  /** A local disk failure offers Retry and Dismiss, and has no close button. */
  disk: boolean;
}

const TRY_AGAIN = 'Your edits are kept. Try again in a few seconds.';

const failure = (reason: string, text = TRY_AGAIN, disk = false) => ({
  title: `Couldn't save. ${reason}`,
  text,
  disk,
});

// The words the editor reads, from a fixed set keyed by the reason. Text the
// server or a provider wrote never reaches the screen; the caller logs it.
export function saveFailureWords(cause: unknown): SaveFailureWords {
  if (cause instanceof FormValidationError) {
    return failure(
      'Some fields are not valid.',
      'Fix the marked fields, then try again.'
    );
  }
  if (cause instanceof AfterSaveHookError) {
    return {
      title: 'The document was saved. An afterSave hook failed.',
      text: 'Check the browser console for the reason.',
      disk: false,
    };
  }
  if (cause instanceof ContentError) {
    switch (cause.code) {
      case 'write-refused':
        return failure(
          "The file couldn't be written to disk.",
          TRY_AGAIN,
          true
        );
      case 'branch-not-found':
        return failure('The branch no longer exists.');
      case 'not-indexed':
        return failure("This branch isn't ready yet.");
      case 'unauthorized':
        return failure('Your session has ended.');
      case 'forbidden':
        return failure("You don't have permission to save.");
      case 'network':
        return failure("Can't reach the content server.");
      case 'validation':
        return failure(
          'Some fields are not valid.',
          'Fix the marked fields, then try again.'
        );
      case 'hook-rejected':
        return failure('A save hook rejected this save.');
      default:
        break;
    }
  }
  return failure('Something went wrong.');
}
