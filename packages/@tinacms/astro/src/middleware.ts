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
 *   `<script>` that loads `/_tina/bridge.js` before `</head>`. The user
 *   writes nothing in their layout, and production HTML is byte-
 *   identical to a Tina-free Astro app.
 * - In edit mode only, refreshes the `__tina_edit` cookie so the session
 *   survives in-iframe link clicks (whose Referer is the previous
 *   preview page, not `/admin/`).
 */
import type { MiddlewareHandler } from 'astro';
import { escapeAttr } from './internal/escape';
import { type CollectedForm, formsStore } from './internal/forms-store';
import { requestStore } from './internal/request-context';
import { EDIT_COOKIE_HEADER, isEditMode } from './is-edit-mode';

const HEAD_CLOSE = '</head>';

export const onRequest: MiddlewareHandler = (context, next) => {
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
    `import{init,refreshForms}from"/_tina/bridge.js";` +
    `init(${initArg});` +
    `document.addEventListener("astro:page-load",refreshForms);` +
    `</script>`
  );
}

/**
 * Read `PUBLIC_TINA_ADMIN_ORIGIN` (comma-separated for multi-origin setups)
 * from Astro's `import.meta.env`. Returns null when unset so `bridge.init()`
 * falls back to `window.location.origin` — the common same-host case.
 *
 * `import.meta.env` is cast inline because the package ships no `env.d.ts`
 * to keep the public type surface free of Vite/Astro client-types coupling.
 */
function adminOrigins(): string[] | null {
  const env = (
    import.meta as ImportMeta & {
      env?: Record<string, string | undefined>;
    }
  ).env;
  const raw = env?.PUBLIC_TINA_ADMIN_ORIGIN;
  if (!raw) return null;
  const origins = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return origins.length > 0 ? origins : null;
}
