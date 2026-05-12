/**
 * Tina Astro integration. Wires the middleware that exposes
 * `Astro.locals.tinaEdit` so pages and components can branch on edit
 * context without writing `src/middleware.ts` themselves.
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
      'astro:config:setup': ({ addMiddleware, injectRoute }) => {
        addMiddleware({
          entrypoint: '@tinacms/astro/middleware',
          order: middlewareOrder,
        });
        // Edit-mode pages reference `<script type="module" src="/_tina/bridge.js">`;
        // this route serves the bundled bridge. Forced `prerender: true` so it's
        // emitted as a static file — works on `output: 'static'` deployments where
        // an on-demand route would need a serverless function the static host
        // doesn't deploy. Production pages never reference it.
        injectRoute({
          pattern: '/_tina/bridge.js',
          entrypoint: '@tinacms/astro/bridge-route',
          prerender: true,
        });
      },
    },
  };
}
