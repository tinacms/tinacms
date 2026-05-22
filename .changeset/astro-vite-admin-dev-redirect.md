---
"@tinacms/astro": minor
---

Add `tinaAdminDevRedirect` Vite plugin (`@tinacms/astro/vite`)

A dev-only Vite plugin that redirects `/admin` (and `/admin/`) to `/admin/index.html`. During `astro dev` the admin SPA is served from `public/admin/` and Vite does not resolve a directory index for it, so a bare `/admin` request 404s. Add the plugin to make `/admin` land on the SPA the same way it does in a production build:

```js
// astro.config.mjs
import { tinaAdminDevRedirect } from '@tinacms/astro/vite';

export default defineConfig({
  vite: { plugins: [tinaAdminDevRedirect()] },
});
```

The plugin only applies to the dev server (`apply: 'serve'`); a built site serves `public/admin/index.html` itself.
