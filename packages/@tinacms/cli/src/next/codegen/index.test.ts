jest.mock('fs-extra', () => ({
  ensureFile: jest.fn().mockResolvedValue(undefined),
  outputFile: jest.fn().mockResolvedValue(undefined),
  existsSync: jest.fn().mockReturnValue(false),
  unlinkSync: jest.fn(),
  stat: jest.fn().mockResolvedValue({ size: 0 }),
}));
jest.mock(
  '@tinacms/graphql',
  () => ({ mapUserFields: jest.fn().mockReturnValue([]) }),
  { virtual: true }
);
jest.mock('./codegen', () => ({
  generateTypes: jest.fn().mockResolvedValue(''),
}));
jest.mock('esbuild', () => ({
  transform: jest.fn().mockResolvedValue({ code: '' }),
}));

import path from 'path';
import * as stripModule from './stripSearchTokenFromConfig';
import { Codegen } from './index';

describe('Codegen.genClient', () => {
  function makeInstance(isTs: boolean): Codegen {
    const instance = Object.create(Codegen.prototype) as Codegen;
    instance.apiURL = 'https://example.com/graphql';
    instance.localContentBuild = false;
    instance.noClientBuildCache = true;
    instance.configManager = {
      config: { token: 'tok' },
      generatedCachePath: '/fake/cache',
      isUsingTs: () => isTs,
    } as any;
    return instance;
  }

  it('emits ./types.js import for TypeScript projects', async () => {
    // The .js extension satisfies Node native ESM at runtime. Modern TS
    // module resolution (bundler / node16 / nodenext) rewrites `./types.js`
    // back to `./types.ts` at compile time, so type checking still sees
    // the .ts source and `allowImportingTsExtensions` is not required.
    const { clientString } = await makeInstance(true).genClient();
    expect(clientString).toContain('from "./types.js"');
    expect(clientString).not.toMatch(/from ["']\.\/types\.ts["']/);
    expect(clientString).not.toMatch(/from ["']\.\/types["']/);
  });

  it('emits ./types.js import for non-TypeScript projects', async () => {
    // Node ESM strictly requires the extension on relative imports.
    const { clientString } = await makeInstance(false).genClient();
    expect(clientString).toContain('from "./types.js"');
    expect(clientString).not.toMatch(/from ["']\.\/types["']/);
  });
});

describe('Codegen.genDatabaseClient', () => {
  function makeInstance(isTs: boolean): Codegen {
    const instance = Object.create(Codegen.prototype) as Codegen;
    instance.configManager = {
      isUsingTs: () => isTs,
    } as any;
    instance.tinaSchema = {
      getCollections: () => [],
    } as any;
    return instance;
  }

  it('emits ./types.js import for TypeScript projects', async () => {
    const result = await makeInstance(true).genDatabaseClient();
    expect(result).toContain('from "./types.js"');
    expect(result).not.toMatch(/from ["']\.\/types\.ts["']/);
    expect(result).not.toMatch(/from ["']\.\/types["']/);
  });

  it('emits ./types.js import for non-TypeScript projects', async () => {
    const result = await makeInstance(false).genDatabaseClient();
    expect(result).toContain('from "./types.js"');
    expect(result).not.toMatch(/from ["']\.\/types["']/);
  });
});

describe('Codegen.execute integration', () => {
  let spy: jest.SpyInstance;
  const SAFE_RESULT = { branch: 'main', token: 'tok' };

  beforeAll(() => {
    spy = jest
      .spyOn(stripModule, 'stripSearchTokenFromConfig')
      .mockReturnValue(SAFE_RESULT);
  });

  afterAll(() => {
    spy.mockRestore();
  });

  function stubCodegen(): Codegen {
    // Bypass the constructor's buildASTSchema call by creating a bare object
    // with just enough shape for execute() to run.
    const instance = Object.create(Codegen.prototype) as Codegen;

    instance.graphqlSchemaDoc = {} as any;
    instance.tinaSchema = {
      schema: {
        config: {
          branch: 'main',
          token: 'tok',
          clientId: 'cid',
          search: {
            tina: { indexerToken: 'secret-token' },
          },
        },
      },
      getCollections: () => [],
    } as any;
    instance.configManager = {
      generatedFolderPath: '/fake/tina/__generated__',
      generatedSchemaJSONPath: '/fake/tina/__generated__/_schema.json',
      generatedQueriesFilePath: '/fake/tina/__generated__/queries.gql',
      generatedFragmentsFilePath: '/fake/tina/__generated__/frags.gql',
      config: {
        branch: 'main',
        token: 'tok',
        clientId: 'cid',
      },
      shouldSkipSDK: () => true,
      getTinaGraphQLVersion: () => ({
        fullVersion: '1.0.0',
        major: '1',
        minor: '0',
        patch: '0',
      }),
    } as any;
    instance.isLocal = true;
    instance.port = 4001;
    instance.queryDoc = '';
    instance.fragDoc = '';
    instance.lookup = {};
    instance.noClientBuildCache = true;

    return instance;
  }

  it('calls stripSearchTokenFromConfig during execute', async () => {
    const codegen = stubCodegen();
    await codegen.execute();

    expect(spy).toHaveBeenCalled();
  });

  it('passes the schema config to stripSearchTokenFromConfig', async () => {
    const codegen = stubCodegen();
    const originalConfig = codegen.tinaSchema.schema.config;
    await codegen.execute();

    expect(spy).toHaveBeenCalledWith(originalConfig);
  });

  it('assigns the stripped result back to tinaSchema.schema.config', async () => {
    const codegen = stubCodegen();
    await codegen.execute();

    expect(codegen.tinaSchema.schema.config).toBe(SAFE_RESULT);
  });

  it('writes _schema.json with the stripped config', async () => {
    const codegen = stubCodegen();
    const fs = jest.requireMock('fs-extra');
    (fs.outputFile as jest.Mock).mockClear();

    await codegen.execute();

    const schemaWriteCall = (fs.outputFile as jest.Mock).mock.calls.find(
      ([filePath]: [string]) => filePath.endsWith('_schema.json')
    );
    expect(schemaWriteCall).toBeDefined();

    const writtenData = JSON.parse(schemaWriteCall[1]);
    expect(writtenData.config).toEqual(SAFE_RESULT);
    expect(JSON.stringify(writtenData)).not.toContain('secret-token');
  });

  it('writes each generated config file exactly once (never duplicates to a content repo path)', async () => {
    const codegen = stubCodegen();
    const fs = jest.requireMock('fs-extra');
    (fs.outputFile as jest.Mock).mockClear();

    await codegen.execute();

    for (const fileName of ['_schema.json', '_graphql.json', '_lookup.json']) {
      const calls = (fs.outputFile as jest.Mock).mock.calls.filter(
        ([filePath]: [string]) => filePath.endsWith(fileName)
      );
      expect(calls).toHaveLength(1);
      expect(calls[0][0]).toBe(
        path.join(codegen.configManager.generatedFolderPath, fileName)
      );
    }
  });

  it('emits types.js alongside types.ts in TS projects and does not unlink it', async () => {
    // Regression guard for #6829. Before this fix, the TS branch wrote
    // types.ts and then `unlinkIfExists(generatedTypesJSFilePath)`, leaving
    // Node native ESM users (#6062) with no `./types.js` to resolve. The
    // generated client now imports `"./types.js"` unconditionally, so
    // `types.js` must be co-resident with `types.ts` on disk in TS mode.
    const fs = jest.requireMock('fs-extra');
    const esbuild = jest.requireMock('esbuild');
    (fs.outputFile as jest.Mock).mockClear();
    (fs.unlinkSync as jest.Mock).mockClear();
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (esbuild.transform as jest.Mock).mockClear();
    (esbuild.transform as jest.Mock).mockResolvedValue({ code: '/*js*/' });

    const genTypesSpy = jest
      .spyOn(Codegen.prototype, 'genTypes')
      .mockResolvedValue({
        codeString: '/*ts source*/',
        schemaString: '/*gql schema*/',
      });

    try {
      const codegen = stubCodegen();
      const cm = codegen.configManager as any;
      cm.shouldSkipSDK = () => false;
      cm.isUsingTs = () => true;
      cm.hasSelfHostedConfig = () => false;
      cm.generatedGraphQLGQLPath = '/fake/tina/__generated__/schema.gql';
      cm.generatedTypesTSFilePath = '/fake/tina/__generated__/types.ts';
      cm.generatedTypesJSFilePath = '/fake/tina/__generated__/types.js';
      cm.generatedTypesDFilePath = '/fake/tina/__generated__/types.d.ts';
      cm.generatedClientTSFilePath = '/fake/tina/__generated__/client.ts';
      cm.generatedClientJSFilePath = '/fake/tina/__generated__/client.js';
      cm.generatedCachePath = '/fake/cache';

      await codegen.execute();

      const writtenPaths = (fs.outputFile as jest.Mock).mock.calls.map(
        (c: any[]) => c[0]
      );
      expect(writtenPaths).toContain(cm.generatedTypesTSFilePath);
      expect(writtenPaths).toContain(cm.generatedTypesJSFilePath);
      expect(writtenPaths).toContain(cm.generatedClientTSFilePath);

      expect(esbuild.transform).toHaveBeenCalledWith('/*ts source*/', {
        loader: 'ts',
      });

      const unlinkedPaths = (fs.unlinkSync as jest.Mock).mock.calls.map(
        (c: any[]) => c[0]
      );
      expect(unlinkedPaths).not.toContain(cm.generatedTypesJSFilePath);
      expect(unlinkedPaths).toContain(cm.generatedClientJSFilePath);
      expect(unlinkedPaths).toContain(cm.generatedTypesDFilePath);
    } finally {
      genTypesSpy.mockRestore();
      (fs.existsSync as jest.Mock).mockReturnValue(false);
    }
  });

  it('still writes exactly once when the project has a separate content root', async () => {
    // Strengthens the previous test: even when hasSeparateContentRoot returns
    // true (the multi-repo flag the duplicate-write block used to gate on),
    // we should still see exactly one write per generated file. Pins that the
    // duplicate-write code is gone, not just unreachable in the default mock.
    const codegen = stubCodegen();
    (codegen.configManager as any).hasSeparateContentRoot = () => true;
    (codegen.configManager as any).contentRootPath = '/fake-content-root';

    const fs = jest.requireMock('fs-extra');
    (fs.outputFile as jest.Mock).mockClear();

    await codegen.execute();

    for (const fileName of ['_schema.json', '_graphql.json', '_lookup.json']) {
      const calls = (fs.outputFile as jest.Mock).mock.calls.filter(
        ([filePath]: [string]) => filePath.endsWith(fileName)
      );
      expect(calls).toHaveLength(1);
      expect(calls[0][0]).toBe(
        path.join(codegen.configManager.generatedFolderPath, fileName)
      );
      // Specifically: no write under the content-root path.
      expect(calls[0][0]).not.toContain('fake-content-root');
    }
  });
});
