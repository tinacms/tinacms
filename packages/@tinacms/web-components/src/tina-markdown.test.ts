import { afterEach, describe, expect, it } from 'vitest';
import { TinaMarkdown } from './tina-markdown.js';

function render(content: unknown): ShadowRoot {
  const el = document.createElement('tina-markdown');
  el.setAttribute('content', JSON.stringify(content));
  document.body.appendChild(el);
  return el.shadowRoot as ShadowRoot;
}

describe('tina-markdown', () => {
  afterEach(() => {
    TinaMarkdown.components = {};
  });

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

  it('drops a link url whose scheme is not allowed', () => {
    const root = render({
      type: 'root',
      children: [
        {
          type: 'a',
          url: 'javascript:alert(1)',
          children: [{ type: 'text', text: 'link' }],
        },
      ],
    });

    expect(root.querySelector('a')?.getAttribute('href')).toBe('');
    expect(root.querySelector('a')?.textContent).toBe('link');
  });

  it('drops an image url whose scheme is not allowed', () => {
    const root = render({
      type: 'root',
      children: [{ type: 'img', url: 'javascript:alert(1)' }],
    });

    expect(root.querySelector('img')?.getAttribute('src')).toBe('');
  });

  it('keeps the schemes a link is allowed to use', () => {
    const root = render({
      type: 'root',
      children: [
        { type: 'a', url: 'mailto:hi@example.com', children: [] },
        { type: 'a', url: '/relative/page', children: [] },
      ],
    });

    const [mail, relative] = [...root.querySelectorAll('a')];
    expect(mail?.getAttribute('href')).toBe('mailto:hi@example.com');
    expect(relative?.getAttribute('href')).toBe('/relative/page');
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
