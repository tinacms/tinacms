/**
 * Server side of the island protocol: an endpoint the bridge POSTs to with
 * the editor's unsaved data, answering with the region's fresh HTML (and,
 * on a prime request, the forms it used). Framework-agnostic: adapters pass
 * a `render` callback; everything else lives here.
 */
import { escapeAttr } from './escape';
import {
  type CollectedForm,
  renderFormPayload,
  sortByPriority,
} from './form-payload';
import { PREVIEW_CONTENT_TYPE, PRIME_HEADER } from './preview';

/** Outer element the bridge swaps into; must match the page-side wrapper. */
export interface IslandWrapper {
  tag: string;
  className?: string;
}

export interface IslandRender {
  html: string;
  forms: readonly CollectedForm[];
}

export interface IslandRequest<TIsland extends { wrapper: IslandWrapper }> {
  request: Request;
  /** The `[name]` route parameter. */
  name: string | undefined;
  islands: Readonly<Record<string, TIsland>>;
  /** Fetch the island's data and render it with the adapter's framework. */
  render: (island: TIsland) => Promise<IslandRender>;
}

const TAG_PATTERN = /^[A-Za-z][A-Za-z0-9-]*$/;
const NON_SEGMENT_CHARACTER = /[\s\p{Cc}/\\?#%]/u;
const MAX_BODY_BYTES = 1_000_000;
const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

/**
 * Whether `name` can be the `[name]` segment of `/tina-island/[name]` as is:
 * not empty, `.` or `..`, and without a character that would end or reshape
 * the segment (`/`, `\`, `?`, `#`, `%`, whitespace, control characters).
 */
export function isIslandName(name: string): boolean {
  return (
    name !== '' &&
    name !== '.' &&
    name !== '..' &&
    !NON_SEGMENT_CHARACTER.test(name)
  );
}

/** Throws when an island name isn't a URL path segment or a wrapper is a void tag. */
export function assertValidIslands(
  islands: Readonly<Record<string, { wrapper: IslandWrapper }>>
): void {
  for (const [name, island] of Object.entries(islands)) {
    if (!isIslandName(name)) {
      throw new TypeError('Tina island names must be valid URL path segments');
    }
    const { tag } = island.wrapper;
    if (!TAG_PATTERN.test(tag) || VOID_ELEMENTS.has(tag.toLowerCase())) {
      throw new TypeError('Tina island wrapper must be a non-void HTML tag');
    }
  }
}

/**
 * Accepts only the bridge's request shape: a same-origin POST with the
 * preview content type and a JSON-object body of at most 1 MB. Unknown
 * islands are a 404; a failed render is a 500.
 */
export async function handleIslandRequest<
  TIsland extends { wrapper: IslandWrapper },
>({
  request,
  name,
  islands,
  render,
}: IslandRequest<TIsland>): Promise<Response> {
  const rejection = rejectUnsafeRequest(request);
  if (rejection) return rejection;

  // Read a clone: the adapter's loaders read the overlay from the original.
  const bodyError = await validateBody(request.clone());
  if (bodyError) return bodyError;

  const island =
    name && Object.hasOwn(islands, name) ? islands[name] : undefined;
  if (!island) return textResponse('Not Found', 404);

  try {
    const { html, forms } = await render(island);
    const payloads = request.headers.has(PRIME_HEADER)
      ? renderIslandFormPayloads(forms)
      : '';
    return new Response(
      payloads + wrapIsland(html, island.wrapper, new URL(request.url), forms),
      {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  } catch {
    return textResponse('Island render failed', 500);
  }
}

function rejectUnsafeRequest(request: Request): Response | null {
  if (request.method !== 'POST') {
    return textResponse('Method Not Allowed', 405);
  }
  const contentType = request.headers.get('content-type') ?? '';
  if (
    contentType.split(';', 1)[0]?.trim().toLowerCase() !== PREVIEW_CONTENT_TYPE
  ) {
    return textResponse('Not Found', 404);
  }
  // The published Astro rule. The preview content type already makes another
  // origin's request fail its CORS preflight; this refuses it outright.
  if (request.headers.get('sec-fetch-site') === 'cross-site') {
    return textResponse('Forbidden', 403);
  }
  return null;
}

async function validateBody(request: Request): Promise<Response | null> {
  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (declaredLength > MAX_BODY_BYTES) {
    return textResponse('Payload Too Large', 413);
  }

  const reader = request.body?.getReader();
  if (!reader) return textResponse('Invalid preview payload', 400);

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_BODY_BYTES) {
        void reader.cancel();
        return textResponse('Payload Too Large', 413);
      }
      chunks.push(value);
    }
  } catch {
    return textResponse('Invalid preview payload', 400);
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return textResponse('Invalid preview payload', 400);
    }
  } catch {
    return textResponse('Invalid preview payload', 400);
  }
  return null;
}

// Keyed on the explicit `primary` flag, not position: each island request
// is independent, so position would tag every island's first form.
function renderIslandFormPayloads(forms: readonly CollectedForm[]): string {
  return sortByPriority(forms)
    .map((form) => renderFormPayload(form, form.priority === 'primary'))
    .join('');
}

// `data-tina-island-forms` lets the bridge refresh this island only when
// one of these forms changes. Omitted without forms, so the bridge keeps
// refreshing it on every pass.
function wrapIsland(
  html: string,
  wrapper: IslandWrapper,
  url: URL,
  forms: readonly CollectedForm[]
): string {
  const className = wrapper.className
    ? ` class="${escapeAttr(wrapper.className)}"`
    : '';
  const marker = escapeAttr(`${url.pathname}${url.search}`);
  const formIds = [...new Set(forms.map((form) => form.id))].join(' ');
  const formsAttr = formIds
    ? ` data-tina-island-forms="${escapeAttr(formIds)}"`
    : '';
  return `<${wrapper.tag}${className} data-tina-island="${marker}"${formsAttr}>${html}</${wrapper.tag}>`;
}

function textResponse(body: string, status: number): Response {
  return new Response(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}
