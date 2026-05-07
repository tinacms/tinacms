// End-to-end orchestration test for `localContentPath`.
//
// Bridge unit tests (in @tinacms/graphql) pin the routing rule in isolation:
// given a (rootPath, contentRootPath) pair, generated paths go to rootPath and
// content paths go to contentRootPath. resolve-content-root.test.ts pins the
// resolver that turns config + on-disk state into a contentRootPath.
//
// What neither covers is the wiring step: a project sets `localContentPath`,
// `resolveContentRootPath` produces an absolute content path, and a
// FilesystemBridge constructed with `(rootPath, contentRootPath)` then routes
// reads and writes correctly. A future refactor that swapped the bridge
// constructor args, dropped the resolver call, or quietly fed `rootPath` into
// both bridge slots would slip past the unit tests but get caught here.
//
// Real fs, real bridge — only mocks needed are the same chalk + logger stubs
// the resolve-content-root.test.ts file uses (chalk v5 is ESM-only and can't
// be loaded under jest's CommonJS runtime).

jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('chalk', () => {
  const identity = (s: string) => s;
  return {
    __esModule: true,
    default: { yellow: identity, cyan: identity, red: identity },
    yellow: identity,
    cyan: identity,
    red: identity,
  };
});

import os from 'os';
import path from 'path';
import fs from 'fs-extra';
// Import the bridge from source rather than the built package entry point.
// Jest's CLI-package resolver doesn't follow the `exports` field of
// @tinacms/graphql under `useESM: true`, and importing the built dist directly
// hits a CommonJS / ESM boundary. Sourcing from `../graphql/src` keeps the
// test on the current code regardless of build state.
import { FilesystemBridge } from '../../../graphql/src/database/bridge/filesystem';
import { resolveContentRootPath } from './resolve-content-root';

describe('localContentPath orchestration (resolveContentRootPath + FilesystemBridge)', () => {
  let parentDir: string;
  let generatorDir: string;
  let contentDir: string;
  let tinaFolderPath: string;
  let tinaConfigFilePath: string;

  beforeEach(async () => {
    parentDir = path.join(
      os.tmpdir(),
      `tinacms-orchestration-${Date.now()}-${Math.random().toString(36).slice(2)}`
    );
    generatorDir = path.join(parentDir, 'generator-repo');
    contentDir = path.join(parentDir, 'content-repo');
    tinaFolderPath = path.join(generatorDir, 'tina');
    tinaConfigFilePath = path.join(tinaFolderPath, 'config.ts');

    await fs.mkdirp(tinaFolderPath);
    // Sentinel config file path — resolver only uses it for warning messages.
    await fs.outputFile(
      tinaConfigFilePath,
      'export default { build: {}, schema: {} } as any\n'
    );
  });

  afterEach(async () => {
    await fs.remove(parentDir);
  });

  test('localContentPath pointing at an existing sibling routes content to that sibling', async () => {
    await fs.mkdirp(contentDir);

    const contentRootPath = await resolveContentRootPath({
      rootPath: generatorDir,
      tinaFolderPath,
      tinaConfigFilePath,
      localContentPath: '../../content-repo',
    });

    expect(contentRootPath).toBe(contentDir);

    const bridge = new FilesystemBridge(generatorDir, contentRootPath);

    await bridge.put('tina/__generated__/_schema.json', '{"v":1}');
    await bridge.put('tina/__generated__/_graphql.json', '{"v":1}');
    await bridge.put('tina/__generated__/_lookup.json', '{"v":1}');
    await bridge.put('posts/hello.md', '# hello');

    expect(
      await fs.pathExists(
        path.join(generatorDir, 'tina/__generated__/_schema.json')
      )
    ).toBe(true);
    expect(
      await fs.pathExists(
        path.join(generatorDir, 'tina/__generated__/_graphql.json')
      )
    ).toBe(true);
    expect(
      await fs.pathExists(
        path.join(generatorDir, 'tina/__generated__/_lookup.json')
      )
    ).toBe(true);
    expect(await fs.pathExists(path.join(contentDir, 'posts/hello.md'))).toBe(
      true
    );

    // Content repo must remain free of generated artifacts.
    expect(await fs.pathExists(path.join(contentDir, 'tina'))).toBe(false);
    // Generator repo must not absorb content files.
    expect(await fs.pathExists(path.join(generatorDir, 'posts/hello.md'))).toBe(
      false
    );
  });

  test('reads of generated artifacts come from the generator even if the content repo has shadow copies', async () => {
    // Pins the asymmetry: a stale `tina/__generated__/` left behind in the
    // content repo (a real-world condition for projects upgrading from the
    // old multi-repo model) must not be read from. Generator wins.
    await fs.mkdirp(contentDir);
    await fs.outputFile(
      path.join(generatorDir, 'tina/__generated__/_lookup.json'),
      '{"source":"generator"}'
    );
    await fs.outputFile(
      path.join(contentDir, 'tina/__generated__/_lookup.json'),
      '{"source":"content-stale"}'
    );

    const contentRootPath = await resolveContentRootPath({
      rootPath: generatorDir,
      tinaFolderPath,
      tinaConfigFilePath,
      localContentPath: '../../content-repo',
    });
    const bridge = new FilesystemBridge(generatorDir, contentRootPath);

    const result = await bridge.get('tina/__generated__/_lookup.json');
    expect(result).toBe('{"source":"generator"}');
  });

  test('localContentPath pointing at a missing sibling falls back, and the bridge degrades to single-repo behaviour', async () => {
    // contentDir intentionally NOT created.
    const contentRootPath = await resolveContentRootPath({
      rootPath: generatorDir,
      tinaFolderPath,
      tinaConfigFilePath,
      localContentPath: '../../content-repo',
    });

    expect(contentRootPath).toBe(generatorDir);

    const bridge = new FilesystemBridge(generatorDir, contentRootPath);
    await bridge.put('posts/hello.md', '# hello');

    // With contentRootPath === rootPath, content lands in the generator —
    // single-repo behaviour. The fact that the user had localContentPath
    // configured doesn't reroute writes if the directory doesn't exist.
    expect(await fs.pathExists(path.join(generatorDir, 'posts/hello.md'))).toBe(
      true
    );
  });

  test('omitted localContentPath wires up as a single-repo project', async () => {
    const contentRootPath = await resolveContentRootPath({
      rootPath: generatorDir,
      tinaFolderPath,
      tinaConfigFilePath,
      localContentPath: undefined,
    });

    expect(contentRootPath).toBe(generatorDir);

    const bridge = new FilesystemBridge(generatorDir, contentRootPath);
    await bridge.put('tina/__generated__/_schema.json', '{"v":1}');
    await bridge.put('posts/hello.md', '# hello');

    expect(
      await fs.pathExists(
        path.join(generatorDir, 'tina/__generated__/_schema.json')
      )
    ).toBe(true);
    expect(await fs.pathExists(path.join(generatorDir, 'posts/hello.md'))).toBe(
      true
    );
  });

  test('swapped bridge constructor args route to the wrong repo (regression sentinel)', async () => {
    // Documents the failure mode kulesy called out: if a future refactor
    // calls `new FilesystemBridge(contentRootPath, rootPath)` instead of
    // `(rootPath, contentRootPath)`, generated artifacts land in the content
    // repo and content lands in the generator. This test asserts that the
    // swap is observably wrong, so the orchestration tests above (which use
    // the correct order) carry meaning.
    await fs.mkdirp(contentDir);

    const contentRootPath = await resolveContentRootPath({
      rootPath: generatorDir,
      tinaFolderPath,
      tinaConfigFilePath,
      localContentPath: '../../content-repo',
    });

    // Intentionally swapped: contentRootPath first, generator second.
    const wrongOrderBridge = new FilesystemBridge(
      contentRootPath,
      generatorDir
    );
    await wrongOrderBridge.put('tina/__generated__/_schema.json', '{"v":1}');
    await wrongOrderBridge.put('posts/hello.md', '# hello');

    // Generated lands in content repo (wrong) — this is the regression a
    // swap would silently introduce.
    expect(
      await fs.pathExists(
        path.join(contentDir, 'tina/__generated__/_schema.json')
      )
    ).toBe(true);
    // Content lands in generator (wrong).
    expect(await fs.pathExists(path.join(generatorDir, 'posts/hello.md'))).toBe(
      true
    );
  });
});
