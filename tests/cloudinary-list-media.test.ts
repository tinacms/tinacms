import { beforeEach, describe, expect, it, vi } from 'vitest';

// escapeSearchValue is unit-tested in cloudinary-search-expression.test.ts;
// these guard the wiring that carries a directory into the Search API.
const { search } = vi.hoisted(() => {
  const stub: Record<string, unknown> = {};
  Object.assign(stub, {
    expression: vi.fn(() => stub),
    max_results: vi.fn(() => stub),
    next_cursor: vi.fn(() => stub),
    execute: vi.fn(async () => ({ resources: [], next_cursor: undefined })),
  });
  return { search: stub };
});

// Mock via the path handlers.ts resolves, not the bare specifier: pnpm nests
// cloudinary under the package, so the two ids differ and the mock would miss.
vi.mock('../packages/next-tinacms-cloudinary/node_modules/cloudinary', () => ({
  v2: { config: vi.fn(), search, api: {}, uploader: {} },
}));

import { createMediaHandler } from '../packages/next-tinacms-cloudinary/src/handlers';

const handler = createMediaHandler({
  cloud_name: 'test-cloud',
  api_key: 'test-key',
  api_secret: 'test-secret',
  authorized: async () => true,
});

// filesOnly short-circuits before the folders API, so only search needs a stub.
const list = async (directory: unknown) => {
  const res: Record<string, unknown> = {};
  Object.assign(res, {
    status: vi.fn(() => res),
    json: vi.fn(() => res),
    end: vi.fn(() => res),
  });
  await handler(
    { method: 'GET', query: { directory, filesOnly: 'true' } } as never,
    res as never
  );
  return res;
};

const expression = () => search.expression as ReturnType<typeof vi.fn>;
const lastExpression = () => expression().mock.calls.at(-1)?.[0];

describe('listMedia search expression', () => {
  beforeEach(() => vi.clearAllMocks());

  it('passes an ordinary directory through unchanged', async () => {
    await list('photos/2026');
    expect(lastExpression()).toBe('folder="photos/2026"');
  });

  it('escapes the directory rather than interpolating it raw', async () => {
    await list('uploads" OR public_id="*');
    expect(lastExpression()).toBe('folder="uploads\\" OR public_id=\\"\\*"');
  });

  it('narrows a repeated directory param to its first value', async () => {
    await list(['photos', 'other']);
    expect(lastExpression()).toBe('folder="photos"');
  });

  it('lists the root without consulting the escaper', async () => {
    await list(undefined);
    expect(lastExpression()).toBe('folder=""');
  });

  it('rejects a traversing directory before it reaches the Search API', async () => {
    const res = await list('../../etc');
    expect(expression()).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
