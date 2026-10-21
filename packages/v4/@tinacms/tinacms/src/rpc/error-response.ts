import {
  CONTENT_REFUSAL_CODES,
  ContentWriteError,
  InvalidSaveInputError,
} from '../core/content/contract';
import { HookRejectedError } from '../core/form/hooks';
import { RequestBodyTooLargeError } from '../core/request-body';

// Every response that is not a 2xx holds `{ error: { code, message } }`. The
// specification in tinacmsv4 plans/007 records the code table, until the ADR for the
// error model exists. The tests hold the literal values.
export const errorResponse = (
  status: number,
  code: string,
  message: string
): Response => Response.json({ error: { code, message } }, { status });

const [HOOK_REJECTED, WRITE_REFUSED] = CONTENT_REFUSAL_CODES;

// A failure with no known cause keeps its message out of the body and in the
// server log under `label`.
export const toErrorResponse = (cause: unknown, label: string): Response => {
  if (cause instanceof HookRejectedError) {
    return errorResponse(422, HOOK_REJECTED, cause.message);
  }
  if (cause instanceof InvalidSaveInputError) {
    return errorResponse(400, 'invalid-input', cause.message);
  }
  if (cause instanceof ContentWriteError) {
    return errorResponse(400, WRITE_REFUSED, cause.message);
  }
  if (cause instanceof RequestBodyTooLargeError) {
    return errorResponse(413, 'body-too-large', cause.message);
  }
  console.error(`[tinacms] ${label} failed:`, cause);
  return errorResponse(500, 'op-failed', 'Operation failed.');
};
