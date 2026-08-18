import { render } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { TinaMarkdown } from './index';

describe('TinaMarkdown URL sanitization', () => {
  it('drops an unsafe link URL', () => {
    const { container } = render(
      <TinaMarkdown
        content={
          {
            type: 'root',
            children: [
              {
                type: 'a',
                url: 'javascript:alert(1)',
                children: [{ type: 'text', text: 'link' }],
              },
            ],
          } as any
        }
      />
    );
    const anchor = container.querySelector('a');
    expect(anchor?.getAttribute('href')).toBe('');
  });

  it('preserves a safe link URL', () => {
    const { container } = render(
      <TinaMarkdown
        content={
          {
            type: 'root',
            children: [
              {
                type: 'a',
                url: 'https://example.com/path',
                children: [{ type: 'text', text: 'link' }],
              },
            ],
          } as any
        }
      />
    );
    const anchor = container.querySelector('a');
    expect(anchor?.getAttribute('href')).toBe('https://example.com/path');
  });

  it('drops an unsafe image URL', () => {
    const { container } = render(
      <TinaMarkdown
        content={
          {
            type: 'root',
            children: [
              { type: 'img', url: 'javascript:alert(1)', children: [] },
            ],
          } as any
        }
      />
    );
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toBe('');
  });
});

/**
 * Characterises what this renderer does with `html` / `html_inline` nodes, so
 * the behaviour is pinned while `@tinacms/astro` and `@tinacms/web-components`
 * are brought into line. The same cases exist in those packages' suites.
 */
describe('TinaMarkdown raw HTML nodes', () => {
  const renderNode = (node: unknown) =>
    render(<TinaMarkdown content={{ type: 'root', children: [node] } as any} />)
      .container;

  it('does not build DOM from a block html node', () => {
    const container = renderNode({
      type: 'html',
      value: '<div id="raw"><center><p>hi</p></center></div>',
    });

    expect(container.querySelector('#raw')).toBeNull();
    expect(container.textContent).toContain('<div id="raw">');
  });

  it('does not build DOM from an inline html node', () => {
    const container = render(
      <TinaMarkdown
        content={
          {
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
          } as any
        }
      />
    ).container;

    expect(container.querySelector('b')).toBeNull();
    expect(container.querySelector('p')?.textContent).toBe(
      'Some <b>bold</b> inline.'
    );
  });

  it('does not create an element carrying an inline event handler', () => {
    const container = renderNode({
      type: 'html',
      value: '<img src="x" onerror="globalThis.__tinaRawHtmlProbe = true">',
    });

    expect(container.querySelector('img')).toBeNull();
  });

  it('renders raw HTML when the consumer opts in via components.html', () => {
    const { container } = render(
      <TinaMarkdown
        content={
          {
            type: 'root',
            children: [{ type: 'html', value: '<div id="raw">hi</div>' }],
          } as any
        }
        components={
          {
            html: (props: { value: string }) => (
              <div dangerouslySetInnerHTML={{ __html: props.value }} />
            ),
          } as any
        }
      />
    );

    expect(container.querySelector('#raw')?.textContent).toBe('hi');
  });
});
