import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import type { ConfigManager } from '../config-manager';
import { writeTinaLockFile } from './writeTinaLockFile';

const schema = { collections: [{ name: 'post' }] };
const lookup = { post: { type: 'document' } };
const graphql = { __schema: { types: [] } };

const makeConfigManager = (
  dir: string,
  { isUsingLegacyFolder }: { isUsingLegacyFolder: boolean }
): ConfigManager =>
  ({
    tinaFolderPath: dir,
    isUsingLegacyFolder,
    generatedSchemaJSONPath: path.join(dir, '__generated__', '_schema.json'),
    generatedLookupJSONPath: path.join(dir, '__generated__', '_lookup.json'),
    generatedGraphQLJSONPath: path.join(dir, '__generated__', '_graphql.json'),
  }) as ConfigManager;

describe('writeTinaLockFile', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'tina-lock-'));
    const generated = path.join(dir, '__generated__');
    await fs.outputJSON(path.join(generated, '_schema.json'), schema);
    await fs.outputJSON(path.join(generated, '_lookup.json'), lookup);
    await fs.outputJSON(path.join(generated, '_graphql.json'), graphql);
  });

  afterEach(async () => {
    await fs.remove(dir);
  });

  it('bundles the three generated outputs into tina-lock.json for a tina/ project', async () => {
    await writeTinaLockFile(
      makeConfigManager(dir, { isUsingLegacyFolder: false })
    );

    const lockPath = path.join(dir, 'tina-lock.json');
    expect(await fs.pathExists(lockPath)).toBe(true);
    expect(await fs.readJSON(lockPath)).toEqual({ schema, lookup, graphql });
  });

  it('is a no-op for a legacy .tina/ project', async () => {
    await writeTinaLockFile(
      makeConfigManager(dir, { isUsingLegacyFolder: true })
    );

    expect(await fs.pathExists(path.join(dir, 'tina-lock.json'))).toBe(false);
  });
});
