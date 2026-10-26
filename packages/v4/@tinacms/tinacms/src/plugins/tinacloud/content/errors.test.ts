import { describe, expect, it } from 'vitest';
import { AuthError } from '../../../core/auth/contract';
import { ContentError } from '../../../core/content/contract';
import { TinaCloudError } from '../client';
import { toContentError } from './errors';
import { TinaCloudGraphQLError } from './request';

const graphQLError = (code: string, field?: string) =>
  new TinaCloudGraphQLError(
    [{ message: `${code} failed.`, extensions: { code, field } }],
    {}
  );

describe('toContentError', () => {
  it.each([
    [new TinaCloudError('failed', { status: 401 }), 'unauthorized'],
    [new AuthError('unauthenticated'), 'unauthorized'],
    [new AuthError('expired'), 'unauthorized'],
    [new AuthError('network'), 'network'],
    [new AuthError('invalid-response'), 'backend-failure'],
    [new TinaCloudError('failed', { status: 403 }), 'forbidden'],
    [
      new TinaCloudError('failed', {
        status: 404,
        body: { message: 'Branch feat/x not found' },
      }),
      'branch-not-found',
    ],
    [
      new TinaCloudError('failed', {
        status: 404,
        body: { message: 'Branch feat/x is not indexed' },
      }),
      'not-indexed',
    ],
    [
      new TinaCloudError('failed', {
        status: 404,
        body: { message: 'No such branch feat/x' },
      }),
      'branch-not-found',
    ],
    [
      new TinaCloudError('failed', {
        status: 404,
        body: { message: 'Document not found on branch main' },
      }),
      'not-found',
    ],
    [new TinaCloudError('failed', { status: 404 }), 'not-found'],
    [new TinaCloudError('The request failed: offline', {}), 'network'],
    [new TinaCloudError('unknown format', { body: 'oops' }), 'backend-failure'],
    [new TinaCloudError('failed', { status: 500 }), 'backend-failure'],
    [graphQLError('UNAUTHENTICATED'), 'unauthorized'],
    [graphQLError('FORBIDDEN'), 'forbidden'],
    [graphQLError('NOT_FOUND'), 'not-found'],
    [graphQLError('BRANCH_NOT_FOUND'), 'branch-not-found'],
    [graphQLError('NOT_INDEXED'), 'not-indexed'],
    [graphQLError('VALIDATION'), 'validation'],
    [graphQLError('INTERNAL'), 'backend-failure'],
    [new Error('boom'), 'backend-failure'],
    ['boom', 'backend-failure'],
  ])('maps %o to %s', (cause, code) => {
    expect(toContentError(cause)).toMatchObject({ code });
  });

  it('keeps the status and the server message in the detail', () => {
    expect(
      toContentError(
        new TinaCloudError('TinaCloud responded with 500.', {
          status: 500,
          body: { message: 'GitHub is down' },
        })
      ).detail
    ).toBe('TinaCloud responded with 500. GitHub is down');
  });

  it('collects the field errors of a validation failure', () => {
    const error = toContentError(
      new TinaCloudGraphQLError(
        [
          {
            message: 'Required.',
            extensions: { code: 'VALIDATION', field: 'title' },
          },
          {
            message: 'Too short.',
            extensions: { code: 'VALIDATION', field: 'title' },
          },
          {
            message: 'Bad date.',
            extensions: { code: 'VALIDATION', field: 'meta.date' },
          },
          { message: 'Invalid.', extensions: { code: 'VALIDATION' } },
        ],
        {}
      )
    );
    expect(error).toMatchObject({
      code: 'validation',
      fieldErrors: {
        title: ['Required.', 'Too short.'],
        'meta.date': ['Bad date.'],
      },
    });
  });

  it('passes a ContentError through', () => {
    const original = new ContentError('forbidden');
    expect(toContentError(original)).toBe(original);
  });
});
