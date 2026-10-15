import { describe, expect, it } from 'vitest';
import { AuthError } from '../../../core/auth/contract';
import { MediaError } from '../../../core/media/contract';
import { TinaCloudError } from '../client';
import { toMediaError } from './shared';

describe('toMediaError', () => {
  it.each([
    [401, 'unauthorized'],
    [403, 'unauthorized'],
    [404, 'not-found'],
    [413, 'too-large'],
    [500, 'backend-failure'],
  ])('maps a %i to %s', (status, code) => {
    expect(
      toMediaError(new TinaCloudError('failed', { status }))
    ).toMatchObject({ code });
  });

  it('keeps the status and the server message in the detail', () => {
    const error = toMediaError(
      new TinaCloudError('TinaCloud responded with 500.', {
        status: 500,
        body: { message: 'S3 is down' },
      })
    );
    expect(error.detail).toBe('TinaCloud responded with 500. S3 is down');
  });

  it.each([
    ['unauthenticated', 'unauthorized'],
    ['expired', 'unauthorized'],
    ['network', 'backend-failure'],
    ['invalid-response', 'backend-failure'],
  ] as const)('maps an AuthError %s to %s', (authCode, code) => {
    expect(toMediaError(new AuthError(authCode, 'Why.'))).toMatchObject({
      code,
      detail: 'Why.',
    });
  });

  it('passes a MediaError through and wraps any other value', () => {
    const original = new MediaError('name-taken');
    expect(toMediaError(original)).toBe(original);
    expect(toMediaError(new Error('boom'))).toMatchObject({
      code: 'backend-failure',
      detail: 'boom',
    });
    expect(toMediaError('boom')).toMatchObject({
      code: 'backend-failure',
      detail: 'boom',
    });
  });
});
