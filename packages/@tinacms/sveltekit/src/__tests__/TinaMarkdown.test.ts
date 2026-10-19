import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import TinaMarkdown from '../TinaMarkdown.svelte';
import type { TinaRichTextContent } from '../types';
import CalloutOverride from './fixtures/CalloutOverride.svelte';
import CodeBlockOverride from './fixtures/CodeBlockOverride.svelte';

describe('TinaMarkdown', () => {
  it('renders semantic text, marks, and default presentation classes', () => {
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

    expect(body).toContain('<h1');
    expect(body).toContain('class="tina-markdown-h1');
    expect(body).toContain('<strong>');
    expect(body).toContain('Bold text');
    expect(body).toContain('<code class="tina-markdown-inline-code');
    expect(body).toContain('class="tina-markdown-blockquote');
    expect(body).toContain('Quote');
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

  it('renders native tables and sanitizes CMS-provided links and image URLs', () => {
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

    expect(body).toContain('<a class="tina-markdown-link');
    expect(body).toContain('href="#"');
    expect(body).toContain('<img class="tina-markdown-image');
    expect(body).toContain('src=""');
    expect(body).toContain('<table class="tina-markdown-table');
    expect(body).toContain('Cell value');
  });
});
