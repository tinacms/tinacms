/**
 * Server-side helpers for the X-Tina-Preview channel. The bridge POSTs
 * island refetches with body `{ [queryId]: data, ... }`; handlers read
 * their slice via `readOverlay(request, queryId)`.
 */

export const PREVIEW_HEADER = 'X-Tina-Preview';
export const PREVIEW_CONTENT_TYPE = 'application/x-tina-preview+json';
/** Set on the one-time prime refetch for prerendered pages; the endpoint
 *  prepends `<div data-tina-form>` payloads to the region HTML. */
export const PRIME_HEADER = 'X-Tina-Prime';
/** 1MB cap on overlay envelopes — anything larger is malformed. */
const MAX_ENVELOPE_BYTES = 1_000_000;

export interface PreviewEnvelope {
  [queryId: string]: unknown;
}

export async function readOverlay<T>(
  request: Request,
  queryId: string
): Promise<T | undefined> {
  const envelope = await readEnvelope(request);
  if (!envelope) return undefined;
  const value = envelope[queryId];
  return value === undefined ? undefined : (value as T);
}

/** Read and parse the full overlay envelope (every form on the page). */
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
