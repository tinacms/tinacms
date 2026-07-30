import { describe, expect, it } from 'vitest';
import { type RichTextHost, renderRichText, styleToCss } from './render';
import type { TinaMarkdownContent } from './types';

const VOID_TAGS = new Set(['img', 'hr', 'br']);

const escape = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const attributes = (props: Record<string, unknown>) =>
  Object.entries(props)
    .map(([name, value]) => [
      name,
      name === 'style' ? styleToCss(value as any) : value,
    ])
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([name, value]) => ` ${name}="${escape(String(value))}"`)
    .join('');

const stringHost: RichTextHost<string> = {
  element: (tag, props, children) =>
    VOID_TAGS.has(tag)
      ? `<${tag}${attributes(props)}>`
      : `<${tag}${attributes(props)}>${children ?? ''}</${tag}>`,
  component: (component, props, children) =>
    (component as (props: any) => string)({ ...props, children }),
  text: (value) => escape(value),
  list: (items) => items.join(''),
};

const toHtml = (
  content: TinaMarkdownContent | TinaMarkdownContent[],
  components: Record<string, unknown> = {}
) => renderRichText(content, components, stringHost);

const text = (value: string, marks: Record<string, unknown> = {}) =>
  ({ type: 'text', text: value, ...marks }) as TinaMarkdownContent;

describe('a host that is not a framework', () => {
  it('renders a heading and a paragraph', () => {
    expect(
      toHtml([
        { type: 'h1', children: [text('Title')] },
        { type: 'p', children: [text('Body')] },
      ])
    ).toBe('<h1>Title</h1><p>Body</p>');
  });

  it('nests marks outermost first', () => {
    expect(
      toHtml([
        {
          type: 'p',
          children: [text('hi', { bold: true, italic: true, code: true })],
        },
      ])
    ).toBe('<p><strong><em><code>hi</code></em></strong></p>');
  });

  it('styles a highlight with its colour', () => {
    expect(
      toHtml([
        {
          type: 'p',
          children: [text('hi', { highlight: true, highlightColor: '#ff0' })],
        },
      ])
    ).toBe('<p><mark style="background-color: #ff0;">hi</mark></p>');
  });

  it('renders a list', () => {
    expect(
      toHtml([
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
      toHtml([{ type: 'code_block', value: 'plain' } as TinaMarkdownContent])
    ).toBe('<pre><code>plain</code></pre>');
  });

  it('escapes raw html instead of injecting it', () => {
    expect(
      toHtml([{ type: 'html', value: '<script>alert(1)</script>' } as any])
    ).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('drops an unsafe url', () => {
    expect(
      toHtml([{ type: 'a', url: 'javascript:alert(1)', children: [] } as any])
    ).not.toContain('javascript');
  });

  it('says which component was missing', () => {
    expect(
      toHtml([{ type: 'mdxJsxFlowElement', name: 'Hero', props: {} } as any])
    ).toBe('<span>No component provided for Hero</span>');
  });

  it('calls a component the site supplied', () => {
    expect(
      toHtml(
        [
          {
            type: 'mdxJsxFlowElement',
            name: 'Hero',
            props: { title: 'Hi' },
          } as any,
        ],
        { Hero: (props: any) => `<h1>${props.title}</h1>` }
      )
    ).toBe('<h1>Hi</h1>');
  });

  it('renders an mdx table with a header row', () => {
    const cell = (value: string) => ({
      value: [{ type: 'p', children: [text(value)] }],
    });
    expect(
      toHtml([
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

  it('renders a pipe table with the border fallback', () => {
    expect(
      toHtml([
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
    ).toBe(
      '<table style="border: 1px solid #EDECF3;"><tbody><tr>' +
        '<td style="border: 1px solid #EDECF3; padding: 0.25rem;">A</td>' +
        '</tr></tbody></table>'
    );
  });

  it('renders nothing for an empty value', () => {
    expect(toHtml(undefined as any)).toBe('');
    expect(toHtml({ type: 'root' })).toBe('');
  });
});

describe('styleToCss', () => {
  it('kebab-cases the properties and drops the empty ones', () => {
    expect(styleToCss({ backgroundColor: '#ff0', textAlign: undefined })).toBe(
      'background-color: #ff0;'
    );
  });

  it('has nothing to say about an empty style', () => {
    expect(styleToCss({ textAlign: undefined })).toBeUndefined();
    expect(styleToCss(undefined)).toBeUndefined();
  });
});
