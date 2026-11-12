import { vi } from 'vitest';

/**
 * A stand-in for `XMLHttpRequest` that a test drives by hand: `progress`,
 * `finishUpload`, `respond` and `fail` play the part of the network.
 */
export class FakeXhr extends EventTarget {
  static sent: FakeXhr[] = [];
  /** Runs after each `send`, for a test that wants an answer without driving. */
  static onSend: ((xhr: FakeXhr) => void) | undefined;

  readonly upload = new EventTarget();
  method = '';
  url = '';
  requestHeaders: Record<string, string> = {};
  body: unknown;
  status = 0;
  responseText = '';
  aborted = false;
  private responseHeaders: Record<string, string> = {};

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(name: string, value: string) {
    this.requestHeaders[name.toLowerCase()] = value;
  }

  getResponseHeader(name: string): string | null {
    return this.responseHeaders[name.toLowerCase()] ?? null;
  }

  send(body: unknown) {
    this.body = body;
    FakeXhr.sent.push(this);
    FakeXhr.onSend?.(this);
  }

  abort() {
    this.aborted = true;
    this.dispatchEvent(new Event('abort'));
    this.dispatchEvent(new Event('loadend'));
  }

  progress(loaded: number, total: number) {
    this.upload.dispatchEvent(
      Object.assign(new Event('progress'), {
        lengthComputable: true,
        loaded,
        total,
      })
    );
  }

  finishUpload() {
    this.upload.dispatchEvent(new Event('load'));
  }

  respond(status: number, text = '', headers: Record<string, string> = {}) {
    this.status = status;
    this.responseText = text;
    this.responseHeaders = Object.fromEntries(
      Object.entries(headers).map(([name, value]) => [
        name.toLowerCase(),
        value,
      ])
    );
    this.dispatchEvent(new Event('load'));
    this.dispatchEvent(new Event('loadend'));
  }

  fail() {
    this.dispatchEvent(new Event('error'));
    this.dispatchEvent(new Event('loadend'));
  }
}

/** Undo it with `vi.unstubAllGlobals()`. */
export const stubXhr = (onSend?: (xhr: FakeXhr) => void): typeof FakeXhr => {
  FakeXhr.sent = [];
  FakeXhr.onSend = onSend;
  vi.stubGlobal('XMLHttpRequest', FakeXhr);
  return FakeXhr;
};
