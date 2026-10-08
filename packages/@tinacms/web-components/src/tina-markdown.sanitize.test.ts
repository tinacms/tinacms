// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { TinaMarkdown } from './tina-markdown.js';

function render(content: unknown): ShadowRoot {
  const el = document.createElement('tina-markdown');
  el.setAttribute('content', JSON.stringify(content));
  document.body.appendChild(el);
  return el.shadowRoot as ShadowRoot;
}

describe('tina-markdown raw HTML passthrough', () => {
  it('passes raw html through', () => {
    const root = render({
      type: 'root',
      children: [{ type: 'html', value: '<strong>x</strong>' }],
    });

    expect(root.querySelector('strong')?.textContent).toBe('x');
  });

  it('passes inline html through', () => {
    const root = render({
      type: 'root',
      children: [{ type: 'html_inline', value: '<em>y</em>' }],
    });

    expect(root.querySelector('em')?.textContent).toBe('y');
  });
});

/**
 * Mirrors `TinaMarkdown raw HTML nodes` in `packages/tinacms` and
 * `packages/@tinacms/astro`. The three suites share case names so the
 * renderers can be compared side by side; where an expectation here differs
 * from the other two, the renderers disagree.
 *
 * One deliberate divergence: the web component has no `components.html`
 * opt-in. Raw HTML is always sanitised, so where the other two renderers have
 * a positive "opt in" case this suite asserts the sanitisation cannot be
 * bypassed, and that the `components` map is keyed by MDX component name only.
 *
 * Runs under jsdom because it matches the browser DOM semantics the
 * sanitiser relies on.
 */
describe('tina-markdown raw HTML nodes', () => {
  afterEach(() => {
    TinaMarkdown.components = {};
  });

  it('renders the markup of a block html node', () => {
    const root = render({
      type: 'root',
      children: [
        {
          type: 'html',
          value: '<div id="raw"><center><p>hi</p></center></div>',
        },
      ],
    });

    expect(root.querySelector('#raw > center > p')?.textContent).toBe('hi');
  });

  it('renders an inline html node inline within its paragraph', () => {
    const root = render({
      type: 'root',
      children: [
        {
          type: 'p',
          children: [
            { type: 'text', text: 'Some ' },
            { type: 'html_inline', value: '<b>bold</b>' },
            { type: 'text', text: ' inline.' },
          ],
        },
      ],
    });

    expect(root.querySelector('p > b')?.textContent).toBe('bold');
    expect(root.querySelector('p')?.textContent).toBe('Some bold inline.');
  });

  it('does not wrap an inline html node in a block element', () => {
    const root = render({
      type: 'root',
      children: [
        {
          type: 'p',
          children: [{ type: 'html_inline', value: '<b>bold</b>' }],
        },
      ],
    });

    expect(root.querySelector('p > div')).toBeNull();
  });

  it('strips an inline event handler while keeping the element', () => {
    const root = render({
      type: 'root',
      children: [
        { type: 'html', value: '<img src="x" onerror="globalThis.x = 1">' },
      ],
    });

    const img = root.querySelector('img');
    expect(img?.getAttribute('src')).toBe('x');
    expect(img?.getAttribute('onerror')).toBeNull();
  });

  it('drops a script element', () => {
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
    expect(root.querySelector('p')?.textContent).toBe('before');
  });

  it('keeps sanitising markup that follows a dropped element', () => {
    const root = render({
      type: 'root',
      children: [
        {
          type: 'html',
          value:
            '<p>before</p><script>globalThis.x = 1</script><b onclick="globalThis.x = 2">after</b>',
        },
      ],
    });

    expect(root.querySelector('script')).toBeNull();
    expect(root.querySelector('p')?.textContent).toBe('before');
    const b = root.querySelector('b');
    expect(b?.textContent).toBe('after');
    expect(b?.getAttribute('onclick')).toBeNull();
  });

  it('does not let components.html bypass sanitisation', () => {
    TinaMarkdown.components = {
      html: (node: { value: string }) => {
        const el = document.createElement('div');
        el.innerHTML = node.value;
        return el;
      },
    };

    const root = render({
      type: 'root',
      children: [{ type: 'html', value: '<b onclick="x">raw</b>' }],
    });

    const b = root.querySelector('b');
    expect(b?.textContent).toBe('raw');
    expect(b?.getAttribute('onclick')).toBeNull();
  });
});
