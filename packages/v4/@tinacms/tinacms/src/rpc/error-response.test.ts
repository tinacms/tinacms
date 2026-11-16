import { describe, expect, it } from 'vitest';
import { toErrorResponse } from './error-response';

const HOOK_REJECTED: unique symbol = Symbol.for('tinacms.error.hook-rejected');
const CONTENT_WRITE: unique symbol = Symbol.for('tinacms.error.content-write');
const INVALID_SAVE_INPUT: unique symbol = Symbol.for(
  'tinacms.error.invalid-save-input'
);
const BODY_TOO_LARGE: unique symbol = Symbol.for(
  'tinacms.error.body-too-large'
);

// Error classes of a second copy of the package: same brands, other classes.
class SecondCopyHookRejectedError extends Error {
  readonly [HOOK_REJECTED] = true;
}
class SecondCopyContentWriteError extends Error {
  readonly [CONTENT_WRITE] = true;
}
class SecondCopyInvalidSaveInputError extends Error {
  readonly [INVALID_SAVE_INPUT] = true;
}
class SecondCopyRequestBodyTooLargeError extends Error {
  readonly [BODY_TOO_LARGE] = true;
}

describe('toErrorResponse', () => {
  it.each([
    [new SecondCopyHookRejectedError('No'), 422, 'hook-rejected'],
    [new SecondCopyContentWriteError('Repair it'), 400, 'write-refused'],
    [new SecondCopyInvalidSaveInputError('Bad input'), 400, 'invalid-input'],
    [new SecondCopyRequestBodyTooLargeError('Too big'), 413, 'body-too-large'],
  ])(
    'maps %s from a second copy of the package',
    async (cause, status, code) => {
      const response = toErrorResponse(cause, 'test');
      expect(response.status).toBe(status);
      expect(await response.json()).toEqual({
        error: { code, message: cause.message },
      });
    }
  );
});
