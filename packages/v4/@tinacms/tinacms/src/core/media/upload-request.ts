import type { MediaUploadOptions } from './contract';

export interface UploadRequest {
  url: string;
  method: 'POST' | 'PUT';
  headers?: Record<string, string>;
  body: FormData | Blob;
}

export interface UploadResponse {
  status: number;
  text: string;
  header(name: string): string | null;
}

export const uploadAbortError = (): DOMException =>
  new DOMException('The upload was aborted.', 'AbortError');

export const isAbortError = (cause: unknown): boolean => {
  if (cause instanceof Error) return cause.name === 'AbortError';
  return false;
};

/** The request got no HTTP answer. It is not a `MediaError` by design. */
class UploadConnectionError extends Error {
  constructor() {
    super('The upload request got no answer.');
    this.name = 'UploadConnectionError';
  }
}

/**
 * Sends a request body by `XMLHttpRequest`, because `fetch` cannot report
 * upload progress. Resolves for every HTTP status. A request that gets no
 * answer rejects with an `UploadConnectionError`. It follows the two rules of
 * `MediaUploadOptions.signal`: an abort before the last byte rejects with an
 * `AbortError`, and a later abort does nothing.
 */
export const sendUpload = (
  request: UploadRequest,
  { onProgress, signal }: MediaUploadOptions = {}
): Promise<UploadResponse> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(uploadAbortError());
      return;
    }
    const xhr = new XMLHttpRequest();
    let reported = 0;
    const report = (fraction: number) => {
      if (fraction <= reported) return;
      reported = fraction;
      onProgress?.(fraction);
    };
    const abort = () => xhr.abort();
    const ignoreSignal = () => signal?.removeEventListener('abort', abort);

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && event.total > 0) {
        report(event.loaded / event.total);
      }
    });
    xhr.upload.addEventListener('load', () => {
      ignoreSignal();
      report(1);
    });
    xhr.addEventListener('loadend', ignoreSignal);
    xhr.addEventListener('load', () =>
      resolve({
        status: xhr.status,
        text: xhr.responseText,
        header: (name) => xhr.getResponseHeader(name),
      })
    );
    xhr.addEventListener('error', () => reject(new UploadConnectionError()));
    xhr.addEventListener('abort', () => reject(uploadAbortError()));

    xhr.open(request.method, request.url);
    for (const [name, value] of Object.entries(request.headers ?? {})) {
      xhr.setRequestHeader(name, value);
    }
    signal?.addEventListener('abort', abort);
    onProgress?.(0);
    xhr.send(request.body);
  });
