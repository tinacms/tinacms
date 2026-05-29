import type { MiddlewareHandler } from 'astro';
import { adminOrigins } from './internal/admin-origin';
import {
  type CollectedForm,
  formsStore,
  renderFormPayloadDiv,
  sortByPriority,
} from './internal/forms-store';
import { requestStore } from './internal/request-context';
import { EDIT_COOKIE_HEADER, isEditMode } from './is-edit-mode';

const HEAD_CLOSE = '</head>';

export const onRequest: MiddlewareHandler = (context, next) => {
  // Prerendered routes can never be in edit mode; reading their synthetic
  // build-time headers would only emit Astro's request.headers warning.
  if (context.isPrerendered) {
    (context.locals as { tinaEdit?: boolean }).tinaEdit = false;
    return next();
  }

  const editing = isEditMode(context.request);
  (context.locals as { tinaEdit?: boolean }).tinaEdit = editing;

  const forms: CollectedForm[] = [];
  return requestStore.run(context.request, () =>
    formsStore.run(forms, async () => {
      const response = await next();
      return editing ? injectEditMode(response, forms) : response;
    })
  );
};

export default onRequest;

async function injectEditMode(
  response: Response,
  forms: CollectedForm[]
): Promise<Response> {
  const init = editModeInit(response);
  const contentType = response.headers.get('content-type') ?? '';

  // Redirects / JSON / assets — pass body through and just keep the cookie fresh.
  if (!contentType.includes('text/html')) {
    return new Response(response.body, init);
  }

  const html = await response.text();
  const headEnd = html.indexOf(HEAD_CLOSE);
  if (headEnd === -1) {
    // No </head> to anchor against — return the body untouched.
    return new Response(html, init);
  }

  const injection = renderInjection(forms);
  return new Response(
    html.slice(0, headEnd) + injection + html.slice(headEnd),
    init
  );
}

function editModeInit(response: Response): ResponseInit {
  const headers = new Headers(response.headers);
  // Body length changed; let the runtime re-compute it.
  headers.delete('content-length');
  headers.append('Set-Cookie', EDIT_COOKIE_HEADER);
  return { status: response.status, statusText: response.statusText, headers };
}

function renderInjection(forms: CollectedForm[]): string {
  // No explicit priority => sort is a no-op and the first form (page
  // frontmatter runs before its layout's) wins as primary.
  const formDivs = sortByPriority(forms)
    .map((form, i) => renderFormPayloadDiv(form, i === 0))
    .join('');
  return formDivs + bridgeScript();
}

function bridgeScript(): string {
  const origins = adminOrigins();
  const initArg = origins ? `{adminOrigin:${JSON.stringify(origins)}}` : '';
  return (
    `<script type="module">` +
    `import{init,refreshForms}from"/admin/bridge.js";` +
    `init(${initArg});` +
    `document.addEventListener("astro:page-load",refreshForms);` +
    `</script>`
  );
}
