import { PREVIEW_CONTENT_TYPE, PRIME_HEADER } from '@tinacms/bridge/preview';
import type { RequestHandler } from '@sveltejs/kit';
import { render } from 'svelte/server';
import type { Component } from 'svelte';
import { escapeAttr } from '../internal/escape';
import {
  renderFormPayloadDiv,
  sortByPriority,
  TINA_FORMS,
  type TinaLocals,
} from '../internal/forms-store';

export interface TinaIslandConfig {
  fetch: (
    event: Parameters<RequestHandler>[0],
    params: URLSearchParams
  ) => Promise<unknown>;
  component: Component<any>;
  propsFromData: (
    data: unknown,
    params: URLSearchParams
  ) => Record<string, unknown>;
  wrapper: { tag: string; className?: string };
}

export type TinaIslandRegistry = Record<string, TinaIslandConfig>;

export function experimental_createIslandHandler(
  islands: TinaIslandRegistry
): RequestHandler {
  if (
    Object.keys(islands).some((name) => !/^[A-Za-z][A-Za-z0-9-]*$/.test(name))
  ) {
    throw new TypeError('Tina island names must be valid URL path segments');
  }

  for (const island of Object.values(islands)) {
    if (!isValidWrapperTag(island.wrapper.tag)) {
      throw new TypeError('Tina island wrapper must be a valid HTML tag name');
    }
  }

  return async (event) => {
    const rejection = rejectIfUnsafe(event.request);
    if (rejection) return rejection;

    const bodyError = await validatePreviewBody(event.request.clone());
    if (bodyError) return bodyError;

    const name = event.params.name;
    const island = name && Object.hasOwn(islands, name) ? islands[name] : null;
    if (!island) return new Response('Not Found', { status: 404 });

    const locals = event.locals as TinaLocals;
    locals[TINA_FORMS] ??= [];

    const params = event.url.searchParams;
    const data = await island.fetch(event, params);

    try {
      const rendered = render(island.component, {
        props: island.propsFromData(data, params),
      });
      const forms = event.request.headers.has(PRIME_HEADER)
        ? sortByPriority(locals[TINA_FORMS] ?? [])
            .map((form) =>
              renderFormPayloadDiv(form, form.priority === 'primary')
            )
            .join('')
        : '';
      const className = island.wrapper.className
        ? ` class="${escapeAttr(island.wrapper.className)}"`
        : '';
      const marker = escapeAttr(`${event.url.pathname}${event.url.search}`);
      const html =
        `${forms}<${island.wrapper.tag}${className} data-tina-island="${marker}">` +
        `${rendered.body}</${island.wrapper.tag}>`;

      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    } catch {
      return new Response('Island render failed', {
        status: 500,
        headers: { 'Cache-Control': 'no-store' },
      });
    }
  };
}

function rejectIfUnsafe(request: Request): Response | null {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  const contentType = request.headers.get('content-type') ?? '';
  if (
    contentType.split(';', 1)[0]?.trim().toLowerCase() !== PREVIEW_CONTENT_TYPE
  ) {
    return new Response('Not Found', { status: 404 });
  }
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) {
    return new Response('Forbidden', { status: 403 });
  }
  if (request.headers.get('sec-fetch-site') === 'cross-site') {
    return new Response('Forbidden', { status: 403 });
  }
  return null;
}

const MAX_PREVIEW_BYTES = 1_000_000;

async function validatePreviewBody(request: Request): Promise<Response | null> {
  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (declaredLength > MAX_PREVIEW_BYTES) {
    return new Response('Payload Too Large', { status: 413 });
  }

  const reader = request.body?.getReader();
  if (!reader) return new Response('Invalid preview payload', { status: 400 });

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_PREVIEW_BYTES) {
        void reader.cancel();
        return new Response('Payload Too Large', { status: 413 });
      }
      chunks.push(value);
    }
  } catch {
    return new Response('Invalid preview payload', { status: 400 });
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
      return new Response('Invalid preview payload', { status: 400 });
    }
  } catch {
    return new Response('Invalid preview payload', { status: 400 });
  }

  return null;
}

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

function isValidWrapperTag(tag: string): boolean {
  return (
    /^[A-Za-z][A-Za-z0-9-]*$/.test(tag) && !VOID_ELEMENTS.has(tag.toLowerCase())
  );
}
