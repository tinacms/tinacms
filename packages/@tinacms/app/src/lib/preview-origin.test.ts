import { describe, expect, it, vi } from 'vitest';
import {
  getPreviewOrigin,
  isFromTrustedPreviewOrigin,
  postMessageToPreview,
} from './preview-origin';

const PREVIEW = 'https://preview.example';

// A stand-in for the iframe's content window; we only need an identity to
// compare `event.source` against.
const makePeerWindow = () =>
  ({ postMessage: vi.fn() }) as unknown as Window & {
    postMessage: ReturnType<typeof vi.fn>;
  };

describe('getPreviewOrigin', () => {
  it('is the origin the admin itself is served from', () => {
    expect(getPreviewOrigin()).toBe(window.location.origin);
  });

  /**
   * The origin used to be resolved from the preview URL, so a URL naming
   * another origin moved the trust anchor to it. The preview is always loaded
   * from the admin's own origin, so nothing it carries is consulted here.
   */
  it('takes no argument that could name another origin', () => {
    expect(getPreviewOrigin.length).toBe(0);
    expect(
      (getPreviewOrigin as (...args: unknown[]) => string)(
        `${PREVIEW}/posts/hello`
      )
    ).toBe(window.location.origin);
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
