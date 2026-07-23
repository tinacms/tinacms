# prebuilt-admin

The repo's first Playwright suite that runs against a **production `tinacms build`
output** instead of `tinacms dev`. It is driven by a deliberately hostile fixture
config so that a browser-only, production-only regression in the admin bundle
fails here instead of slipping through CI.

Green on `main` today is the baseline. Issue #7243 will rerun this identical
suite with the prebuilt flag on; the specs are written to be **mode-agnostic**.

## How the webServer works

`pnpm serve:prod` runs:

```
tinacms build --local --skip-cloud-checks --noTelemetry -c "node serve-admin.mjs"
```

1. `tinacms build --local` builds the **production** admin SPA into
   `public/admin/` (minified vite build — the same output a real deploy ships)
   **and** keeps a local GraphQL + media server alive on `:4001`.
2. The `-c` sub-command starts `serve-admin.mjs`, a tiny static server that
   serves the built SPA under `/my-site/admin/` on `:3000`.

The browser loads the production bundle from `:3000`; the admin queries the API
cross-origin on `:4001` (localhost origins are CORS-allowed by the dev server).
Playwright waits for `http://localhost:3000/my-site/admin/` before running.

### Why `contentApiUrlOverride` is set

`tinacms build` bakes `codegen.productionUrl` (the TinaCloud content URL) into
the SPA **regardless of `--local`** — `--local` only affects the generated
client SDK and runs a local server for build-time indexing. Without an override
the admin would point at `https://content.tinajs.io/...` (with this fixture's
empty clientId/branch that URL is even malformed and the admin crashes on boot).
Setting `contentApiUrlOverride: 'http://localhost:4001/graphql'` redirects the
baked SPA at the local server. This diverges from the issue brief's assumption
that "in local mode the baked apiUrl points at the local GraphQL server"; it
does not, and the override is the fix.

## The hostile fixture (seven ingredients)

Each guards a class of production-only bundling bug. `e2e/setup.spec.ts` greps
the built chunks to prove they actually reached the bundle (guards against an
accidentally-tame fixture).

| Ingredient | Where |
|---|---|
| Custom field component colocated with the schema | `tina/fields/fixture-field.tsx` |
| Component importing `next/image` (CJS `require('react')`) | `tina/fields/fixture-field.tsx` |
| Arbitrary Tailwind class `aspect-w-9` + themed `bg-blue-500` | `tina/fields/fixture-field.tsx` |
| Real `media.loadCustomStore` via dynamic `import()` | `tina/media/fixture-media-store.ts` |
| `UsernamePasswordAuthJSProvider` from `tinacms-authjs/dist/tinacms` | `tina/config.tsx` |
| `cmsCallback` registering a screen plugin | `tina/config.tsx` |
| `build.basePath: 'my-site'` | `tina/config.tsx` |

The auth provider is selected at runtime: `window.__TINA_FIXTURE_AUTHJS__`
(set by `auth.spec` before boot) activates `UsernamePasswordAuthJSProvider` so
its custom login screen renders; every other spec boots the local provider and
clicks through the "Enter Edit Mode" dialog. Both providers are referenced so
the bundler keeps `tinacms-authjs` (and its CJS `next-auth/react`) in the build
either way.

## Specs

- `boot.spec` — collection list renders; single React reconciler; zero console errors on boot
- `custom-field.spec` — custom field renders and a save round-trips to disk
- `tailwind.spec` — `bg-blue-500` computes to Tina's `rgb(0, 132, 255)`; `aspect-w-9` compiled
- `basepath.spec` — admin boots at `/my-site/admin/` **and** the bare `/my-site/admin`
- `media.spec` — media manager lists via the custom store
- `auth.spec` — the custom AuthJS login screen appears
- `setup.spec` — meta-assertion: the CJS module + custom store are present in the built chunks

## Running locally

```
pnpm install          # from repo root
pnpm build            # build the workspace packages the fixture consumes
cd playwright/prebuilt-admin
npx playwright install chromium
npx playwright test
```
