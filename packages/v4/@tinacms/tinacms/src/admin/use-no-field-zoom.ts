import { useEffect } from 'react';

const VIEWPORT = 'meta[name="viewport"]';
const NO_ZOOM = 'maximum-scale=1';

// iOS and iPadOS Safari zoom into a focused field under 16px; other browsers do not.
const isAppleTouch = (): boolean =>
  navigator.maxTouchPoints > 0 &&
  /iPhone|iPad|Mac/.test(`${navigator.platform} ${navigator.userAgent}`);

const hostOwnsZoom = (content: string): boolean =>
  /maximum-scale|user-scalable/.test(content);

/**
 * Stops iOS zooming into a focused 14px field while the admin is mounted, by appending
 * `maximum-scale=1` to the page's viewport tag. The host's own zoom values are never overwritten, a
 * replaced tag is patched again, and unmounting restores the original content (or removes a tag it
 * created). Does nothing off Apple touch devices.
 */
export function useNoFieldZoom(): void {
  useEffect(() => {
    if (!isAppleTouch()) return;

    let created: HTMLMetaElement | null = null;
    let patched: {
      meta: HTMLMetaElement;
      original: string;
      applied: string;
    } | null = null;

    const apply = () => {
      let meta = document.head.querySelector<HTMLMetaElement>(VIEWPORT);
      if (
        patched &&
        meta === patched.meta &&
        meta.content === patched.applied
      ) {
        return;
      }
      if (patched && meta !== patched.meta) {
        patched.meta.setAttribute('content', patched.original);
      }
      patched = null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1';
        document.head.append(meta);
        created = meta;
      }
      const original = meta.content;
      if (hostOwnsZoom(original)) return;
      const applied = original ? `${original}, ${NO_ZOOM}` : NO_ZOOM;
      patched = { meta, original, applied };
      meta.content = applied;
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['content'],
    });

    return () => {
      observer.disconnect();
      if (created) created.remove();
      else if (patched) patched.meta.content = patched.original;
    };
  }, []);
}
