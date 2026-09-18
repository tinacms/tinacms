// chalk v5 is ESM-only; jest's CJS runtime can't load it. The prompt modules
// only use it to colour text, so a stub that answers every call and property
// with itself, and reads as an empty string, is enough to let them load.
jest.mock('chalk', () => {
  const chalk: any = new Proxy(() => chalk, {
    get: (_, prop) => (prop === Symbol.toPrimitive ? () => '' : chalk),
    apply: () => chalk,
  });
  return { __esModule: true, default: chalk };
});

import fs from 'fs';
import path from 'path';
import type { Framework } from '..';
import { supportedAuthProviders } from '../prompts/authProvider';
import type { Config } from '../prompts/types';
import { generateConfig } from './config';
import { nextApiRouteTemplate } from './tinaNextRoute';

// Run with UPDATE_GOLDEN=1 to rewrite the fixtures after an intended change.
const expectGolden = (name: string, actual: string) => {
  const file = path.join(__dirname, '__fixtures__', name);
  if (process.env.UPDATE_GOLDEN) {
    fs.writeFileSync(file, actual);
  }
  expect(actual).toBe(fs.readFileSync(file, 'utf8'));
};

const makeConfig = (
  framework: Framework['name'],
  overrides: Partial<Config> = {}
): Config => ({
  typescript: true,
  publicFolder: framework === 'hugo' ? 'static' : 'public',
  framework: { name: framework, reactive: framework === 'next' },
  packageManager: 'pnpm',
  isLocalEnvVarName: 'TINA_PUBLIC_IS_LOCAL',
  envVars: [],
  ...overrides,
});

const configFor = (config: Config, selfHosted: boolean) =>
  generateConfig({
    config,
    publicFolder: config.publicFolder,
    isLocalEnvVarName: config.isLocalEnvVarName,
    selfHosted,
  });

describe('generateConfig', () => {
  it('writes the TinaCloud config for a Next.js site', () => {
    expectGolden(
      'config-next-tinacloud.ts',
      configFor(makeConfig('next'), false)
    );
  });

  it('writes the TinaCloud config for an Astro site', () => {
    expectGolden(
      'config-astro-tinacloud.ts',
      configFor(makeConfig('astro'), false)
    );
  });

  it('writes the TinaCloud config for a Hugo site', () => {
    expectGolden(
      'config-hugo-tinacloud.ts',
      configFor(makeConfig('hugo'), false)
    );
  });

  it('writes the self-hosted config with Auth.js', () => {
    expectGolden(
      'config-next-selfhost-nextauth.ts',
      configFor(
        makeConfig('next', {
          hosting: 'self-host',
          authProvider: supportedAuthProviders['next-auth'],
        }),
        true
      )
    );
  });

  it('writes the self-hosted config with TinaCloud auth', () => {
    expectGolden(
      'config-next-selfhost-tinacloud-auth.ts',
      configFor(
        makeConfig('next', {
          hosting: 'self-host',
          authProvider: supportedAuthProviders['tina-cloud'],
        }),
        true
      )
    );
  });

  it('does not depend on the TypeScript choice', () => {
    expect(configFor(makeConfig('next', { typescript: false }), false)).toBe(
      configFor(makeConfig('next'), false)
    );
  });
});

describe('nextApiRouteTemplate', () => {
  const env = (usingSrc: boolean) => ({ usingSrc }) as any;

  it('writes the Auth.js route under pages/', () => {
    expectGolden(
      'route-nextauth-pages.ts',
      nextApiRouteTemplate({
        config: makeConfig('next', {
          authProvider: supportedAuthProviders['next-auth'],
        }),
        env: env(false),
      })
    );
  });

  it('writes the Auth.js route under src/pages/', () => {
    expectGolden(
      'route-nextauth-src.ts',
      nextApiRouteTemplate({
        config: makeConfig('next', {
          authProvider: supportedAuthProviders['next-auth'],
        }),
        env: env(true),
      })
    );
  });

  it('writes the TinaCloud auth route under pages/', () => {
    expectGolden(
      'route-tinacloud-pages.ts',
      nextApiRouteTemplate({
        config: makeConfig('next', {
          authProvider: supportedAuthProviders['tina-cloud'],
        }),
        env: env(false),
      })
    );
  });
});
