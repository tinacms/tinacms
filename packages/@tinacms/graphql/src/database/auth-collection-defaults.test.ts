import { MemoryLevel } from 'memory-level';
import { describe, expect, it, vi } from 'vitest';
import { FilesystemBridge } from './bridge/filesystem';
import {
  createDatabase,
  createDatabaseInternal,
  createLocalDatabase,
  Database,
} from './index';

vi.mock('../level/tinaLevel', async () => {
  const { MemoryLevel } = await import('memory-level');
  class TinaLevelClient extends MemoryLevel<string, Record<string, any>> {
    openConnection() {}
  }
  return { TinaLevelClient };
});

const newLevel = () => new MemoryLevel<string, Record<string, any>>();
const bridge = () => new FilesystemBridge(__dirname);
const gitProvider = { onPut: async () => {}, onDelete: async () => {} };

describe('authCollection defaults of each database factory', () => {
  it('does not allow writes without a user for createDatabase', () => {
    const database = createDatabase({
      bridge: bridge(),
      gitProvider,
      databaseAdapter: newLevel(),
    });
    expect(database.authCollection).toEqual({
      admins: [],
      allowUnauthenticatedWrites: false,
    });
  });

  it('does not allow writes without a user for the legacy createDatabase form', () => {
    const database = createDatabase({
      bridge: bridge(),
      level: newLevel(),
      onPut: async () => {},
      onDelete: async () => {},
    });
    expect(database.authCollection.allowUnauthenticatedWrites).toBe(false);
  });

  it('does not allow writes without a user for new Database', () => {
    const database = new Database({ bridge: bridge(), level: newLevel() });
    expect(database.authCollection.allowUnauthenticatedWrites).toBe(false);
  });

  it('allows writes without a user for createDatabaseInternal', () => {
    const database = createDatabaseInternal({
      bridge: bridge(),
      level: newLevel(),
    });
    expect(database.authCollection.allowUnauthenticatedWrites).toBe(true);
  });

  it('allows writes without a user for createLocalDatabase', () => {
    const database = createLocalDatabase({ rootPath: __dirname });
    expect(database.authCollection.allowUnauthenticatedWrites).toBe(true);
  });

  it('uses an explicit allowUnauthenticatedWrites value over the default', () => {
    const internal = createDatabaseInternal({
      bridge: bridge(),
      level: newLevel(),
      authCollection: { allowUnauthenticatedWrites: false },
    });
    const hosted = createDatabase({
      bridge: bridge(),
      gitProvider,
      databaseAdapter: newLevel(),
      authCollection: { allowUnauthenticatedWrites: true },
    });
    expect(internal.authCollection.allowUnauthenticatedWrites).toBe(false);
    expect(hosted.authCollection.allowUnauthenticatedWrites).toBe(true);
  });

  it('keeps a frozen copy of the admins list', () => {
    const admins = ['admin-user'];
    const database = createDatabase({
      bridge: bridge(),
      gitProvider,
      databaseAdapter: newLevel(),
      authCollection: { admins },
    });
    admins.push('someone-else');
    expect(database.authCollection.admins).toEqual(['admin-user']);
    expect(Object.isFrozen(database.authCollection.admins)).toBe(true);
  });
});
