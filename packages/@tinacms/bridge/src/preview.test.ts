import { describe, expect, it } from 'vitest';
import {
  PREVIEW_CONTENT_TYPE,
  PREVIEW_HEADER,
  readEnvelope,
  readOverlay,
} from './preview';

/**
 * Build a `Request` carrying an envelope, mirroring what the bridge
 * sends from `island-refresh.ts`. Kept inline rather than imported so
 * the test exercises the same wire format the consumer would see — if
 * island-refresh changes its encoding, these tests will reveal it.
 */
function makeRequest(
  envelope: Record<string, unknown>,
  options: { contentType?: string; body?: string } = {}
): Request {
  return new Request('http://example.com/tina-island/page', {
    method: 'POST',
    headers: { 'Content-Type': options.contentType ?? PREVIEW_CONTENT_TYPE },
    body: options.body ?? JSON.stringify(envelope),
  });
}

describe('preview transport contract', () => {
  it('exports a stable header name and content-type', () => {
    expect(PREVIEW_HEADER).toBe('X-Tina-Preview');
    expect(PREVIEW_CONTENT_TYPE).toBe('application/x-tina-preview+json');
  });
});

describe('readOverlay', () => {
  it('returns the value for a matching query id', async () => {
    const req = makeRequest({
      abc123: { page: { title: 'Hello' } },
      xyz789: { global: { name: 'Site' } },
    });
    expect(await readOverlay(req, 'abc123')).toEqual({
      page: { title: 'Hello' },
    });
  });

  it('returns undefined for an unknown query id', async () => {
    const req = makeRequest({ abc123: { page: { title: 'Hello' } } });
    expect(await readOverlay(req, 'missing')).toBeUndefined();
  });

  it('returns undefined when the content-type does not match', async () => {
    const req = makeRequest(
      { abc123: { x: 1 } },
      { contentType: 'application/json' }
    );
    expect(await readOverlay(req, 'abc123')).toBeUndefined();
  });

  it('returns undefined for an empty body', async () => {
    const req = makeRequest({}, { body: '' });
    expect(await readOverlay(req, 'abc123')).toBeUndefined();
  });

  it('returns undefined for malformed JSON', async () => {
    const req = makeRequest({}, { body: '{ not valid json' });
    expect(await readOverlay(req, 'abc123')).toBeUndefined();
  });
});

describe('readOverlay UTF-8 round-trip', () => {
  it('preserves em-dash + smart quotes (the 431 / Latin-1 trigger)', async () => {
    const value = {
      title: 'A — B "C" — D',
      excerpt: "It's a “smart-quote” world",
    };
    const req = makeRequest({ id: value });
    expect(await readOverlay(req, 'id')).toEqual(value);
  });

  it('preserves accented characters', async () => {
    const value = { name: 'Renée Müller', city: 'São Paulo' };
    const req = makeRequest({ id: value });
    expect(await readOverlay(req, 'id')).toEqual(value);
  });

  it('preserves emoji (4-byte UTF-8 sequences)', async () => {
    const value = { reaction: '🚀✨🤖', flag: '🇺🇸' };
    const req = makeRequest({ id: value });
    expect(await readOverlay(req, 'id')).toEqual(value);
  });

  it('preserves CJK + RTL text', async () => {
    const value = { jp: 'こんにちは', cn: '你好世界', he: 'שלום עולם' };
    const req = makeRequest({ id: value });
    expect(await readOverlay(req, 'id')).toEqual(value);
  });
});

describe('readOverlay payload size + shape', () => {
  it('handles bodies larger than the typical 8 KB header limit', async () => {
    // 50 KB of UTF-8 — would have failed as a header (431) and would
    // have failed as a non-base64 ISO-8859-1 string (TypeError).
    const big = '— '.repeat(25_000);
    const req = makeRequest({ id: { body: big } });
    const overlay = await readOverlay<{ body: string }>(req, 'id');
    expect(overlay?.body).toBe(big);
    expect(overlay?.body.length).toBe(big.length);
  });

  it('preserves nested objects and arrays', async () => {
    const value = {
      page: {
        blocks: [
          {
            __typename: 'Hero',
            headline: 'A',
            children: [{ type: 'p', children: [{ type: 'text', text: 'x' }] }],
          },
          { __typename: 'Cta', actions: [{ label: 'Go', link: '/x' }] },
        ],
      },
    };
    const req = makeRequest({ id: value });
    expect(await readOverlay(req, 'id')).toEqual(value);
  });

  it('treats null values as present (not "missing")', async () => {
    const req = makeRequest({ id: null });
    expect(await readOverlay(req, 'id')).toBeNull();
  });
});

describe('readEnvelope', () => {
  it('returns the full envelope for callers that need every form', async () => {
    const env = {
      page_id: { page: { title: 'P' } },
      global_id: { global: { theme: { color: 'blue' } } },
    };
    const req = makeRequest(env);
    expect(await readEnvelope(req)).toEqual(env);
  });

  it('returns undefined when no preview content-type is present', async () => {
    const req = new Request('http://example.com/tina-island/page', {
      method: 'POST',
      body: '{}',
    });
    expect(await readEnvelope(req)).toBeUndefined();
  });
});

describe('content-type matching is permissive about charset', () => {
  it('accepts content-type with a charset suffix', async () => {
    const req = makeRequest(
      { id: { x: 1 } },
      { contentType: `${PREVIEW_CONTENT_TYPE}; charset=utf-8` }
    );
    expect(await readOverlay(req, 'id')).toEqual({ x: 1 });
  });
});

/**
 * The browser side of the protocol lives in island-refresh.ts and uses
 * `fetch(endpoint, { method:'POST', headers:{'Content-Type': PREVIEW_CONTENT_TYPE},
 * body: JSON.stringify(envelope) })`. These tests assemble that exact
 * request shape and run it through `readOverlay` so an accidental change
 * to either side breaks the contract.
 */
describe('full bridge → server round-trip', () => {
  function bridgeRequest(envelope: Record<string, unknown>): Request {
    return new Request('http://example.com/tina-island/page', {
      method: 'POST',
      headers: { 'Content-Type': PREVIEW_CONTENT_TYPE },
      body: JSON.stringify(envelope),
    });
  }

  it('round-trips the multi-form payload the bridge sends', async () => {
    const envelope = {
      page_hash: {
        page: {
          blocks: [{ __typename: 'Hero', headline: 'Headline — em-dash' }],
        },
      },
      global_hash: { global: { theme: { color: 'blue', font: 'sans' } } },
    };
    const req = bridgeRequest(envelope);

    expect(await readOverlay(req.clone(), 'page_hash')).toEqual(
      envelope.page_hash
    );
    expect(await readOverlay(req.clone(), 'global_hash')).toEqual(
      envelope.global_hash
    );
    expect(await readOverlay(req.clone(), 'unknown_hash')).toBeUndefined();
  });

  it('survives the worst payload encountered in the wild (large UTF-8 post body)', async () => {
    // Mirrors the shape that triggered HTTP 431 + Latin-1 errors in
    // earlier transports: long rich-text body with em-dashes.
    const richText = {
      type: 'root',
      children: Array.from({ length: 200 }, (_, i) => ({
        type: 'p',
        children: [
          {
            type: 'text',
            text: `Paragraph ${i} — with an em-dash and "smart quotes"`,
          },
        ],
      })),
    };
    const envelope = { id: { post: { _body: richText, title: 'Long post' } } };
    const req = bridgeRequest(envelope);
    const back = await readOverlay<{ post: { _body: typeof richText } }>(
      req,
      'id'
    );
    expect(back?.post._body.children).toHaveLength(200);
    expect(back?.post._body.children[0]).toEqual(richText.children[0]);
  });
});
