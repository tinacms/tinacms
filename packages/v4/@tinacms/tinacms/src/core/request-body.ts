import { hasErrorBrand } from './error-brand';

export const MAX_REQUEST_BODY_BYTES = 5 * 1024 * 1024;

export const MAX_MEDIA_UPLOAD_BYTES = 25 * 1024 * 1024;

const BODY_TOO_LARGE_BRAND: unique symbol = Symbol.for(
  'tinacms.error.body-too-large'
);

export class RequestBodyTooLargeError extends Error {
  readonly [BODY_TOO_LARGE_BRAND] = true;

  constructor(limit = MAX_REQUEST_BODY_BYTES) {
    super(`The request body is larger than ${limit} bytes.`);
    this.name = 'RequestBodyTooLargeError';
  }
}

export const isRequestBodyTooLargeError = (value: unknown): value is Error =>
  hasErrorBrand(value, BODY_TOO_LARGE_BRAND);
