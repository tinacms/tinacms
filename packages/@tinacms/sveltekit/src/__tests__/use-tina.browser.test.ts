import { expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import UseTinaFixture from './fixtures/UseTinaFixture.svelte';

const query = (id: string, title: string) => ({
  id,
  query: 'query { title }',
  variables: {},
  data: { title },
});

// Vitest runs browser tests in an iframe, like the Tina preview. Posting from the parent's
// realm makes the parent the message source, as it is for the real editor.
function sendFromEditor(message: unknown) {
  const post = new (window.parent as unknown as typeof globalThis).Function(
    'target',
    'message',
    'origin',
    'target.postMessage(message, origin)'
  );
  post(window, message, window.location.origin);
}

const nextMessage = () => new Promise((resolve) => setTimeout(resolve, 20));

it('shows the editor data for the current query and server data after navigation', async () => {
  const screen = render(UseTinaFixture, { query: query('a', 'Saved title') });
  const heading = () => screen.container.querySelector('h1')?.textContent;
  expect(heading()).toBe('Saved title');

  sendFromEditor({
    type: 'updateData',
    id: 'a',
    data: { title: 'Unsaved title' },
  });
  await nextMessage();
  expect(heading()).toBe('Unsaved title');

  sendFromEditor({
    type: 'updateData',
    id: 'other',
    data: { title: 'Wrong form' },
  });
  await nextMessage();
  expect(heading()).toBe('Unsaved title');

  await screen.rerender({ query: query('b', 'Next page') });
  expect(heading()).toBe('Next page');
});
