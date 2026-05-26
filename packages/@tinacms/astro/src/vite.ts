import type { Plugin } from 'vite';

/**
 * Dev-only Vite plugin that redirects `/admin` (and `/admin/`) to
 * `/admin/index.html`.
 *
 * In `astro dev`, the admin SPA is served straight from `public/admin/` and
 * Vite does not resolve a directory index for it, so a bare `/admin` request
 * 404s. This plugin makes `/admin` land on the SPA the same way it does in a
 * production build. It only applies to the dev server (`apply: 'serve'`); a
 * built site serves `public/admin/index.html` itself.
 *
 * @example
 * // astro.config.mjs
 * import { tinaAdminDevRedirect } from '@tinacms/astro/vite';
 *
 * export default defineConfig({
 *   vite: { plugins: [tinaAdminDevRedirect()] },
 * });
 */
export function tinaAdminDevRedirect(): Plugin {
  return {
    name: 'tina-admin-dev-redirect',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url || '').split('?')[0];
        if (path === '/admin' || path === '/admin/') {
          res.statusCode = 302;
          res.setHeader('Location', '/admin/index.html');
          res.end();
          return;
        }
        next();
      });
    },
  };
}

export default tinaAdminDevRedirect;
