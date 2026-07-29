import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { TinaMarkdownContent } from '../../rich-text';
import { StaticTinaMarkdown, TinaMarkdown } from './tina-markdown';

// The binding is thin, so these tests are about the markup it lands on: the fallbacks a
// site gets without supplying anything, and the seams where a supplied component takes
// over. They double as the parity check between the memoised and the static renderer.

const html = (
  content: TinaMarkdownContent | TinaMarkdownContent[],
  components?: any
) =>
  render(<TinaMarkdown content={content} components={components} />).container
    .innerHTML;

const staticHtml = (
  content: TinaMarkdownContent | TinaMarkdownContent[],
  components?: any
) =>
  render(<StaticTinaMarkdown content={content} components={components} />)
    .container.innerHTML;

const text = (value: string, marks: Record<string, unknown> = {}) =>
  ({ type: 'text', text: value, ...marks }) as TinaMarkdownContent;

describe('fallback markup', () => {
  it('renders nothing for an empty value', () => {
    expect(html(undefined as any)).toBe('');
    expect(html({ type: 'root' })).toBe('');
  });

  it('renders a heading and a paragraph', () => {
    expect(
      html([
        { type: 'h1', children: [text('Title')] },
        { type: 'p', children: [text('Body')] },
      ])
    ).toBe('<h1>Title</h1><p>Body</p>');
  });

  it('nests marks outermost first', () => {
    expect(
      html([
        {
          type: 'p',
          children: [text('hi', { bold: true, italic: true, code: true })],
        },
      ])
    ).toBe('<p><strong><em><code>hi</code></em></strong></p>');
  });

  it('styles a highlight with its colour', () => {
    expect(
      html([
        {
          type: 'p',
          children: [text('hi', { highlight: true, highlightColor: '#ff0' })],
        },
      ])
    ).toBe('<p><mark style="background-color: #ff0;">hi</mark></p>');
  });

  it('renders a list', () => {
    expect(
      html([
        {
          type: 'ul',
          children: [
            {
              type: 'li',
              children: [{ type: 'lic', children: [text('one')] }],
            },
          ],
        },
      ])
    ).toBe('<ul><li><div>one</div></li></ul>');
  });

  it('renders a code block as pre and code', () => {
    expect(
      html([
        {
          type: 'code_block',
          children: [
            { type: 'code_line', children: [text('one')] },
            { type: 'code_line', children: [text('two')] },
          ],
        } as TinaMarkdownContent,
      ])
    ).toBe('<pre><code>one\ntwo</code></pre>');
  });

  it('escapes raw html instead of injecting it', () => {
    expect(
      html([{ type: 'html', value: '<script>alert(1)</script>' } as any])
    ).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('drops an unsafe url', () => {
    expect(
      html([{ type: 'a', url: 'javascript:alert(1)', children: [] } as any])
    ).not.toContain('javascript');
  });

  it('says which component was missing', () => {
    expect(
      html([{ type: 'mdxJsxFlowElement', name: 'Hero', props: {} } as any])
    ).toBe('<span>No component provided for Hero</span>');
  });
});

describe('supplied components', () => {
  it('takes over a block and receives its rendered children', () => {
    expect(
      html([{ type: 'p', children: [text('hi')] }], {
        p: (props: any) => <p className='lead'>{props.children}</p>,
      })
    ).toBe('<p class="lead">hi</p>');
  });

  it('receives the props of the node itself', () => {
    expect(
      html(
        [{ type: 'a', url: 'https://tina.io', children: [text('go')] } as any],
        {
          a: (props: any) => <a href={props.url}>{props.children}</a>,
        }
      )
    ).toBe('<a href="https://tina.io">go</a>');
  });

  it('renders an mdx element with the props from the tree', () => {
    expect(
      html(
        [
          {
            type: 'mdxJsxFlowElement',
            name: 'Hero',
            props: { title: 'Hi' },
          } as any,
        ] as any,
        {
          Hero: (props: any) => <h1>{props.title}</h1>,
        }
      )
    ).toBe('<h1>Hi</h1>');
  });

  it('wraps a leaf in a supplied mark component', () => {
    expect(
      html([{ type: 'p', children: [text('hi', { bold: true })] }], {
        bold: (props: any) => <b className='loud'>{props.children}</b>,
      })
    ).toBe('<p><b class="loud">hi</b></p>');
  });

  it('falls back to block_quote when only the deprecated name is given', () => {
    expect(
      html([{ type: 'blockquote', children: [text('hi')] }], {
        block_quote: (props: any) => <blockquote>{props.children}</blockquote>,
      })
    ).toBe('<blockquote>hi</blockquote>');
  });
});

describe('tables', () => {
  // A cell holds a list of blocks, and the renderer swaps `p` for the cell element, so
  // the paragraph wrapper is what becomes the th or td.
  const cell = (value: string) => ({
    value: [{ type: 'p', children: [text(value)] }] as any,
  });

  it('renders an mdx table with a header row', () => {
    expect(
      html([
        {
          type: 'mdxJsxFlowElement',
          name: 'table',
          props: {
            firstRowHeader: true,
            align: ['left', 'right'],
            tableRows: [
              { tableCells: [cell('A'), cell('B')] },
              { tableCells: [cell('1'), cell('2')] },
            ],
          },
        } as any,
      ])
    ).toBe(
      '<table><thead><tr>' +
        '<th align="left" style="text-align: left;">A</th>' +
        '<th align="right" style="text-align: right;">B</th>' +
        '</tr></thead><tbody><tr>' +
        '<td align="left" style="text-align: left;">1</td>' +
        '<td align="right" style="text-align: right;">2</td>' +
        '</tr></tbody></table>'
    );
  });

  it('leaves an unaligned cell without a text-align rule', () => {
    expect(
      html([
        {
          type: 'mdxJsxFlowElement',
          name: 'table',
          props: { tableRows: [{ tableCells: [cell('A')] }] },
        } as any,
      ])
    ).toBe('<table><tbody><tr><td>A</td></tr></tbody></table>');
  });

  it('hands a supplied table component the raw props', () => {
    expect(
      html(
        [
          {
            type: 'mdxJsxFlowElement',
            name: 'table',
            props: { tableRows: [{ tableCells: [cell('A')] }] },
          } as any,
        ],
        { table: (props: any) => <div>{props.tableRows.length} row</div> }
      )
    ).toBe('<div>1 row</div>');
  });

  it('renders a pipe table with the border fallback', () => {
    expect(
      html([
        {
          type: 'table',
          children: [
            {
              type: 'tr',
              children: [
                {
                  type: 'td',
                  children: [{ type: 'p', children: [text('A')] }],
                },
              ],
            },
          ],
        } as any,
      ])
    ).toContain(
      '<td style="border: 1px solid #EDECF3; padding: 0.25rem;">A</td>'
    );
  });
});

describe('the static renderer', () => {
  const fixture: TinaMarkdownContent[] = [
    { type: 'h1', children: [text('Title')] },
    { type: 'p', children: [text('hi', { bold: true, italic: true })] },
    {
      type: 'ul',
      children: [
        { type: 'li', children: [{ type: 'lic', children: [text('one')] }] },
      ],
    },
    { type: 'code_block', value: 'plain' } as TinaMarkdownContent,
    { type: 'hr' },
  ];

  it('renders what the memoised one renders', () => {
    expect(staticHtml(fixture)).toBe(html(fixture));
  });

  it('renders supplied components the same way', () => {
    const components = {
      p: (props: any) => <p className='lead'>{props.children}</p>,
      bold: (props: any) => <b>{props.children}</b>,
    };
    expect(staticHtml(fixture, components)).toBe(html(fixture, components));
  });
});
