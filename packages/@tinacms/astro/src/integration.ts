import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration, AstroIntegrationLogger } from 'astro';

export interface TinaIntegrationOptions {
  middlewareOrder?: 'pre' | 'post';
}

export default function tina(
  options: TinaIntegrationOptions = {}
): AstroIntegration {
  const { middlewareOrder = 'pre' } = options;
  return {
    name: '@tinacms/astro',
    hooks: {
      'astro:config:setup': ({ addMiddleware, config, logger }) => {
        addMiddleware({
          entrypoint: '@tinacms/astro/middleware',
          order: middlewareOrder,
        });
        stageBridgeAsset(
          fileURLToPath(new URL('admin/', config.publicDir)),
          logger
        );
      },
    },
  };
}

// Copy the bridge bundle next to the admin SPA so it ships as a static asset
// (some adapters won't emit injected on-demand routes — e.g. @astrojs/vercel
// in static mode — and the bridge never varies per request).
function stageBridgeAsset(adminDir: string, logger: AstroIntegrationLogger) {
  try {
    const bridgeSrc = createRequire(import.meta.url).resolve('@tinacms/bridge');
    mkdirSync(adminDir, { recursive: true });
    copyFileSync(bridgeSrc, join(adminDir, 'bridge.js'));
  } catch (error) {
    logger.warn(
      `could not stage public/admin/bridge.js — visual editing will not load: ${error}`
    );
    return;
  }

  const gitignorePath = join(adminDir, '.gitignore');
  try {
    let lines: string[] = [];
    try {
      lines = readFileSync(gitignorePath, 'utf-8').split(/\r?\n/);
    } catch (error) {
      // A missing file is the normal first-run case; rethrow anything else
      // (e.g. EACCES) so we don't silently overwrite an unreadable file.
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    const entries = lines.map((l) => l.trim()).filter(Boolean);
    if (!entries.includes('bridge.js') && !entries.includes('*')) {
      writeFileSync(gitignorePath, `${[...entries, 'bridge.js'].join('\n')}\n`);
    }
  } catch (error) {
    logger.warn(`could not update public/admin/.gitignore: ${error}`);
  }
}
