import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_URL, isLocalUrl, parseCliArgs } from './cli';

const originalToken = process.env.TINA_TOKEN;
afterEach(() => {
  if (originalToken === undefined) delete process.env.TINA_TOKEN;
  else process.env.TINA_TOKEN = originalToken;
});

describe('isLocalUrl', () => {
  it.each([
    ['http://localhost:4001/graphql', true],
    ['http://127.0.0.1:4001/graphql', true],
    ['http://[::1]:4001/graphql', true],
    ['https://content.tinajs.io/1.6/content/abc/github/main', false],
    ['http://localhost.example.com/graphql', false],
  ])('%s -> %s', (url, expected) => {
    expect(isLocalUrl(url)).toBe(expected);
  });
});

describe('parseCliArgs', () => {
  it('defaults to the local dev server with writes on', () => {
    delete process.env.TINA_TOKEN;
    expect(parseCliArgs([])).toEqual({
      help: false,
      url: DEFAULT_URL,
      token: undefined,
      allowWrites: true,
    });
  });

  it('turns writes off with --read-only', () => {
    expect(parseCliArgs(['--read-only']).allowWrites).toBe(false);
  });

  it('keeps a remote endpoint read-only', () => {
    const args = parseCliArgs([
      '--url',
      'https://content.tinajs.io/1.6/content/abc/github/main',
      '--token',
      't',
    ]);
    expect(args.allowWrites).toBe(false);
    expect(args.token).toBe('t');
  });

  it('reads the token from TINA_TOKEN', () => {
    process.env.TINA_TOKEN = 'from-env';
    expect(parseCliArgs([]).token).toBe('from-env');
  });
});
