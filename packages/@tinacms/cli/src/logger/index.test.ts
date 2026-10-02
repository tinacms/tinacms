jest.mock('chalk', () => {
  const identity = (s: string) => s;
  return {
    __esModule: true,
    default: {
      gray: identity,
      green: identity,
      cyan: identity,
      white: identity,
      reset: identity,
    },
  };
});

import { summary } from './index';

describe('summary', () => {
  let out: string;
  let write: jest.SpyInstance;
  const ci = process.env.CI;

  beforeEach(() => {
    out = '';
    write = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation((chunk: string | Uint8Array) => {
        out += chunk.toString();
        return true;
      });
  });

  afterEach(() => {
    write.mockRestore();
    process.env.CI = ci;
  });

  it('prints the boxed summary when CI is set', () => {
    process.env.CI = 'true';
    summary({
      heading: 'Tina build complete',
      items: [
        {
          emoji: '🦙',
          heading: 'Tina Config',
          subItems: [{ key: 'API url', value: 'http://localhost:4001' }],
        },
      ],
    });
    expect(out).toContain('Tina build complete');
    expect(out).toContain('API url:');
    expect(out).not.toContain('"subItems"');
  });
});
