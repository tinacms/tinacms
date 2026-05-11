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
        // The middleware splices a `<script type="module" src="/_tina/bridge.js">`
        // into edit-mode pages. This route serves the bundled bridge.
        // Production pages never reference it (the script tag isn't injected).
        injectRoute({
          pattern: '/_tina/bridge.js',
          entrypoint: '@tinacms/astro/bridge-route',
        });
      },
    },
  };
}
