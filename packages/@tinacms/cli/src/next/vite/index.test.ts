import path from 'node:path';

// Stub heavy dependencies before importing the module under test.
jest.mock('fs-extra', () => ({
  pathExists: jest.fn().mockResolvedValue(false),
  outputFile: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@vitejs/plugin-react', () => ({
  __esModule: true,
  default: () => ({ name: 'mock-react' }),
}));
jest.mock('./tailwind', () => ({
  tinaTailwind: () => ({ name: 'mock-tailwind' }),
}));
jest.mock('vite', () => ({
  splitVendorChunkPlugin: () => ({ name: 'mock-split-vendor' }),
}));

import { createConfig } from './index';
import * as filterPublicEnvModule from './filterPublicEnv';
import type { ConfigManager } from '../config-manager';
import type { Database } from '@tinacms/graphql';

/** Minimal stub satisfying the properties createConfig reads. */
function stubConfigManager(): ConfigManager {
  const root = '/fake/project';
  const tina = path.join(root, 'tina');
  const generated = path.join(tina, '__generated__');
  const spaRoot = path.join(root, 'node_modules', '@tinacms', 'app');

  return {
    rootPath: root,
    generatedFolderPath: generated,
    prebuildFilePath: path.join(generated, 'config.prebuild.jsx'),
    generatedGraphQLJSONPath: path.join(generated, '_graphql.json'),
    spaRootPath: spaRoot,
    tinaFolderPath: tina,
    outputFolderPath: path.join(root, 'public', 'admin'),
    generatedTypesTSFilePath: path.join(generated, 'types.ts'),
    generatedTypesJSFilePath: path.join(generated, 'types.js'),
    config: {
      media: {},
      build: {
        outputFolder: 'admin',
        publicFolder: 'public',
        basePath: '',
        host: false,
      },
    },
    isUsingTs: () => true,
    shouldSkipSDK: () => true,
    getTinaGraphQLVersion: () => ({
      fullVersion: '1.0.0',
      major: '1',
      minor: '0',
      patch: '0',
    }),
  } as unknown as ConfigManager;
}

const FAKE_PUBLIC_ENV = {
  TINA_PUBLIC_CLIENT_ID: 'my-client-id',
  NEXT_PUBLIC_API_URL: 'https://api.example.com',
  NODE_ENV: 'test',
  HEAD: 'main',
};

describe('createConfig integration', () => {
  let spy: jest.SpyInstance;

  beforeAll(() => {
    spy = jest
      .spyOn(filterPublicEnvModule, 'filterPublicEnv')
      .mockReturnValue(FAKE_PUBLIC_ENV);
  });

  afterAll(() => {
    spy.mockRestore();
  });

  it('calls filterPublicEnv', async () => {
    await createConfig({
      configManager: stubConfigManager(),
      database: {} as Database,
      apiURL: 'http://localhost:4001/graphql',
      noWatch: true,
    });

    expect(spy).toHaveBeenCalled();
  });

  it('embeds the filterPublicEnv result into define["process.env"]', async () => {
    const config = await createConfig({
      configManager: stubConfigManager(),
      database: {} as Database,
      apiURL: 'http://localhost:4001/graphql',
      noWatch: true,
    });
    const raw = config.define!['process.env'];

    expect(raw).toBe(`new Object(${JSON.stringify(FAKE_PUBLIC_ENV)})`);
  });

  it('contains only the keys returned by filterPublicEnv', async () => {
    const config = await createConfig({
      configManager: stubConfigManager(),
      database: {} as Database,
      apiURL: 'http://localhost:4001/graphql',
      noWatch: true,
    });
    const raw = config.define!['process.env'];
    const jsonStr = raw.replace(/^new Object\(/, '').replace(/\)$/, '');
    const env = JSON.parse(jsonStr);

    expect(env).toEqual(FAKE_PUBLIC_ENV);
  });

  it('does not embed any values outside the filterPublicEnv result', async () => {
    spy.mockReturnValue({ TINA_PUBLIC_ONLY: 'safe' });

    const config = await createConfig({
      configManager: stubConfigManager(),
      database: {} as Database,
      apiURL: 'http://localhost:4001/graphql',
      noWatch: true,
    });
    const raw = config.define!['process.env'];
    const jsonStr = raw.replace(/^new Object\(/, '').replace(/\)$/, '');
    const env = JSON.parse(jsonStr);

    expect(Object.keys(env)).toEqual(['TINA_PUBLIC_ONLY']);
    expect(env.TINA_PUBLIC_ONLY).toBe('safe');
  });
});
