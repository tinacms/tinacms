import { MemoryLevel } from 'memory-level';
import { describe, expect, it } from 'vitest';
import {
  buildSchema,
  createDatabaseInternal,
  FilesystemBridge,
} from '../../src';
import { setup } from '../util';
import config from './tina/config';

describe('index definitions', () => {
  it.each([
    ['username', true],
    ['title', true],
    ['rank', true],
    ['active', true],
    ['joined', true],
    ['avatar', true],
    ['password', false],
    ['profile', false],
  ])(
    'builds index definitions for the expected fields (%s)',
    async (fieldName, hasIndex) => {
      const database = createDatabaseInternal({
        bridge: new FilesystemBridge(__dirname),
        level: new MemoryLevel<string, Record<string, any>>(),
        tinaDirectory: 'tina',
      });
      await database.indexContent(await buildSchema(config));

      const definitions = await database.getIndexDefinitions();
      expect(Object.keys(definitions.user).includes(fieldName)).toBe(hasIndex);
    }
  );

  it('does not sort documents by a field without an index definition', async () => {
    const { get } = await setup(__dirname, config);
    const bySort = (sort: string) =>
      get({
        query: `query { userConnection(sort: "${sort}") { edges { node { username } } } }`,
        variables: {},
      });

    const byTitle = await bySort('title');
    expect(
      byTitle.data?.userConnection.edges.map((e: any) => e.node.username)
    ).toEqual(['second-user', 'first-user']);

    const byPassword = await bySort('password');
    if (!byPassword.errors) {
      expect(
        byPassword.data?.userConnection.edges.map((e: any) => e.node.username)
      ).toEqual(['first-user', 'second-user']);
    }
  });
});
