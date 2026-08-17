import { describe, expect, it, vi } from 'vitest';
import {
  getExpectedPreviewOrigin,
  isFromTrustedPreviewOrigin,
  postMessageToPreview,
} from './preview-origin';

const ADMIN = 'https://admin.example';
const PREVIEW = 'https://preview.example';

// A stand-in for the iframe's content window; we only need an identity to
// compare `event.source` against.
const makePeerWindow = () =>
  ({ postMessage: vi.fn() }) as unknown as Window & {
    postMessage: ReturnType<typeof vi.fn>;
  };

describe('getExpectedPreviewOrigin', () => {
  it('resolves a relative admin URL to the admin origin', () => {
    expect(getExpectedPreviewOrigin('/posts/hello', ADMIN)).toBe(ADMIN);
  });

  it('keeps the origin of an absolute preview URL', () => {
    expect(getExpectedPreviewOrigin(`${PREVIEW}/posts/hello`, ADMIN)).toBe(
      PREVIEW
    );
  });
});

describe('isFromTrustedPreviewOrigin', () => {
  it('ignores messages from an untrusted origin', () => {
    const peerWindow = makePeerWindow();
    const event = {
      origin: 'https://evil.example',
      source: peerWindow,
      data: { type: 'open' },
    } as unknown as MessageEvent;

    expect(
      isFromTrustedPreviewOrigin({
        event,
        expectedOrigin: PREVIEW,
        peerWindow,
      })
    ).toBe(false);
  });

  it('accepts messages from the trusted origin and peer window', () => {
    const peerWindow = makePeerWindow();
    const event = {
      origin: PREVIEW,
      source: peerWindow,
      data: { type: 'open' },
    } as unknown as MessageEvent;

    expect(
      isFromTrustedPreviewOrigin({
        event,
        expectedOrigin: PREVIEW,
        peerWindow,
      })
    ).toBe(true);
  });

  it('ignores the trusted origin from the wrong source window', () => {
    const peerWindow = makePeerWindow();
    const otherFrame = makePeerWindow();
    const event = {
      origin: PREVIEW,
      source: otherFrame,
      data: { type: 'open' },
    } as unknown as MessageEvent;

    expect(
      isFromTrustedPreviewOrigin({
        event,
        expectedOrigin: PREVIEW,
        peerWindow,
      })
    ).toBe(false);
  });

  it('does not read event.data before validating the origin', () => {
    const peerWindow = makePeerWindow();
    const event = {
      origin: 'https://evil.example',
      source: peerWindow,
      // Reading `data` would throw — proves the guard never touches the
      // payload when the origin is untrusted.
      get data(): unknown {
        throw new Error('event.data must not be read before origin validation');
      },
    } as unknown as MessageEvent;

    expect(() =>
      isFromTrustedPreviewOrigin({
        event,
        expectedOrigin: PREVIEW,
        peerWindow,
      })
    ).not.toThrow();
    expect(
      isFromTrustedPreviewOrigin({
        event,
        expectedOrigin: PREVIEW,
        peerWindow,
      })
    ).toBe(false);
  });

  it('falls back to origin-only when no peer window handle is available', () => {
    const event = {
      origin: PREVIEW,
      source: makePeerWindow(),
      data: { type: 'open' },
    } as unknown as MessageEvent;

    expect(
      isFromTrustedPreviewOrigin({
        event,
        expectedOrigin: PREVIEW,
        peerWindow: null,
      })
    ).toBe(true);
  });
});

describe('postMessageToPreview', () => {
  it('posts with the exact expected targetOrigin, not a wildcard', () => {
    const peerWindow = makePeerWindow();
    const message = { type: 'updateData', id: 'q1', data: {} };

    postMessageToPreview(peerWindow, message, PREVIEW);

    expect(peerWindow.postMessage).toHaveBeenCalledWith(message, PREVIEW);
    expect(peerWindow.postMessage).not.toHaveBeenCalledWith(
      expect.anything(),
      '*'
    );
  });

  it('no-ops when there is no peer window', () => {
    expect(() =>
      postMessageToPreview(null, { type: 'updateData' }, PREVIEW)
    ).not.toThrow();
  });
});
