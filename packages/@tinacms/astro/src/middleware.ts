/**
 * Astro middleware injected by the `tina()` integration.
 *
 * - Resolves `isEditMode(request)` once and stashes it on
 *   `context.locals.tinaEdit` so pages and components can branch on edit
 *   context without re-parsing headers.
 * - Scopes the request and a per-request forms collector via
 *   AsyncLocalStorage so `tina()` reads them implicitly — the caller
 *   never threads `Astro.request` through their loaders.
 * - In edit mode only, splices `<div data-tina-form>` payloads and a
 *   `<script>` that loads `/admin/bridge.js` before `</head>`. The user
 *   writes nothing in their layout, and production HTML is byte-
 *   identical to a Tina-free Astro app.
 * - In edit mode only, refreshes the `__tina_edit` cookie so the session
 *   survives in-iframe link clicks (whose Referer is the previous
 *   preview page, not `/admin/`).
 * - Prerendered routes short-circuit immediately: they can never be in
 *   edit mode and their synthetic build-time `Request` has no real
 *   headers, so reading them would only emit Astro's
 *   `Astro.request.headers` warning for nothing.
 */
import type { MiddlewareHandler } from 'astro';
import { adminOrigins } from './internal/admin-origin';
import { escapeAttr } from './internal/escape';
import { type CollectedForm, formsStore } from './internal/forms-store';
import { requestStore } from './internal/request-context';
import { EDIT_COOKIE_HEADER, isEditMode } from './is-edit-mode';

const HEAD_CLOSE = '</head>';

export const onRequest: MiddlewareHandler = (context, next) => {
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
  const formDivs = forms
    .map(
      (form) =>
        `<div data-tina-form="${escapeAttr(JSON.stringify(form))}" hidden></div>`
    )
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
