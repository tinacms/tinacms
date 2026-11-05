import { flushSync, mount, unmount } from 'svelte';
import { afterEach, expect, it } from 'vitest';
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

afterEach(() => {
  document.body.innerHTML = '';
});

it('renders untyped text leaves the editor adds to new paragraphs', () => {
  const props = $state({ content: doc('first') });
  const app = mount(TinaMarkdown, { target: document.body, props });

  for (const next of [
    doc('first', ''),
    doc('first', 'second'),
    doc('first', 'second line'),
  ]) {
    props.content = next;
    flushSync();
  }

  const paragraphs = [...document.querySelectorAll('p')].map((p) =>
    p.textContent?.trim()
  );
  expect(paragraphs).toEqual(['first', 'second line']);

  unmount(app);
});
