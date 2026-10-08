import { describe, expect, it } from 'vitest';
import './tina-markdown.js';

function render(content: unknown): ShadowRoot {
  const el = document.createElement('tina-markdown');
  el.setAttribute('content', JSON.stringify(content));
  document.body.appendChild(el);
  return el.shadowRoot as ShadowRoot;
}

// Environment-agnostic invariants: they hold whether the sanitiser operates
// in this DOM implementation or the renderer falls back to plain text.
describe('tina-markdown raw HTML safety invariants', () => {
  it('never renders a script element from a raw html node', () => {
    const root = render({
      type: 'root',
      children: [
        {
          type: 'html',
          value: '<p>before</p><script>globalThis.x = 1</script>',
        },
      ],
    });

    expect(root.querySelector('script')).toBeNull();
    expect(root.textContent).toContain('before');
  });

  it('never renders an element with an inline event handler', () => {
    const root = render({
      type: 'root',
      children: [
        { type: 'html', value: '<img src="x" onerror="globalThis.x = 1">' },
      ],
    });

    expect(root.querySelector('[onerror]')).toBeNull();
  });
});
