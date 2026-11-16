import { describe, expect, it } from 'vitest';
import { toFieldAddress } from '../field/address';
import { ContentError, type ContentErrorCode } from './contract';

const CODES: ContentErrorCode[] = [
  'unauthorized',
  'forbidden',
  'not-found',
  'branch-not-found',
  'not-indexed',
  'validation',
  'network',
  'backend-failure',
];

describe('ContentError', () => {
  it.each(CODES)('gives %s a message and keeps the detail', (code) => {
    const error = new ContentError(code, 'Why.');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ContentError');
    expect(error.code).toBe(code);
    expect(error.message).not.toBe('');
    expect(error.detail).toBe('Why.');
  });

  it('keeps the field errors of a validation failure', () => {
    const fieldErrors = { [toFieldAddress('title')]: ['Required.'] };
    expect(
      new ContentError('validation', undefined, fieldErrors).fieldErrors
    ).toEqual({ title: ['Required.'] });
  });
});
