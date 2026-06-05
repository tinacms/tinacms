import { SqliteLevel } from 'sqlite-level';

export default new SqliteLevel<string, string>({
  filename: ':memory:',
  valueEncoding: 'utf8',
});
