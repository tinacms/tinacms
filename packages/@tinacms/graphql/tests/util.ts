import { MemoryLevel } from 'memory-level';
import fs from 'fs-extra';
import path from 'path';
import {
  createDatabaseInternal,
  FilesystemBridge,
  resolve,
  buildSchema,
} from '../src';
import { z } from 'zod';

class OutputBridge extends FilesystemBridge {
  async put(_filepath: string, data: string) {
    super.put(`out.md`, data);
  }
}

const dataSchema = z.object({
  document: z.object({
    _sys: z.object({ title: z.string() }),
    _values: z.record(z.unknown()),
  }),
});

const defaultQuery = `query { document(collection: "post", relativePath: "in.md") { ...on Document { _values, _sys { title } }} }`;

export class SlowMemoryLevel<K, V> extends MemoryLevel<K,V> {
  private delayMS: number;

  constructor(delayMS: number) {
    super();
    this.delayMS = delayMS;
  }

  public async get(key: any, options?: any, callback?: any): Promise<any> {
    await new Promise(r => setTimeout(r, this.delayMS));
    if (typeof callback === 'function') {
      return super.get(key, options, callback);
    }
    if (options !== undefined) {
      return super.get(key, options);
    }
    return super.get(key);
  }
}

export const setup = async (
  dir: string,
  config: any,
  level?: MemoryLevel<string, Record<string, any>>
) => {
  const hasGraphQL = fs.existsSync(path.join(dir, 'query.gql'));
  const query = hasGraphQL
    ? await fs.readFile(path.join(dir, 'query.gql'), 'utf-8')
    : defaultQuery;
  if (!level) {
    level = new MemoryLevel<string, Record<string, any>>();
  }
  const bridge = new OutputBridge(dir, dir);
  const database = createDatabaseInternal({
    bridge,
    level,
    tinaDirectory: 'tina',
  });
  await database.indexContent(await buildSchema(config));
  const get = async (options?: {
    query: string;
    variables: Record<string, unknown>;
  }) => {
    const result = await resolve({
      database,
      query: options?.query || query,
      variables: options?.variables || {},
    });
    return result;
  };
  const put = async (input: any) => {
    const { _collection, _template, ...data } = input;
    await resolve({
      database,
      query: `mutation Update($params: DocumentUpdateMutation!) { updateDocument(collection: "post", relativePath: "in.md", params: $params) {...on Document{_values}} }`,
      variables: {
        params: { post: data },
      },
    });
  };
  return { get, put };
};

export const assertDoc = (doc: any) => {
  return z.object({ data: dataSchema, errors: z.any() }).parse(doc);
};

export const format = (data: any) => {
  return JSON.stringify(data, null, 2);
};
