import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runCodegen } from '../../../../cli/commands/codegen';
import { type ResolvedConfig, asResolvedConfig } from '../../../../config';
import { definePlugin } from '../../../../core/plugin';
import { tinaLocalDataLayerVitePlugin } from './local-data-layer.vite';

// The mock stands in for a tina/config.ts that throws a value which is not an
// Error. A module can throw a string, so the plugin must report either kind.
vi.mock('../../../../cli/commands/codegen', () => ({
  runCodegen: vi.fn(),
}));

vi.mock('../graphql/graphql-pipeline', () => ({
  createGraphQLPipeline: vi.fn(),
}));

let rootDir: string;

const config: ResolvedConfig = asResolvedConfig({
  plugins: [definePlugin({ name: 'test:content', provides: ['content'] })],
  schema: {
    collections: [
      {
        name: 'posts',
        path: 'content/posts',
        format: 'mdx',
        fields: [{ name: 'title', type: 'string', label: 'Title' }],
      },
    ],
  },
});

const serverDouble = () => {
  const logs: string[] = [];
  return {
    logs,
    middlewares: { use: () => undefined },
    config: { logger: { info: (message: string) => logs.push(message) } },
    transformIndexHtml: async (_url: string, html: string) => html,
  };
};

beforeEach(async () => {
  rootDir = await fs.mkdtemp(path.join(tmpdir(), 'tina-vite-codegen-'));
});

afterEach(async () => {
  vi.restoreAllMocks();
  await fs.rm(rootDir, { recursive: true, force: true });
});

const bootWith = async (rejection: unknown) => {
  vi.mocked(runCodegen).mockRejectedValue(rejection);
  const plugin = tinaLocalDataLayerVitePlugin({ rootDir, config });
  const server = serverDouble();
  (plugin.configureServer as (s: unknown) => void)(server);
  await vi.waitFor(() => expect(server.logs.length).toBeGreaterThan(0));
  return server;
};

describe('tinaLocalDataLayerVitePlugin codegen failure', () => {
  it('reports a failure that is an Error by its message', async () => {
    const server = await bootWith(new Error('the schema is broken'));
    expect(server.logs).toEqual([
      'tina: codegen failed — the schema is broken',
    ]);
  });

  it('reports a failure that is not an Error', async () => {
    const server = await bootWith('the config threw a string');
    expect(server.logs).toEqual([
      'tina: codegen failed — the config threw a string',
    ]);
  });
});
