import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useNoFieldZoom } from './use-no-field-zoom';

const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Safari/537.36';
const WINDOWS =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0 Safari/537.36';

function device(userAgent: string, platform: string, maxTouchPoints: number) {
  Object.defineProperty(navigator, 'userAgent', {
    value: userAgent,
    configurable: true,
  });
  Object.defineProperty(navigator, 'platform', {
    value: platform,
    configurable: true,
  });
  Object.defineProperty(navigator, 'maxTouchPoints', {
    value: maxTouchPoints,
    configurable: true,
  });
}

function Probe() {
  useNoFieldZoom();
  return null;
}

const viewport = () =>
  document.head.querySelector<HTMLMetaElement>('meta[name="viewport"]');

function setViewport(content: string) {
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = content;
  document.head.append(meta);
  return meta;
}

describe('useNoFieldZoom', () => {
  beforeEach(() => device(IPHONE, 'iPhone', 5));
  afterEach(() => {
    viewport()?.remove();
  });

  it('appends maximum-scale=1 and restores the original on unmount', () => {
    setViewport('width=device-width, initial-scale=1');
    const { unmount } = render(<Probe />);
    expect(viewport()?.content).toBe(
      'width=device-width, initial-scale=1, maximum-scale=1'
    );
    unmount();
    expect(viewport()?.content).toBe('width=device-width, initial-scale=1');
  });

  it('creates a tag when missing and removes it on unmount', () => {
    const { unmount } = render(<Probe />);
    expect(viewport()?.content).toBe(
      'width=device-width, initial-scale=1, maximum-scale=1'
    );
    unmount();
    expect(viewport()).toBeNull();
  });

  it.each([
    'width=device-width, maximum-scale=5',
    'width=device-width, user-scalable=yes',
  ])('leaves the host zoom value in %s', (content) => {
    setViewport(content);
    const { unmount } = render(<Probe />);
    expect(viewport()?.content).toBe(content);
    unmount();
    expect(viewport()?.content).toBe(content);
  });

  it('applies again when the host replaces the tag', async () => {
    const first = setViewport('width=device-width');
    render(<Probe />);
    first.remove();
    setViewport('width=device-width, initial-scale=1');
    await new Promise((resolve) => setTimeout(resolve));
    expect(viewport()?.content).toBe(
      'width=device-width, initial-scale=1, maximum-scale=1'
    );
  });

  it.each([
    ['Android', ANDROID, 'Linux armv81', 5],
    ['desktop', WINDOWS, 'Win32', 0],
    ['Windows touch', WINDOWS, 'Win32', 10],
  ])('does nothing on %s', (_name, userAgent, platform, points) => {
    device(userAgent, platform, points);
    setViewport('width=device-width');
    render(<Probe />);
    expect(viewport()?.content).toBe('width=device-width');
  });
});
