# Barebones v4 example

The smallest TinaCMS v4 app. One Vite project holds everything:

| Piece | File | v4 rule it shows |
|---|---|---|
| The content model | `tina/config.ts` | One declaration. The data layer and the forms both read it. |
| The pipeline | `vite.config.ts` | The project owns its pipeline. `pnpm dev` runs Vite; there is no `tinacms dev`. Tina mounts as one Vite plugin. |
| The admin | `public/admin/index.html` → `tina/admin.tsx` | Codegen scaffolds the shell in `public/` (the v3 shape, at the `build` folders from `defineConfig`), the entry, and `tina/admin.css` once. The admin serves on `/admin/` with no route of the project's own. After that, all three files belong to the project. |
| The site | `index.html` → `src/preview/` | Visual editing with `useTina`, `tinaField`, and `TinaMarkdown` from `@tinacms/tinacms/adapters/react`. The admin's preview pane renders this page. |
| A custom field | `tina/rating-field.tsx` | A whole field plugin in one `definePlugin({...})` call, in one project-owned file. The config registers it next to `localContentPlugin()`. |
| The content | `content/posts/*.mdx` | Files in the repository. A save in the admin writes them back to disk. |
| The lock | `tina/tina-lock.json` | Committed, not built (ADR-016). Dev refreshes it. |

A fresh project does not write these files by hand: `tinacms init` writes the
starter `tina/config.ts` and a first document, and the first `vite` run (or
`tinacms codegen`) generates the admin. All a project needs is `tinacms`, a
`tina/config.ts`, and the Vite plugin — then open `/admin/`.

## Run it

From the repository root:

```sh
pnpm install
pnpm --filter @examples/v4-barebones dev
```

Open the printed URL. The site renders at `/`, and the admin at `/admin/`
(dev codegen scaffolds `public/admin/index.html` once; the project commits
it). A schema change in `tina/config.ts` refreshes `tina/tina-lock.json` on
the next dev run or `pnpm codegen` — commit the lock.

## What is not real yet

The two node-side imports in `vite.config.ts` reach into the package source with
a relative path, because the alpha releases raw `.ts` through `exports`
(ADR-001) and node cannot follow its extensionless relative imports outside a
Vite module graph. Every browser-side import already uses the public specifiers
(`@tinacms/tinacms`, `/admin`, `/react`, `/adapters/react`) resolved through
`node_modules`, exactly as an installed app would. The `@source` lines in
`tina/admin.css` exist for the same reason: Tailwind must scan the package
sources until the dist build lands.
