jest.mock('chalk', () => {
  const chalk: any = new Proxy(() => chalk, {
    get: (_, prop) => (prop === Symbol.toPrimitive ? () => '' : chalk),
    apply: () => chalk,
  });
  return { __esModule: true, default: chalk };
});
jest.mock('prompts', () => jest.fn(async () => ({ nextAuthSecret: 'secret' })));

import { logger } from '../../../logger';
import { chooseAuthProvider } from './authProvider';
import type { Config } from './types';

describe('chooseAuthProvider', () => {
  it('warns that the built-in user login is not for production', async () => {
    const warn = jest.spyOn(logger, 'warn').mockImplementation(() => {});
    const config = { envVars: [] } as unknown as Config;

    await chooseAuthProvider({ config, framework: { name: 'next' } as any });

    const output = warn.mock.calls.map(([msg]) => msg).join('\n');
    expect(output).toMatch(/not\s+production\s+grade/);
    expect(output).toMatch(/auth\s+provider/);
    warn.mockRestore();
  });
});
