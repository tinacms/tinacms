import type { Handle } from '@sveltejs/kit/hooks';
import {
  renderFormPayloadDiv,
  sortByPriority,
  TINA_FORMS,
  type TinaLocals,
} from './internal/forms-store';
import { EDIT_COOKIE_HEADER, isEditMode } from './is-edit-mode';

const HEAD_CLOSE = '</head>';
const HEAD_CLOSE_PATTERN = /<\/head>/i;

/**
 * SvelteKit server hook for Tina visual editing. Compose this with other
 * handles using `sequence` from `@sveltejs/kit/hooks`.
 */
export const tinaHandle: Handle = async ({ event, resolve }) => {
  const locals = event.locals as TinaLocals;
  locals[TINA_FORMS] = [];

  const editing = isEditMode(event.request);
  let injected = false;
  let pending = '';
  const response = editing
    ? await resolve(event, {
        transformPageChunk: ({ html, done }) => {
          if (injected) return html;

          const buffered = pending + html;
          pending = '';
          const headEnd = buffered.search(HEAD_CLOSE_PATTERN);
          if (headEnd !== -1) {
            injected = true;
            return (
              buffered.slice(0, headEnd) +
              renderInjection(locals) +
              buffered.slice(headEnd)
            );
          }

          if (done) return buffered;

          const keep = HEAD_CLOSE.length - 1;
          const split = Math.max(0, buffered.length - keep);
          pending = buffered.slice(split);
          return buffered.slice(0, split);
        },
      })
    : await resolve(event);
  if (!editing) return response;

  const headers = new Headers(response.headers);
  headers.append('Set-Cookie', EDIT_COOKIE_HEADER);
  const contentType = headers.get('content-type') ?? '';
  if (
    contentType.includes('text/html') &&
    response.status !== 204 &&
    response.status !== 304
  ) {
    headers.delete('content-length');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

function renderInjection(locals: TinaLocals): string {
  const forms = sortByPriority(locals[TINA_FORMS] ?? [])
    .map((form, index) => renderFormPayloadDiv(form, index === 0, 'template'))
    .join('');
  // No bridge <script> here: TinaBridge starts it after hydration. Starting it from <head>
  // lets it change the DOM before Svelte hydrates, which causes a hydration mismatch.
  return forms;
}

export default tinaHandle;
