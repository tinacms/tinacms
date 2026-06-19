import { MongodbLevel } from 'mongodb-level';

export default new MongodbLevel<string, string>({
  mongoUri: process.env.MONGO_URI!,
  collectionName: 'tina-adapter-test',
  dbName: 'test',
  valueEncoding: 'utf8',
});
