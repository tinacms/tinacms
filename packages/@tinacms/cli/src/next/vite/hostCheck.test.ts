// The unit tests in devServerUrl.test.ts only assert the shape of what
// `getAllowedHosts` returns. This suite feeds that value to a real Vite dev
// server and checks how Vite's own host check answers, because the value is
// only useful if Vite accepts it. The first case pins the default we depend
// on: with no `server.url`, Vite 403s a non-localhost Host before the request
// ever reaches the SPA or /graphql. A Vite upgrade that moves either of those
// behaviours should fail here rather than in someone's container.

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import type { ConfigManager } from '../config-manager';
import { getAllowedHosts } from './devServerUrl';

const PROBE = path.join(__dirname, '__fixtures__', 'host-check-probe.mjs');
const DEV_HOST = 'mycontainer.test';

const stub = (url?: string) =>
  ({
    config: { server: url ? { url } : undefined },
  }) as unknown as ConfigManager;

function probe(allowedHosts: (string | RegExp)[], hostHeader: string) {
  const result = spawnSync(
    process.execPath,
    [PROBE, JSON.stringify(allowedHosts), hostHeader],
    { encoding: 'utf-8', timeout: 60000 }
  );
  if (result.status !== 0) {
    throw new Error(`probe failed (${result.status}): ${result.stderr}`);
  }
  return JSON.parse(result.stdout) as { status: number; body: string };
}

describe('getAllowedHosts against a real Vite server', () => {
  jest.setTimeout(90000);

  it('is 403ed by Vite when server.url is unset', () => {
    const res = probe(getAllowedHosts(stub()), DEV_HOST);

    expect(res.status).toBe(403);
    expect(res.body).toContain('is not allowed');
  });

  it('is served once server.url names the host', () => {
    const res = probe(
      getAllowedHosts(stub(`http://${DEV_HOST}:4001`)),
      DEV_HOST
    );

    expect(res.status).not.toBe(403);
  });

  it('still 403s a host other than the configured one', () => {
    const res = probe(
      getAllowedHosts(stub(`http://${DEV_HOST}:4001`)),
      'evil.test'
    );

    expect(res.status).toBe(403);
  });
});
