export const MAX_REQUEST_BODY_BYTES = 5 * 1024 * 1024;

export class RequestBodyTooLargeError extends Error {
  constructor() {
    super(`The request body is larger than ${MAX_REQUEST_BODY_BYTES} bytes.`);
    this.name = 'RequestBodyTooLargeError';
  }
}
