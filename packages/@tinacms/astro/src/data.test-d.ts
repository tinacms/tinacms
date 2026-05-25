import { describe, expectTypeOf, it } from 'vitest';
import type { QueryResult, RequestOptions } from './data';
import { requestWithMetadata } from './data';

interface Post {
  title: string;
  body: string;
}

// requestWithMetadata is the one wrapper every Astro page calls around
// client.queries.<name>(). A regression that widened TData to `unknown`
// would pass every runtime test, so the guarantee has to be type-level.

describe('requestWithMetadata', () => {
  it('threads the query data type through to QueryResult', async () => {
    const result = await requestWithMetadata(
      Promise.resolve({
        data: { title: 't', body: 'b' } satisfies Post,
        query: 'query Post { ... }',
        variables: {},
      })
    );
    expectTypeOf(result).toEqualTypeOf<QueryResult<Post>>();
    expectTypeOf(result.data).toEqualTypeOf<Post>();
  });

  it('does not widen TData when given an explicit type argument', () => {
    expectTypeOf<
      Awaited<ReturnType<typeof requestWithMetadata<Post>>>
    >().toEqualTypeOf<QueryResult<Post>>();
  });

  it('accepts a bare (non-promise) client result', () => {
    expectTypeOf(requestWithMetadata).toBeCallableWith({
      data: { title: 't', body: 'b' } satisfies Post,
      query: 'q',
      variables: {},
    });
  });

  it('accepts null / undefined sources (static build, no client scope)', () => {
    expectTypeOf(requestWithMetadata).toBeCallableWith(null);
    expectTypeOf(requestWithMetadata).toBeCallableWith(undefined);
  });
});

describe('RequestOptions', () => {
  it('priority is the literal "primary" or absent', () => {
    expectTypeOf<RequestOptions['priority']>().toEqualTypeOf<
      'primary' | undefined
    >();
  });
});
