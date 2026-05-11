/**
 * Shared preview-protocol helpers for both ends of the X-Tina-Preview
 * channel. The bridge POSTs island refetches with a JSON body of shape
 *
 *   { [queryId]: data, ... }
 *
 * Server-side island handlers call `readOverlay(request, queryId)` to
 * fetch the overlay data for their own query without having to know the
 * transport details (POST body vs header, JSON vs base64-encoded JSON).
 *
 * Runs in Node (Astro server endpoints, Hugo plugins, etc.) — no DOM
 * dependencies. The browser-side encoder lives in island-refresh.ts.
 */

export const PREVIEW_HEADER = 'X-Tina-Preview';
export const PREVIEW_CONTENT_TYPE = 'application/x-tina-preview+json';
/**
 * Hard cap on overlay envelope size. The bridge POSTs JSON-encoded form
 * data — a 1 MB envelope already represents a wildly oversized document —
 * so any larger payload is treated as malformed.
 */
const MAX_ENVELOPE_BYTES = 1_000_000;

export interface PreviewEnvelope {
  [queryId: string]: unknown;
}

/**
 * Read the overlay envelope for a given query id from an incoming
 * request. Returns `undefined` if no overlay is present (production
 * traffic, or an island refetch with no matching id).
 */
export async function readOverlay<T>(
  request: Request,
  queryId: string
): Promise<T | undefined> {
  const envelope = await readEnvelope(request);
  if (!envelope) return undefined;
  const value = envelope[queryId];
  return value === undefined ? undefined : (value as T);
}

/**
 * Read and parse the full overlay envelope (every form on the page),
 * for callers that want to inspect the raw payload.
 */
export async function readEnvelope(
  request: Request
): Promise<PreviewEnvelope | undefined> {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes(PREVIEW_CONTENT_TYPE)) return undefined;
  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (declaredLength > MAX_ENVELOPE_BYTES) return undefined;
  try {
    const text = await request.text();
    if (!text) return undefined;
    if (text.length > MAX_ENVELOPE_BYTES) return undefined;
    return JSON.parse(text) as PreviewEnvelope;
  } catch {
    return undefined;
  }
}
