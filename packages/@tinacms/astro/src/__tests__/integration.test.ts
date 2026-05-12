import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { AstroIntegration } from 'astro';
import { describe, expect, it, vi } from 'vitest';
import tina from '../integration';

type ConfigSetupHook = NonNullable<
  AstroIntegration['hooks']['astro:config:setup']
>;
type ConfigSetupArg = Parameters<ConfigSetupHook>[0];

function runConfigSetup(publicDir: string) {
  const addMiddleware = vi.fn();
  const logger = { warn: vi.fn(), info: vi.fn() };
  const hook = tina().hooks['astro:config:setup'] as ConfigSetupHook;
  hook({
    addMiddleware,
    config: { publicDir: pathToFileURL(publicDir + sep) },
    logger,
  } as unknown as ConfigSetupArg);
  return { addMiddleware, logger };
}

describe('tina() integration — astro:config:setup', () => {
  it('wires the middleware and stages public/admin/bridge.js', () => {
    const publicDir = mkdtempSync(join(tmpdir(), 'tina-public-'));
    const { addMiddleware, logger } = runConfigSetup(publicDir);

    expect(addMiddleware).toHaveBeenCalledWith({
      entrypoint: '@tinacms/astro/middleware',
      order: 'pre',
    });

    const bridgePath = join(publicDir, 'admin', 'bridge.js');
    expect(existsSync(bridgePath)).toBe(true);
    expect(readFileSync(bridgePath, 'utf-8').length).toBeGreaterThan(0);
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
