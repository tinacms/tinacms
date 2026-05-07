jest.mock('fs-extra', () => ({
  ensureFile: jest.fn().mockResolvedValue(undefined),
  outputFile: jest.fn().mockResolvedValue(undefined),
  existsSync: jest.fn().mockReturnValue(false),
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

  it('emits ./types.ts import for TypeScript projects', async () => {
    const { clientString } = await makeInstance(true).genClient();
    expect(clientString).toContain('from "./types.ts"');
    expect(clientString).not.toMatch(/from ["']\.\/types["']/);
  });

  it('emits ./types.js import for non-TypeScript projects', async () => {
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

  it('emits ./types.ts import for TypeScript projects', async () => {
    const result = await makeInstance(true).genDatabaseClient();
    expect(result).toContain('from "./types.ts"');
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
      generatedFolderPathContentRepo: '/fake/tina/__generated__',
      generatedSchemaJSONPath: '/fake/tina/__generated__/_schema.json',
      generatedQueriesFilePath: '/fake/tina/__generated__/queries.gql',
      generatedFragmentsFilePath: '/fake/tina/__generated__/frags.gql',
      config: {
        branch: 'main',
        token: 'tok',
        clientId: 'cid',
      },
      hasSeparateContentRoot: () => false,
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
});
