import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
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
    // .gitignore created with the bridge entry.
    expect(readFileSync(join(publicDir, 'admin', '.gitignore'), 'utf-8')).toBe(
      'bridge.js\n'
    );
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('appends bridge.js to an existing admin/.gitignore, idempotently', () => {
    const publicDir = mkdtempSync(join(tmpdir(), 'tina-public-'));
    const adminDir = join(publicDir, 'admin');
    mkdirSync(adminDir, { recursive: true });
    // Mirrors what `tinacms build` writes.
    writeFileSync(join(adminDir, '.gitignore'), 'index.html\nassets/');

    runConfigSetup(publicDir);
    expect(readFileSync(join(adminDir, '.gitignore'), 'utf-8')).toBe(
      'index.html\nassets/\nbridge.js\n'
    );

    runConfigSetup(publicDir);
    expect(readFileSync(join(adminDir, '.gitignore'), 'utf-8')).toBe(
      'index.html\nassets/\nbridge.js\n'
    );
  });
});
