# Deploying to GitHub Pages with TinaCloud

GitHub Pages only serves files. That's enough here, because nothing in the
deployed site needs Vite or a server:

```
editor's browser                      TinaCloud                  GitHub repo
/admin (static app) ──GraphQL/auth──▶ reads & writes content ──commit──▶ main
                                                                          │
visitors ◀── GitHub Pages ◀── prerendered HTML ◀── GitHub Action rebuild ─┘
```

- SvelteKit runs only at **build time**, inside the GitHub Action, and outputs
  plain HTML/JS/CSS.
- `tinacms build` (without `--local`) compiles the **admin** into static files.
  It talks to TinaCloud from the editor's browser.
- **Saving** in the admin commits to the repo. The push triggers the workflow,
  which rebuilds and redeploys. Changes go live after the build, usually 1–3
  minutes.

## What works where

| | Local `pnpm dev` | GitHub Pages |
|---|---|---|
| Public site | Yes | Yes (prerendered) |
| Tina admin, edit and save | Yes (local files) | Yes (TinaCloud, commits to GitHub) |
| Live preview while typing | Yes | **No** |
| Click-to-edit in the preview | Yes | **No** |

Live preview depends on a server: `tinaHandle` injects each page's form
payload, and the island endpoint re-renders edited regions. Pages has neither.
In production, editors use the form editor and see changes after the rebuild.
Use `pnpm dev` when you want live preview. A browser-only preview mode for
static hosts is a possible future package feature.

## One-time setup

### 1. TinaCloud project

1. Sign in at <https://app.tina.io> and create a project connected to your
   GitHub fork.
2. In the project configuration, set **Path to Tina** to
   `examples/sveltekit/kitchen-sink`, so TinaCloud finds `tina/` in the
   monorepo.
3. Add your Pages URL (`https://<user>.github.io`) under **Site URLs** so the
   admin is allowed to log in from it.
4. Copy the **Client ID**, and create a read-only **Token** under Tokens.

> **Check this first.** The example reads content from `examples/shared` via
> `localContentPath`, which Tina documents for a separate content repository.
> TinaCloud may not index content that sits outside the Tina folder in the
> same repo. If indexing fails, or the admin shows empty collections, either
> move the content into this example (drop `localContentPath`) or connect
> TinaCloud to a separate content repo. This setup hasn't been tested
> against TinaCloud yet.

### 2. GitHub repository settings

1. **Settings → Pages → Source:** choose **GitHub Actions**.
2. **Settings → Secrets and variables → Actions:**
   - Variable `TINA_CLIENT_ID`: the Client ID.
   - Secret `TINA_TOKEN`: the read-only token.

### 3. Workflow

The workflow lives in this example at
[`.github/workflows/github-pages.yml`](.github/workflows/github-pages.yml).
GitHub only runs workflows from the **repository root**, so inside the monorepo
copy it there and push to `main`:

```sh
# from the monorepo root
cp examples/sveltekit/kitchen-sink/.github/workflows/github-pages.yml \
   .github/workflows/sveltekit-pages.yml
```

The upstream TinaCMS workflows in the fork's root `.github/workflows/` will also
run on your pushes. Disable the ones you don't need (especially `publish.yml`)
in the Actions tab.

The workflow:

1. installs the workspace and builds the TinaCMS packages (the example uses
   them through `workspace:*`);
2. reads the Pages base path from `actions/configure-pages`;
3. runs `pnpm build:pages` with `BASE_PATH`, `TINA_CLIENT_ID`, `TINA_TOKEN` and
   the branch name;
4. uploads `build-static/` and deploys it. Pull requests only build.

The admin will then be at `https://<user>.github.io/<repo>/admin/index.html`.

## How the build handles GitHub Pages

- **Base path.** Project pages are served under `/<repo>/`.
  `actions/configure-pages` outputs that path, but it only patches a
  `svelte.config.js`. SvelteKit 3 keeps its config in `vite.config.ts`, so the
  workflow passes the path as `BASE_PATH` instead:
  - `vite.config.ts` sets `paths.base` from it.
  - `tina/config.ts` sets `build.basePath` from it, so the admin's own assets
    resolve.
  - App links and CMS URLs go through `withBase()` in `src/lib/utils.ts`.
    `sanitizeHref` and `sanitizeImageSrc` call it for root-relative paths.
    Rich-text links and images use the `a` and `img` overrides in
    `src/lib/components/markdown/`.
  - SvelteKit's prerenderer fails the build if any page links outside the
    base, so a missed link shows up in CI, not in production.
- **`build:pages` vs `build:static`.** Both use `adapter-static` and write to
  `build-static/`:
  - `build:pages` builds against TinaCloud and keeps the admin.
  - `build:static` builds from local files (`--local`) and removes the admin,
    for public-only hosting.
- **404s.** `adapter-static` writes `404.html`, which GitHub Pages serves for
  unknown URLs.
- **Island endpoint.** `/tina-island/[name]` is a POST endpoint, so it isn't
  generated for static output (`strict: false` allows that). It's only used
  by the Node build.

## Trying it locally

```sh
# Same output as CI, built against local content (no TinaCloud needed):
BASE_PATH=/my-repo pnpm build:static
# Check that no URL is missing the base path (should print nothing):
grep -ohE '(href|src)="/[^"]*"' build-static/*.html | grep -v '"/my-repo'

# Against TinaCloud, like CI:
BASE_PATH=/my-repo TINA_CLIENT_ID=... TINA_TOKEN=... pnpm build:pages
```

`pnpm preview:static` serves from the root, so a build with a base path won't
resolve there. Build without `BASE_PATH` to preview locally.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Build: `prerender_path_outside_base` | A link or image skips `withBase()`/the sanitizers; the error names the page and URL |
| Build: TinaCloud schema or branch error | `GITHUB_BRANCH` isn't indexed in TinaCloud yet, or `tina-lock.json` is stale. Run `pnpm dev` locally once and commit `tina/tina-lock.json` |
| Admin loads but login fails | The Pages URL is missing from TinaCloud **Site URLs** |
| Admin shows no documents | Content isn't indexed; see the note in step 1 |
| Site is unstyled or assets 404 | The build ran without `BASE_PATH` but is served under `/<repo>/` |
| Edits saved but site unchanged | Check the Actions tab; the rebuild takes a few minutes |
