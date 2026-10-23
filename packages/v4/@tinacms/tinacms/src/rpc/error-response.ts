import {
  CONTENT_REFUSALS,
  type ProviderRefusalCode,
  isContentWriteError,
  isInvalidSaveInputError,
  isProviderRefusalError,
} from '../core/content/contract';
import { isHookRejectedError } from '../core/form/hooks';
import { isRequestBodyTooLargeError } from '../core/request-body';

// Every response that is not a 2xx holds `{ error: { code, message } }`. The
// specification in tinacmsv4 plans/007 records the code table, until the ADR for the
// error model exists. The tests hold the literal values.
export const errorResponse = (
  status: number,
  code: string,
  message: string
): Response => Response.json({ error: { code, message } }, { status });

const PROVIDER_REFUSAL_STATUS: Record<ProviderRefusalCode, number> = {
  unauthorized: 401,
  forbidden: 403,
  'not-found': 422,
  'branch-not-found': 422,
  'not-indexed': 422,
  validation: 422,
  network: 502,
};

// A failure with no known cause keeps its message out of the body and in the
// server log under `label`.
export const toErrorResponse = (cause: unknown, label: string): Response => {
  if (isHookRejectedError(cause)) {
    return errorResponse(422, CONTENT_REFUSALS.hookRejected, cause.message);
  }
  if (isInvalidSaveInputError(cause)) {
    return errorResponse(400, 'invalid-input', cause.message);
  }
  if (isProviderRefusalError(cause)) {
    return errorResponse(
      PROVIDER_REFUSAL_STATUS[cause.code],
      cause.code,
      cause.message
    );
  }
  if (isContentWriteError(cause)) {
    return errorResponse(400, CONTENT_REFUSALS.writeRefused, cause.message);
  }
  if (isRequestBodyTooLargeError(cause)) {
    return errorResponse(413, 'body-too-large', cause.message);
  }
  console.error(`[tinacms] ${label} failed:`, cause);
  return errorResponse(500, 'op-failed', 'Operation failed.');
};
