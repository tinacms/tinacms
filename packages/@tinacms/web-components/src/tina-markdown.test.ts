import { afterEach, describe, expect, it } from 'vitest';
import { TinaMarkdown } from './tina-markdown.js';

function render(content: unknown): ShadowRoot {
  const el = document.createElement('tina-markdown');
  el.setAttribute('content', JSON.stringify(content));
  document.body.appendChild(el);
  return el.shadowRoot as ShadowRoot;
}

describe('tina-markdown', () => {
  it('renders a paragraph of text', () => {
    const root = render({
      type: 'root',
      children: [
        { type: 'p', children: [{ type: 'text', text: 'Hello world' }] },
      ],
    });

    const p = root.querySelector('p');
    expect(p).not.toBeNull();
    expect(p?.textContent).toBe('Hello world');
  });

  it('maps headings h1-h6 to their tags', () => {
    const root = render({
      type: 'root',
      children: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((type) => ({
        type,
        children: [{ type: 'text', text: type }],
      })),
    });

    for (const type of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) {
      expect(root.querySelector(type)?.textContent).toBe(type);
    }
  });

  it('wraps text in the correct mark elements', () => {
    const cases = [
      ['bold', 'STRONG'],
      ['italic', 'EM'],
      ['underline', 'U'],
      ['strikethrough', 'S'],
      ['code', 'CODE'],
      ['highlight', 'MARK'],
    ] as const;

    for (const [mark, tag] of cases) {
      const root = render({
        type: 'root',
        children: [
          {
            type: 'p',
            children: [{ type: 'text', text: 'text', [mark]: true }],
          },
        ],
      });

      const firstChild = root.querySelector('p')?.firstElementChild;
      expect(firstChild?.tagName, `${mark} should map to <${tag}>`).toBe(tag);
      expect(firstChild?.textContent).toBe('text');
    }
  });

  it('nests marks with later marks wrapping earlier ones', () => {
    const root = render({
      type: 'root',
      children: [
        {
          type: 'p',
          children: [{ type: 'text', text: 'x', bold: true, italic: true }],
        },
      ],
    });

    const p = root.querySelector('p');
    expect(p?.firstElementChild?.tagName).toBe('EM');
    expect(p?.firstElementChild?.firstElementChild?.tagName).toBe('STRONG');
    expect(p?.textContent).toBe('x');
  });

  it('renders links with an href', () => {
    const root = render({
      type: 'root',
      children: [
        {
          type: 'a',
          url: 'https://example.com',
          children: [{ type: 'text', text: 'link' }],
        },
      ],
    });

    const a = root.querySelector('a');
    expect(a?.getAttribute('href')).toBe('https://example.com');
    expect(a?.textContent).toBe('link');
  });

  it('renders images with a src', () => {
    const root = render({
      type: 'root',
      children: [{ type: 'img', url: '/image.png' }],
    });

    expect(root.querySelector('img')?.getAttribute('src')).toBe('/image.png');
  });

  it('renders ordered and unordered lists', () => {
    const root = render({
      type: 'root',
      children: [
        {
          type: 'ul',
          children: [{ type: 'li', children: [{ type: 'text', text: 'a' }] }],
        },
        {
          type: 'ol',
          children: [{ type: 'li', children: [{ type: 'text', text: 'b' }] }],
        },
      ],
    });

    expect(root.querySelector('ul li')?.textContent).toBe('a');
    expect(root.querySelector('ol li')?.textContent).toBe('b');
  });

  it('renders code blocks in a pre > code with the lang attribute', () => {
    const root = render({
      type: 'root',
      children: [{ type: 'code_block', lang: 'js', value: 'const x = 1;' }],
    });

    const pre = root.querySelector('pre');
    const code = pre?.querySelector('code');
    expect(pre).not.toBeNull();
    expect(code?.getAttribute('lang')).toBe('js');
    expect(code?.textContent).toBe('const x = 1;');
  });

  it('joins multi-line code children with line breaks', () => {
    const root = render({
      type: 'root',
      children: [
        {
          type: 'code_block',
          lang: 'js',
          children: [
            { type: 'p', children: [{ type: 'text', text: 'line one' }] },
            { type: 'p', children: [{ type: 'text', text: 'line two' }] },
          ],
        },
      ],
    });

    const code = root.querySelector('code');
    expect(code?.innerHTML).toContain('line one');
    expect(code?.innerHTML).toContain('line two');
    expect(code?.innerHTML).toContain('<br>');
  });

  it('renders tables inside a tbody', () => {
    const root = render({
      type: 'root',
      children: [
        {
          type: 'table',
          children: [
            {
              type: 'tr',
              children: [
                { type: 'td', children: [{ type: 'text', text: 'cell' }] },
              ],
            },
          ],
        },
      ],
    });

    const table = root.querySelector('table');
    expect(table?.querySelector('tbody')).not.toBeNull();
    expect(table?.querySelector('tr td')?.textContent).toBe('cell');
  });

  it('renders blockquotes', () => {
    const root = render({
      type: 'root',
      children: [
        { type: 'blockquote', children: [{ type: 'text', text: 'quote' }] },
      ],
    });

    expect(root.querySelector('blockquote')?.textContent).toBe('quote');
  });

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

  it('renders invalid markdown as pre', () => {
    const root = render({
      type: 'root',
      children: [
        {
          type: 'invalid_markdown',
          children: [{ type: 'text', text: 'garbage' }],
        },
      ],
    });

    expect(root.querySelector('pre')?.textContent).toBe('garbage');
  });

  it('renders hr and break elements', () => {
    const root = render({
      type: 'root',
      children: [{ type: 'hr' }, { type: 'break' }],
    });

    expect(root.querySelector('hr')).not.toBeNull();
    expect(root.querySelector('br')).not.toBeNull();
  });

  it('wraps all root children in a single container, preserving order', () => {
    const root = render({
      type: 'root',
      children: [
        { type: 'h1', children: [{ type: 'text', text: 'Title' }] },
        { type: 'p', children: [{ type: 'text', text: 'Body' }] },
      ],
    });

    expect(root.childNodes.length).toBe(1);
    expect(root.firstElementChild?.tagName).toBe('DIV');
    expect(root.textContent).toBe('TitleBody');
  });

  it('renders an empty root as an empty container', () => {
    const root = render({ type: 'root' });

    expect(root.childNodes.length).toBe(1);
    expect(root.textContent).toBe('');
  });

  it('throws when the content attribute is not valid JSON', () => {
    const el = document.createElement('tina-markdown');
    el.setAttribute('content', 'not json');

    expect(() => document.body.appendChild(el)).toThrow();
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

  it('does not route node types through the components map', () => {
    TinaMarkdown.components = {
      h1: (node: { children: { text: string }[] }) => {
        const el = document.createElement('h1');
        el.className = 'fancy';
        el.textContent = node.children[0].text;
        return el;
      },
    };

    const root = render({
      type: 'root',
      children: [{ type: 'h1', children: [{ type: 'text', text: 'Title' }] }],
    });

    const h1 = root.querySelector('h1');
    expect(h1?.textContent).toBe('Title');
    expect(h1?.className).toBe('');
  });

  it('routes mdx custom elements through components by name', () => {
    TinaMarkdown.components = {
      PostPreview: (node: { props: { title: string } }) => {
        const el = document.createElement('div');
        el.className = 'preview';
        el.textContent = node.props.title;
        return el;
      },
    };

    const root = render({
      type: 'root',
      children: [
        {
          type: 'mdxJsxFlowElement',
          name: 'PostPreview',
          props: { title: 'Hello' },
        },
      ],
    });

    const preview = root.querySelector('.preview');
    expect(preview?.textContent).toBe('Hello');
  });
});
