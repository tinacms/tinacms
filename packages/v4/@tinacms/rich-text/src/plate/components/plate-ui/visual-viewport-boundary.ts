let boundary: HTMLElement | null = null;

// Radix measures room against the layout viewport, which an on-screen keyboard leaves alone.
// This box follows the visual viewport, and the resize event it re-dispatches makes open
// menus measure again. One box and one listener serve the whole page.
export function visualViewportBoundary(): HTMLElement[] {
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
