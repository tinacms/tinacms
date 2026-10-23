import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import TinaMarkdown from '../TinaMarkdown.svelte';
import type { TinaRichTextContent } from '../types';
import CalloutOverride from './fixtures/CalloutOverride.svelte';
import CodeBlockOverride from './fixtures/CodeBlockOverride.svelte';

// Svelte's server output wraps blocks in comment markers (`<!--[-->`, `<!--]-->`).
// Strip them until none are left so assertions can compare plain markup.
function withoutHydrationMarkers(html: string): string {
  let previous: string;
  do {
    previous = html;
    html = html.replace(/<!--.*?-->/g, '');
  } while (html !== previous);
  return html;
}

describe('TinaMarkdown', () => {
  it('renders semantic text and marks as plain HTML', () => {
    const { body } = render(TinaMarkdown, {
      props: {
        content: [
          { type: 'h1', children: [{ type: 'text', text: 'Renderer title' }] },
          {
            type: 'p',
            children: [
              { type: 'text', text: 'Bold text', bold: true },
              { type: 'text', text: ' and inline code', code: true },
            ],
          },
          {
            type: 'blockquote',
            children: [
              { type: 'p', children: [{ type: 'text', text: 'Quote' }] },
            ],
          },
        ] satisfies TinaRichTextContent,
      },
    });

    const html = withoutHydrationMarkers(body);
    expect(html).toContain('<h1>Renderer title</h1>');
    expect(html).toContain('<strong>Bold text</strong>');
    expect(html).toContain('<code> and inline code</code>');
    expect(html).toContain('<blockquote><p>Quote</p></blockquote>');
    expect(html).not.toContain('class=');
  });

  it('renders text and highlight colours, dropping ones that are not a plain CSS colour', () => {
    const { body } = render(TinaMarkdown, {
      props: {
        content: [
          {
            type: 'p',
            children: [
              { type: 'text', text: 'Red', textColor: '#ff0000' },
              {
                type: 'text',
                text: 'Marked',
                highlight: true,
                highlightColor: 'rgb(255 255 0)',
                textColor: 'blue',
              },
              {
                type: 'text',
                text: 'Unsafe text',
                textColor: 'red;background:url(x)',
              },
              {
                type: 'text',
                text: 'Unsafe mark',
                highlight: true,
                highlightColor: 'red;background:url(x)',
              },
            ],
          },
        ] satisfies TinaRichTextContent,
      },
    });
    const html = withoutHydrationMarkers(body);

    expect(html).toContain('<span style="color:#ff0000">Red</span>');
    expect(html).toContain(
      '<mark style="background-color:rgb(255 255 0)"><span style="color:blue">Marked</span></mark>'
    );
    expect(html).toContain('</mark>Unsafe text<mark>Unsafe mark</mark>');
    expect(html).not.toContain('url(x)');
  });

  it('renders code blocks and named MDX nodes through app overrides', () => {
    const { body } = render(TinaMarkdown, {
      props: {
        content: [
          {
            type: 'code_block',
            lang: 'ts',
            children: [
              { children: [{ type: 'text', text: 'const value = 1' }] },
            ],
          },
          {
            type: 'mdxJsxFlowElement',
            name: 'Callout',
            props: { title: 'Heads up', tone: 'info' },
          },
        ] satisfies TinaRichTextContent,
        components: { code_block: CodeBlockOverride, Callout: CalloutOverride },
      },
    });

    expect(body).toContain('data-testid="code-block-override"');
    expect(body).toContain('data-language="ts"');
    expect(body).toContain('const value = 1');
    expect(body).toContain('data-testid="callout-override"');
    expect(body).toContain('data-tone="info"');
    expect(body).toContain('Heads up');
  });

  it('renders native tables and code blocks and sanitizes CMS-provided links and image URLs', () => {
    const { body } = render(TinaMarkdown, {
      props: {
        content: [
          {
            type: 'a',
            url: 'javascript:alert(1)',
            children: [{ type: 'text', text: 'unsafe link' }],
          },
          {
            type: 'img',
            url: 'data:image/png;base64,abc',
            alt: 'unsafe image',
          },
          { type: 'code_block', lang: 'ts', value: 'const answer = 42' },
          {
            type: 'table',
            props: { align: ['left'] },
            children: [
              {
                type: 'tr',
                children: [
                  {
                    type: 'td',
                    children: [
                      {
                        type: 'p',
                        children: [{ type: 'text', text: 'Cell value' }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ] satisfies TinaRichTextContent,
      },
    });

    const html = withoutHydrationMarkers(body);
    expect(html).toContain('<a href="#">unsafe link</a>');
    expect(html).toContain('<img src="" alt="unsafe image"/>');
    expect(html).toContain(
      '<pre><code class="language-ts">const answer = 42</code></pre>'
    );
    expect(html).toContain('<table>');
    expect(html).toContain('Cell value');
  });
});
