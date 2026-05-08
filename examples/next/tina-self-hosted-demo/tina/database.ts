import { createDatabase, createLocalDatabase } from '@tinacms/datalayer';
import { SqliteLevel } from 'sqlite-level';

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true';

const noopGitProvider = {
  onPut: async () => {},
  onDelete: async () => {},
};

export default isLocal
  ? createLocalDatabase()
  : createDatabase({
      gitProvider: noopGitProvider,
      databaseAdapter: new SqliteLevel<string, Record<string, any>>({
        filename: '.tina/sqlite.db',
      }),
      namespace: 'main',
    });
