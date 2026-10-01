export const MAX_REQUEST_BODY_BYTES = 5 * 1024 * 1024;

export const MAX_MEDIA_UPLOAD_BYTES = 25 * 1024 * 1024;

export class RequestBodyTooLargeError extends Error {
  constructor(limit = MAX_REQUEST_BODY_BYTES) {
    super(`The request body is larger than ${limit} bytes.`);
    this.name = 'RequestBodyTooLargeError';
  }
}
