import { it, expect } from 'vitest';
import { MemoryLevel } from 'memory-level';
import config from './tina/config';
import {
  buildSchema,
  createDatabaseInternal,
  FilesystemBridge,
  resolve,
} from '../../src';

// Bridge that throws on every write — simulates storage layer unavailable.
class FailingBridge extends FilesystemBridge {
  private writeAttempts: string[] = [];
  private deletes: string[] = [];

  async get(filepath: string): Promise<string> {
    return super.get(filepath);
  }

  async put(filepath: string, _data: string): Promise<void> {
    this.writeAttempts.push(filepath);
    throw new Error(`Simulated bridge.put failure for ${filepath}`);
  }

  async delete(filepath: string): Promise<void> {
    this.deletes.push(filepath);
  }

  getWriteAttempts(): string[] {
    return [...this.writeAttempts];
  }

  getDeletes(): string[] {
    return [...this.deletes];
  }
}

it('surfaces a structured error to the caller when bridge.put throws during a create mutation', async () => {
  const bridge = new FailingBridge(__dirname);
  const level = new MemoryLevel<string, Record<string, any>>();
  const database = createDatabaseInternal({
    bridge,
    level,
    tinaDirectory: 'tina',
  });
  await database.indexContent(await buildSchema(config));

  let thrown: unknown = null;
  let result: any = null;
  try {
    result = await resolve({
      database,
      query: `
        mutation {
          createDocument(
            collection: "author"
            relativePath: "alice.md"
            params: { author: { name: "Alice" } }
          ) {
            __typename
          }
        }
      `,
      variables: {},
    });
  } catch (err) {
    thrown = err;
  }

  const reported =
    thrown !== null || (result && result.errors && result.errors.length > 0);
  expect(reported).toBeTruthy();
  expect(bridge.getWriteAttempts().length).toBeGreaterThan(0);
});
