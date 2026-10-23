import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, expect, it } from 'vitest';
import UseTinaFixture from './fixtures/UseTinaFixture.svelte';

const query = (id: string, title: string) => ({
  id,
  query: 'query { title }',
  variables: {},
  data: { title },
});

// Stands in for the Tina admin window that hosts the preview iframe.
const editor = {};
let parentDescriptor: PropertyDescriptor | undefined;

beforeEach(() => {
  parentDescriptor = Object.getOwnPropertyDescriptor(window, 'parent');
  Object.defineProperty(window, 'parent', {
    configurable: true,
    value: editor,
  });
});

afterEach(() => {
  if (parentDescriptor)
    Object.defineProperty(window, 'parent', parentDescriptor);
  document.body.innerHTML = '';
});

function sendFromEditor(data: unknown) {
  window.dispatchEvent(
    new MessageEvent('message', {
      data,
      origin: window.location.origin,
      source: editor as Window,
    })
  );
  flushSync();
}

it('shows the editor data for the current query and server data after navigation', () => {
  const props = $state({ query: query('a', 'Saved title') });
  const app = mount(UseTinaFixture, { target: document.body, props });
  flushSync();
  const heading = () => document.querySelector('h1')?.textContent;
  expect(heading()).toBe('Saved title');

  sendFromEditor({
    type: 'updateData',
    id: 'a',
    data: { title: 'Unsaved title' },
  });
  expect(heading()).toBe('Unsaved title');

  sendFromEditor({
    type: 'updateData',
    id: 'other',
    data: { title: 'Wrong form' },
  });
  expect(heading()).toBe('Unsaved title');

  props.query = query('b', 'Next page');
  flushSync();
  expect(heading()).toBe('Next page');

  unmount(app);
});
