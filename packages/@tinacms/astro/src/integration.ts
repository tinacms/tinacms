/**
 * Tina Astro integration. Two jobs:
 *
 * 1. Wires the request-scoped middleware that exposes `Astro.locals.tinaEdit`
 *    (and, on edit-mode SSR responses, splices the bridge bootstrap + form
 *    payloads) so pages and components branch on edit context without writing
 *    `src/middleware.ts` themselves.
 * 2. Copies the vanilla-JS bridge bundle into `public/admin/bridge.js` so it
 *    ships as a plain static asset next to the admin UI. (It used to be served
 *    by an injected `/_tina/bridge.js` route, but an injected on-demand route
 *    isn't given a Build Output route entry by some adapters — e.g.
 *    `@astrojs/vercel` in static mode — so it 404'd. The bridge never varies
 *    per request, so a static file is both simpler and more portable. The
 *    admin lives at `/admin/`, which every deploy already serves correctly.)
 *
 * Usage:
 *
 * ```ts
 * // astro.config.mjs
 * import { defineConfig } from 'astro/config';
 * import tina from '@tinacms/astro/integration';
 *
 * export default defineConfig({
 *   integrations: [tina()],
 * });
 * ```
 */
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

export interface TinaIntegrationOptions {
  /** Override the middleware ordering relative to other integrations.
   *  Defaults to `'pre'` so `Astro.locals.tinaEdit` is populated before
   *  user middleware sees the request. */
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

        // Stage the bridge bundle as `public/admin/bridge.js` → served at
        // `/admin/bridge.js`, which the bootstrap (`@tinacms/astro/TinaIsland`)
        // and the middleware reference. The build script runs `tinacms build`
        // (which populates `public/admin/`) before `astro build` triggers this
        // hook, so this write lands on top and is copied into the output;
        // `astro dev` serves `public/` so it's live in dev too.
        try {
          const bridgeSrc = createRequire(import.meta.url).resolve(
            '@tinacms/bridge'
          );
          const adminDir = fileURLToPath(new URL('admin/', config.publicDir));
          mkdirSync(adminDir, { recursive: true });
          copyFileSync(bridgeSrc, join(adminDir, 'bridge.js'));
        } catch (error) {
          logger.warn(
            `could not stage public/admin/bridge.js — visual editing will not load: ${error}`
          );
        }
      },
    },
  };
}
