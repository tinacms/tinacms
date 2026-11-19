import { afterEach, describe, expect, it, vi } from 'vitest';
import { stubXhr } from '../../test/fake-xhr';
import { MediaError } from './contract';
import { isAbortError, sendUpload } from './upload-request';

const request = {
  url: '/upload',
  method: 'POST',
  headers: { authorization: 'Bearer tok' },
  body: new Blob(['bytes']),
} as const;

afterEach(() => vi.unstubAllGlobals());

describe('sendUpload', () => {
  it('sends the request and resolves with the response', async () => {
    const { sent } = stubXhr();
    const done = sendUpload(request);
    const [xhr] = sent;
    expect(xhr).toMatchObject({
      method: 'POST',
      url: '/upload',
      requestHeaders: { authorization: 'Bearer tok' },
      body: request.body,
    });
    xhr.respond(201, 'made', { 'X-Reason': 'ok' });
    const response = await done;
    expect(response).toMatchObject({ status: 201, text: 'made' });
    expect(response.header('x-reason')).toBe('ok');
  });

  it('resolves for a refused request, so the caller reads the status', async () => {
    const { sent } = stubXhr();
    const done = sendUpload(request);
    sent[0].respond(413, 'too big');
    expect(await done).toMatchObject({ status: 413, text: 'too big' });
  });

  it('reports progress from 0 to 1, and never a lower value', async () => {
    const { sent } = stubXhr();
    const onProgress = vi.fn();
    const done = sendUpload(request, { onProgress });
    const [xhr] = sent;
    xhr.progress(25, 100);
    xhr.progress(20, 100);
    xhr.progress(80, 100);
    xhr.finishUpload();
    xhr.respond(200);
    await done;
    expect(onProgress.mock.calls.map(([fraction]) => fraction)).toEqual([
      0, 0.25, 0.8, 1,
    ]);
  });

  it('rejects a lost connection with an error that is no MediaError and no abort', async () => {
    const { sent } = stubXhr();
    const done = sendUpload(request);
    sent[0].fail();
    const failure = await done.catch((cause: unknown) => cause);
    expect(failure).toBeInstanceOf(Error);
    expect(failure).not.toBeInstanceOf(MediaError);
    expect(isAbortError(failure)).toBe(false);
  });

  it('sends nothing for a signal that is already aborted', async () => {
    const { sent } = stubXhr();
    const onProgress = vi.fn();
    await expect(
      sendUpload(request, { signal: AbortSignal.abort(), onProgress })
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(sent).toHaveLength(0);
    expect(onProgress).not.toHaveBeenCalled();
  });

  it('aborts the request when the signal aborts before the last byte', async () => {
    const { sent } = stubXhr();
    const controller = new AbortController();
    const done = sendUpload(request, { signal: controller.signal });
    sent[0].progress(50, 100);
    controller.abort();
    const failure = await done.catch((cause: unknown) => cause);
    expect(failure).toBeInstanceOf(DOMException);
    expect(failure).toMatchObject({ name: 'AbortError' });
    expect(sent[0].aborted).toBe(true);
  });

  it('ignores the signal once every byte is sent', async () => {
    const { sent } = stubXhr();
    const controller = new AbortController();
    const done = sendUpload(request, { signal: controller.signal });
    sent[0].finishUpload();
    controller.abort();
    expect(sent[0].aborted).toBe(false);
    sent[0].respond(200, 'saved');
    expect(await done).toMatchObject({ status: 200, text: 'saved' });
  });
});
