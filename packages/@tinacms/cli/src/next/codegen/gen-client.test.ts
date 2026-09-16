// The client is written by string interpolation, so every value in it has to
// land as a JS literal. The branch name is the one the site owner controls least.
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

import { AddGeneratedClientFunc } from './codegen/plugin';
import { Codegen } from './index';

const apiUrlFor = (branch: string) =>
  `https://content.tinajs.io/2.4/content/CLIENTID/github/${branch}`;

const genClient = ({
  apiURL,
  token = 'TOKEN',
  errorPolicy,
  cachePath,
  localContentBuild = false,
}: {
  apiURL: string;
  token?: string;
  errorPolicy?: string;
  cachePath?: string;
  localContentBuild?: boolean;
}) => {
  const instance = Object.create(Codegen.prototype) as Codegen;
  instance.apiURL = apiURL;
  instance.localContentBuild = localContentBuild;
  instance.noClientBuildCache = cachePath === undefined;
  instance.configManager = {
    config: { token, client: { errorPolicy } },
    generatedCachePath: cachePath,
  } as any;
  return instance.genClient();
};

type ClientOptions = {
  url: string;
  token: string;
  cacheDir?: string;
  errorPolicy?: string;
};

/** Runs the generated source and reports the options createClient received. */
const evaluateClient = (clientString: string): ClientOptions => {
  const body = clientString
    .replace(/^import .*$/gm, '')
    .replace('export default client;', '')
    .replace('export const client =', 'return');
  const createClient = (options: ClientOptions) => options;
  return new Function('createClient', 'queries', body)(createClient, {});
};

const pluginClient = (apiURL: string) =>
  AddGeneratedClientFunc(apiURL)({} as any, [], {}) as string;

// Quotes are valid git ref names. Backslash and newline are not, but
// GITHUB_BRANCH is free text.
const hostileBranches: [string, string][] = [
  ['a single quote', "x'+(globalThis.__PROBE='hit')+'"],
  ['a double quote', 'x"+(globalThis.__PROBE=\'hit\')+"'],
  ['a backslash', 'x\\'],
  ['a newline', 'a\nb'],
];

describe('Codegen.genClient', () => {
  it.each(['main', 'feature/a-b'])('keeps %s in the url', async (branch) => {
    const { clientString } = await genClient({ apiURL: apiUrlFor(branch) });

    expect(evaluateClient(clientString).url).toBe(apiUrlFor(branch));
  });

  it.each(hostileBranches)(
    'keeps a branch containing %s inside the url string',
    async (_label, branch) => {
      (globalThis as Record<string, unknown>).__PROBE = undefined;

      const { clientString } = await genClient({ apiURL: apiUrlFor(branch) });
      const options = evaluateClient(clientString);

      expect((globalThis as Record<string, unknown>).__PROBE).toBeUndefined();
      expect(options.url).toBe(apiUrlFor(branch));
    }
  );

  it('keeps a quote in the token, cache dir and error policy', async () => {
    const { clientString } = await genClient({
      apiURL: apiUrlFor('main'),
      token: "a'b",
      cachePath: "/dave's site/.tina/cache",
      errorPolicy: "throw'",
    });

    expect(evaluateClient(clientString)).toMatchObject({
      url: apiUrlFor('main'),
      token: "a'b",
      cacheDir: "/dave's site/.tina/cache",
      errorPolicy: "throw'",
    });
  });

  it('still lets TINA_LOCAL_URL win when building local content', async () => {
    const { clientString } = await genClient({
      apiURL: apiUrlFor('main'),
      localContentBuild: true,
    });

    expect(clientString).toContain(
      `url: process.env.TINA_LOCAL_URL || ${JSON.stringify(apiUrlFor('main'))}`
    );
  });
});

describe('AddGeneratedClientFunc', () => {
  it.each(hostileBranches)(
    'keeps a branch containing %s inside the url string',
    (_label, branch) => {
      expect(pluginClient(apiUrlFor(branch))).toContain(
        `url: ${JSON.stringify(apiUrlFor(branch))},`
      );
    }
  );
});
