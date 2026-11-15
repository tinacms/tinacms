let boundary: HTMLElement | null = null;

/**
 * An invisible box the size of the visual viewport. Radix menus and popovers
 * collide with it, so an on-screen keyboard shrinks the room they have.
 */
function visualViewportBoundary(): HTMLElement[] {
  const viewport = window.visualViewport;
  if (!viewport) return [];
  if (!boundary?.isConnected) {
    const element = document.createElement('div');
    element.setAttribute('aria-hidden', 'true');
    element.style.cssText =
      'position:fixed;left:0;width:100%;pointer-events:none;visibility:hidden';
    document.body.appendChild(element);
    boundary = element;
    viewport.addEventListener('resize', () => {
      element.style.top = `${viewport.offsetTop}px`;
      element.style.height = `${viewport.height}px`;
      window.dispatchEvent(new Event('resize'));
    });
  }
  boundary.style.top = `${viewport.offsetTop}px`;
  boundary.style.height = `${viewport.height}px`;
  return [boundary];
}

/** The `collisionBoundary` for a Radix content, read when the content renders. */
export const useVisualViewportBoundary = visualViewportBoundary;
