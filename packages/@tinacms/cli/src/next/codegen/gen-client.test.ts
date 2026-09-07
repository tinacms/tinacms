/**
 * The generated client is built by string interpolation, so every value that
 * reaches it has to arrive as a JS literal. `branch` is the one an outside
 * contributor can choose: it comes from the git ref a build runs on, which a
 * fork's pull request names.
 */
const buildClientString = ({
  apiURL,
  token,
  errorPolicy,
  cacheDir,
  localContentBuild = false,
}: {
  apiURL: string;
  token?: string;
  errorPolicy?: string;
  cacheDir?: string;
  localContentBuild?: boolean;
}) =>
  `import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ ${
    cacheDir ? `cacheDir: ${JSON.stringify(cacheDir)}, ` : ''
  }url: ${
    localContentBuild
      ? `process.env.TINA_LOCAL_URL || ${JSON.stringify(apiURL)}`
      : JSON.stringify(apiURL)
  }, token: ${JSON.stringify(String(token))}, queries, ${
    errorPolicy ? `errorPolicy: ${JSON.stringify(String(errorPolicy))}` : ''
  } });
export default client;
  `;

/** Runs the generated source and reports what the `url` option received. */
const evaluateClient = (clientString: string) => {
  const body = clientString
    .replace(/^import .*$/gm, '')
    .replace('export default client;', '')
    .replace('export const client =', 'return');
  const createClient = (options: { url: string }) => options;
  // eslint-disable-next-line no-new-func
  return new Function('createClient', 'queries', body)(createClient, {});
};

const apiUrlFor = (branch: string) =>
  `https://content.tinajs.io/2.4/content/CLIENTID/github/${branch}`;

describe('generated client', () => {
  it('keeps an ordinary branch in the url', () => {
    const options = evaluateClient(
      buildClientString({ apiURL: apiUrlFor('main'), token: 'TOKEN' })
    );

    expect(options.url).toBe(apiUrlFor('main'));
  });

  it('keeps a branch that contains slashes', () => {
    const options = evaluateClient(
      buildClientString({ apiURL: apiUrlFor('feature/a-b'), token: 'TOKEN' })
    );

    expect(options.url).toBe(apiUrlFor('feature/a-b'));
  });

  // Each branch name below is accepted by `git check-ref-format`.
  it.each([
    ['a single quote', "x'+(globalThis.__PROBE='hit')+'"],
    ['a double quote', 'x"+(globalThis.__PROBE=\'hit\')+"'],
    ['a backslash', 'x\\\\'],
    ['a newline', 'a\nb'],
  ])('keeps a branch containing %s inside the url string', (_label, branch) => {
    (globalThis as Record<string, unknown>).__PROBE = undefined;

    const options = evaluateClient(
      buildClientString({ apiURL: apiUrlFor(branch), token: 'TOKEN' })
    );

    expect((globalThis as Record<string, unknown>).__PROBE).toBeUndefined();
    expect(options.url).toBe(apiUrlFor(branch));
  });

  it('keeps a token containing a quote inside the token string', () => {
    const options = evaluateClient(
      buildClientString({ apiURL: apiUrlFor('main'), token: "a'b" })
    );

    expect(options.url).toBe(apiUrlFor('main'));
  });

  it('still falls back to the local url when building local content', () => {
    const options = evaluateClient(
      buildClientString({
        apiURL: apiUrlFor('main'),
        token: 'TOKEN',
        localContentBuild: true,
      })
    );

    expect(options.url).toBe(apiUrlFor('main'));
  });
});
