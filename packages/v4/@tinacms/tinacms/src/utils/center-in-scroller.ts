/** Centres `el` in its nearest scrollable ancestor. Unlike `scrollIntoView`, it never scrolls an `overflow-hidden` ancestor such as the admin wrapper. */
export function centerInScroller(el: Element) {
  for (let node = el.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      node.scrollHeight > node.clientHeight
    ) {
      const box = node.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      node.scrollTop += rect.top + rect.height / 2 - (box.top + box.height / 2);
      return;
    }
  }
}
