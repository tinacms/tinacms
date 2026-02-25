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

import type { Database } from '@tinacms/graphql';
import type { ConfigManager } from '../config-manager';
import * as filterPublicEnvModule from './filterPublicEnv';
import { createConfig } from './index';

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

describe('createConfig', () => {
  let spy: jest.SpyInstance;

  beforeAll(() => {
    spy = jest
      .spyOn(filterPublicEnvModule, 'filterPublicEnv')
      .mockReturnValue(FAKE_PUBLIC_ENV);
  });

  afterAll(() => {
    spy.mockRestore();
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
  });

  it('sets server.fs.strict to true', async () => {
    const config = await createConfig({
      configManager: stubConfigManager(),
      database: {} as Database,
      apiURL: 'http://localhost:4001/graphql',
      noWatch: true,
    });

    expect(config.server!.fs!.strict).toBe(true);
  });

  it('allows spaRootPath and rootPath in server.fs', async () => {
    const cm = stubConfigManager();
    const config = await createConfig({
      configManager: cm,
      database: {} as Database,
      apiURL: 'http://localhost:4001/graphql',
      noWatch: true,
    });

    expect(config.server!.fs!.allow).toContain(cm.spaRootPath);
    expect(config.server!.fs!.allow).toContain(cm.rootPath);
  });

  it('allows contentRootPath when it differs from rootPath', async () => {
    const cm = stubConfigManager();
    (cm as any).contentRootPath = '/fake/content-repo';
    const config = await createConfig({
      configManager: cm,
      database: {} as Database,
      apiURL: 'http://localhost:4001/graphql',
      noWatch: true,
    });

    expect(config.server!.fs!.allow).toContain('/fake/content-repo');
  });

  it('does not duplicate rootPath when contentRootPath equals rootPath', async () => {
    const cm = stubConfigManager();
    (cm as any).contentRootPath = cm.rootPath;
    const config = await createConfig({
      configManager: cm,
      database: {} as Database,
      apiURL: 'http://localhost:4001/graphql',
      noWatch: true,
    });

    const rootOccurrences = config.server!.fs!.allow!.filter(
      (p) => p === cm.rootPath
    );
    expect(rootOccurrences).toHaveLength(1);
  });

  it('sets server.cors.origin from buildCorsOriginCheck', async () => {
    const config = await createConfig({
      configManager: stubConfigManager(),
      database: {} as Database,
      apiURL: 'http://localhost:4001/graphql',
      noWatch: true,
    });

    expect(typeof (config.server!.cors as any).origin).toBe('function');
  });

  it('passes server.allowedOrigins through to the CORS callback', async () => {
    const cm = stubConfigManager();
    (cm.config as any).server = {
      allowedOrigins: ['https://my-codespace.github.dev'],
    };

    const config = await createConfig({
      configManager: cm,
      database: {} as Database,
      apiURL: 'http://localhost:4001/graphql',
      noWatch: true,
    });

    const originFn = (config.server!.cors as any).origin;
    const allowed = await new Promise<boolean>((resolve) => {
      originFn('https://my-codespace.github.dev', (_err: any, allow: boolean) =>
        resolve(!!allow)
      );
    });
    expect(allowed).toBe(true);
  });
});
