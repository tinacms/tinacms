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

describe('TinaMarkdown table rendering', () => {
  const tableContent = {
    type: 'root',
    children: [
      {
        type: 'table',
        props: { align: ['left', 'right'] },
        children: [
          {
            type: 'tr',
            children: [
              {
                type: 'th',
                children: [
                  { type: 'p', children: [{ type: 'text', text: 'Name' }] },
                ],
              },
              {
                type: 'th',
                children: [
                  { type: 'p', children: [{ type: 'text', text: 'Age' }] },
                ],
              },
            ],
          },
          {
            type: 'tr',
            children: [
              {
                type: 'td',
                children: [
                  { type: 'p', children: [{ type: 'text', text: 'Alice' }] },
                ],
              },
              {
                type: 'td',
                children: [
                  { type: 'p', children: [{ type: 'text', text: '30' }] },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  it('renders the first row as a semantic thead/th', () => {
    const { container } = render(
      <TinaMarkdown content={tableContent as any} />
    );
    const thead = container.querySelector('thead');
    expect(thead).not.toBeNull();
    const ths = thead?.querySelectorAll('th');
    expect(ths?.length).toBe(2);
    expect(ths?.[0].textContent).toBe('Name');
    expect(ths?.[1].textContent).toBe('Age');
  });

  it('renders remaining rows as tbody/td', () => {
    const { container } = render(
      <TinaMarkdown content={tableContent as any} />
    );
    const tbody = container.querySelector('tbody');
    expect(tbody).not.toBeNull();
    const tds = tbody?.querySelectorAll('td');
    expect(tds?.length).toBe(2);
    expect(tds?.[0].textContent).toBe('Alice');
    expect(tds?.[1].textContent).toBe('30');
  });

  it('does not put header content inside tbody', () => {
    const { container } = render(
      <TinaMarkdown content={tableContent as any} />
    );
    const tbody = container.querySelector('tbody');
    expect(tbody?.textContent).not.toContain('Name');
  });

  it('preserves column alignment on th and td', () => {
    const { container } = render(
      <TinaMarkdown content={tableContent as any} />
    );
    const th = container.querySelector('thead th');
    const td = container.querySelector('tbody td');
    expect(th?.getAttribute('style')).toContain('text-align: left');
    expect(td?.getAttribute('style')).toContain('text-align: left');
  });
});