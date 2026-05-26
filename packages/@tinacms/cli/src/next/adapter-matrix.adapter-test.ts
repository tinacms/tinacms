// Parameterised regression: prove that every supported database adapter can be
// loaded by `ConfigManager.loadDatabaseFile()` (the same code path `tinacms
// dev`/`build` use to bring up a self-hosted database) and round-trip a value.
//
// CI runs each adapter in its own matrix job via ADAPTER=<name>. Locally, run
// without ADAPTER to exercise everything except mongodb-level (which requires
// MONGO_URI), or set ADAPTER explicitly.
//
// Cache + fixtures stay inside the CLI package tree (not os.tmpdir()) so that
// Node's module resolution can walk up to monorepo node_modules and resolve
// externalised dependencies like better-sqlite3.

import * as path from 'path';
import { once } from 'events';
import type { Server } from 'net';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

import { ConfigManager } from './config-manager';
import { createDBServer } from './database';

// Hook + test timeout. Long enough for the tina-level-client esbuild cold
// start. Applied per-hook below so this file doesn't need @jest/globals
// under Jest's ESM mode just for `jest.setTimeout()`.
const HOOK_TIMEOUT = 30000;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_ROOT = path.join(HERE, '__fixtures__');
const CACHE_BASE = path.join(HERE, '.test-adapter-cache');

type AdapterKind = 'level' | 'tina-client';

type Adapter = {
  name: string;
  kind: AdapterKind;
};

const adapters: Adapter[] = [
  { name: 'memory-level', kind: 'level' },
  { name: 'sqlite-level', kind: 'level' },
  { name: 'mongodb-level', kind: 'level' },
  { name: 'tina-level-client', kind: 'tina-client' },
];

const only = process.env.ADAPTER;
if (only && !adapters.some((adapter) => adapter.name === only)) {
  throw new Error(
    `Unknown ADAPTER "${only}". Expected one of: ${adapters
      .map((adapter) => adapter.name)
      .join(', ')}`
  );
}

// In CI, ADAPTER is always explicit, so mongodb-level still requires MONGO_URI.
// For local run-all mode, skip mongodb-level unless MONGO_URI is available.
const adaptersToRun: Adapter[] = only
  ? adapters.filter((adapter) => adapter.name === only)
  : adapters.filter(
      (adapter) => adapter.name !== 'mongodb-level' || !!process.env.MONGO_URI
    );

describe.each(adaptersToRun)(
  'ConfigManager.loadDatabaseFile() — $name',
  (adapter) => {
    let cacheDir: string | undefined;
    let server: Server | undefined;
    let result: any;

    beforeAll(async () => {
      if (adapter.name === 'mongodb-level' && !process.env.MONGO_URI) {
        throw new Error(
          'MONGO_URI is required to run the mongodb-level adapter test. ' +
            'Set MONGO_URI to a reachable MongoDB instance (e.g. ' +
            'MONGO_URI=mongodb://localhost:27017). CI provides this via a ' +
            'MongoDB service container.'
        );
      }

      cacheDir = path.join(CACHE_BASE, adapter.name);
      await fs.remove(cacheDir);
      await fs.ensureDir(cacheDir);

      if (adapter.kind === 'tina-client') {
        server = createDBServer(0);
        await once(server, 'listening');
        const address = server.address();
        if (typeof address !== 'object' || address === null) {
          throw new Error(
            `Expected AddressInfo from server.address(), got ${String(address)}`
          );
        }
        process.env.TEST_DATALAYER_PORT = String(address.port);
      }

      const configManager = new ConfigManager({ rootPath: process.cwd() });
      // loadDatabaseFile() only needs these three fields populated. We bypass
      // processConfig() because we are not exercising config-file discovery,
      // only the database-file build + import pipeline.
      configManager.config = { build: {} } as any;
      configManager.generatedCachePath = cacheDir;
      configManager.selfHostedDatabaseFilePath = path.join(
        FIXTURES_ROOT,
        adapter.name,
        'database.ts'
      );

      result = await configManager.loadDatabaseFile();
    }, HOOK_TIMEOUT);

    afterAll(async () => {
      if (adapter.kind === 'level') {
        if (result && typeof result.close === 'function') {
          await result.close();
        }
      } else {
        // tina-level-client: close BOTH ends or the Jest worker never
        // exits — the client socket and the listener each hold the event
        // loop independently.
        if (result?.rootLevel?.close) {
          // rootLevel is a LevelProxy over TinaLevelClient; .close()
          // forwards to AbstractLevel#close and severs the client socket.
          await result.rootLevel.close().catch(() => undefined);
        }
        if (server) {
          const handle = server;
          // Drop still-attached peer sockets so the listener can exit.
          if (typeof (handle as any).closeAllConnections === 'function') {
            (handle as any).closeAllConnections();
          }
          await new Promise<void>((resolve, reject) => {
            handle.close((err) => (err ? reject(err) : resolve()));
          });
        }
        delete process.env.TEST_DATALAYER_PORT;
      }
      if (cacheDir) {
        await fs.remove(cacheDir).catch(() => undefined);
      }
    }, HOOK_TIMEOUT);

    test(
      'round-trips a value through the adapter',
      async () => {
        if (adapter.kind === 'level') {
          if (typeof result.open === 'function') {
            await result.open();
          }
          await result.put('test-key', 'test-value');
          expect(await result.get('test-key')).toBe('test-value');
        } else {
          await result.setMetadata('probe', 'pong');
          expect(await result.getMetadata('probe')).toBe('pong');
        }
      },
      HOOK_TIMEOUT
    );
  }
);
