import {
  ASYNC_POLLER_ERROR,
  ERR_ALREADY_EXISTS,
  ERR_CONFLICT,
  ERR_HAS_REFERENCES,
  ERR_NOT_INDEXED,
  ERR_PATH_TRAVERSAL,
} from './errors';

describe('shared error constants', () => {
  it('keeps values stable for substring matching', () => {
    expect(ERR_ALREADY_EXISTS).toBe('already exists');
    expect(ERR_PATH_TRAVERSAL).toBe('Path traversal detected');
    expect(ERR_HAS_REFERENCES).toBe('has references');
    expect(ERR_NOT_INDEXED).toBe('has not been indexed by TinaCloud');
    expect(ERR_CONFLICT).toBe('conflict');
    expect(ASYNC_POLLER_ERROR.CANCELLED).toBe('AsyncPoller: cancelled');
    expect(ASYNC_POLLER_ERROR.TIMEOUT).toBe('AsyncPoller: reached timeout');
  });

  it('is re-exported from the package root', async () => {
    const root = await import('./index');
    expect(root.ERR_ALREADY_EXISTS).toBe('already exists');
  });
});
