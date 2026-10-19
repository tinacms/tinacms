import { expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TinaMarkdown from '../TinaMarkdown.svelte';
import type { TinaRichTextContent } from '../types';

it('applies the default code block, image, and table styles in the browser', () => {
  render(TinaMarkdown, {
    content: [
      { type: 'code_block', lang: 'ts', value: 'const answer = 42' },
      { type: 'img', url: '/photo.jpg', alt: 'A photo' },
      {
        type: 'table',
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
  });

  const codeBlock = document.querySelector('.tina-markdown-code-block');
  const image = document.querySelector('.tina-markdown-image');
  const table = document.querySelector('.tina-markdown-table');

  expect(codeBlock).not.toBeNull();
  expect(image).not.toBeNull();
  expect(table).not.toBeNull();
  expect(codeBlock && getComputedStyle(codeBlock).backgroundColor).toBe(
    'rgb(17, 24, 39)'
  );
  expect(codeBlock && getComputedStyle(codeBlock).borderRadius).toBe('12px');
  expect(image && getComputedStyle(image).maxWidth).toBe('100%');
  expect(table?.getBoundingClientRect().width).toBe(
    table?.parentElement?.getBoundingClientRect().width
  );
  expect(table?.textContent).toContain('Cell value');
});
