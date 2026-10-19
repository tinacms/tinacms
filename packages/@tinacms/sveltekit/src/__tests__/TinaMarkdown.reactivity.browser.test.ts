import { expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TinaMarkdown from '../TinaMarkdown.svelte';
import type { TinaRichTextContent } from '../types';

const doc = (first: string, ...added: string[]) =>
  ({
    type: 'root',
    children: [
      { type: 'p', children: [{ type: 'text', text: first }] },
      ...added.map((text) => ({ type: 'p', children: [{ text }] })),
    ],
  }) as unknown as TinaRichTextContent;

it('renders untyped text leaves the editor adds to new paragraphs', async () => {
  const screen = render(TinaMarkdown, { content: doc('first') });

  await screen.rerender({ content: doc('first', '') });
  await screen.rerender({ content: doc('first', 'second') });
  await screen.rerender({ content: doc('first', 'second line') });

  const paragraphs = [...screen.container.querySelectorAll('p')].map((p) =>
    p.textContent?.trim()
  );
  expect(paragraphs).toEqual(['first', 'second line']);
});
