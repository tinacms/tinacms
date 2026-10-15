import { MemoryLevel } from 'memory-level';
import { describe, expect, it, vi } from 'vitest';
import {
  buildSchema,
  createDatabase,
  createDatabaseInternal,
  createLocalDatabase,
  FilesystemBridge,
  resolve,
} from '../../src';
import type { Database } from '../../src/database';
import config from './tina/config';

vi.mock('../../src/level/tinaLevel', async () => {
  const { MemoryLevel } = await import('memory-level');
  class TinaLevelClient extends MemoryLevel<string, Record<string, any>> {
    openConnection() {}
  }
  return { TinaLevelClient };
});

const updateUsers = `mutation { updateDocument(collection: "user", relativePath: "index.json", params: { user: { users: [{ username: "admin-user", name: "Admin User", email: "admin@example.com", password: { passwordChangeRequired: false } }] } }) { __typename } }`;

const newLevel = () => new MemoryLevel<string, Record<string, any>>();

const gitProvider = {
  onPut: async () => {},
  onDelete: async () => {},
};

const updateUsersWith = async (
  database: Database,
  ctxUser?: { sub?: string } | null
) => {
  await database.indexContent(await buildSchema(config));
  return resolve({ database, query: updateUsers, variables: {}, ctxUser });
};

describe('auth collection database defaults', () => {
  it('keeps the development database writable without a session', async () => {
    const database = createDatabaseInternal({
      bridge: new FilesystemBridge(__dirname),
      level: newLevel(),
      tinaDirectory: 'tina',
    });
    const result = await updateUsersWith(database);
    expect(result.errors).toBeUndefined();
  });

  it('keeps the local database writable without a session', async () => {
    const database = createLocalDatabase({ rootPath: __dirname });
    expect(database.authCollection.allowUnauthenticatedWrites).toBe(true);
    const result = await updateUsersWith(database);
    expect(result.errors).toBeUndefined();
  });

  it('checks the session user on every database', async () => {
    const database = createDatabaseInternal({
      bridge: new FilesystemBridge(__dirname),
      level: newLevel(),
      tinaDirectory: 'tina',
    });
    const result = await updateUsersWith(database, { sub: 'editor-user' });
    expect(result.errors?.[0]?.message).toBe('Not authorized');
  });

  it.each([{ ctxUser: undefined }, { ctxUser: { sub: 'editor-user' } }])(
    'requires an admin on a production database ($ctxUser)',
    async ({ ctxUser }) => {
      const database = createDatabase({
        bridge: new FilesystemBridge(__dirname),
        databaseAdapter: newLevel(),
        gitProvider,
        tinaDirectory: 'tina',
      });
      expect(database.authCollection.allowUnauthenticatedWrites).toBe(false);
      const result = await updateUsersWith(database, ctxUser);
      expect(result.errors?.[0]?.message).toBe('Not authorized');
    }
  );

  it('honours an explicit allowUnauthenticatedWrites value', async () => {
    const internal = createDatabaseInternal({
      bridge: new FilesystemBridge(__dirname),
      level: newLevel(),
      tinaDirectory: 'tina',
      authCollection: { allowUnauthenticatedWrites: false },
    });
    const denied = await updateUsersWith(internal);
    expect(denied.errors?.[0]?.message).toBe('Not authorized');

    const production = createDatabase({
      bridge: new FilesystemBridge(__dirname),
      databaseAdapter: newLevel(),
      gitProvider,
      tinaDirectory: 'tina',
      authCollection: { allowUnauthenticatedWrites: true },
    });
    const allowed = await updateUsersWith(production);
    expect(allowed.errors).toBeUndefined();
  });
});
