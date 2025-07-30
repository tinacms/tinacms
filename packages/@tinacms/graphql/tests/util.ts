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

class MemoryCaptureBridge extends FilesystemBridge {
  private writes: Map<string, string> = new Map();

  // Read operations continue to use filesystem
  async get(filepath: string): Promise<string> {
    return super.get(filepath);
  }

  // Write operations are captured in memory
  async put(filepath: string, data: string): Promise<void> {
    this.writes.set(filepath, data);
  }

  // Test utilities to access captured writes
  getWrites(): Map<string, string> {
    return new Map(this.writes);
  }

  getWrite(filepath: string): string | undefined {
    return this.writes.get(filepath);
  }
}

const dataSchema = z.object({
  document: z.object({
    _sys: z.object({ title: z.string() }),
    _values: z.record(z.unknown()),
  }),
});

const defaultQuery = `query { document(collection: "post", relativePath: "in.md") { ...on Document { _values, _sys { title } }} }`;

export const setup = async (dir: string, config: any) => {
  const hasGraphQL = await fs.existsSync(path.join(dir, 'query.gql'));
  const query = hasGraphQL
    ? await fs.readFile(path.join(dir, 'query.gql'), 'utf-8')
    : defaultQuery;
  const bridge = new OutputBridge(dir, dir);
  const level = new MemoryLevel<string, Record<string, any>>();
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

export const setupMutation = async (dir: string, config: any) => {
  const bridge = new MemoryCaptureBridge(dir);
  const level = new MemoryLevel<string, Record<string, any>>();
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
      query: options?.query || defaultQuery,
      variables: options?.variables || {},
    });
    return result;
  };

  return { get, bridge };
};

export const loadVariables = async (
  dir: string,
  filename = 'variables.json'
) => {
  const variablesPath = path.join(dir, filename);
  if (await fs.pathExists(variablesPath)) {
    return JSON.parse(await fs.readFile(variablesPath, 'utf-8'));
  }
  return {};
};

export const format = (data: any) => {
  return JSON.stringify(data, null, 2);
};
