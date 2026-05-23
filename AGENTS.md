# TinaCMS Monorepo

## Project Overview

TinaCMS is an open-source headless CMS with visual editing. This monorepo contains the core packages, CLI, admin app, and framework example apps.

## Security & Disclosure

This repo has a public security policy at [`SECURITY.md`](SECURITY.md). Read it before touching code that could surface a vulnerability (auth, media routes, path handling, GraphQL resolvers, anything that accepts untrusted input).

**Hard rules:**

- **Never file security vulnerabilities as public GitHub issues.** Reports go to `security@tina.io`, or as a draft GitHub Security Advisory. Public issues are explicitly forbidden by `SECURITY.md`, regardless of severity.
- **Never put bug specifics in test comments, PR descriptions, or commit messages.** That's public disclosure by a different name. If a test guards against a known-broken behaviour, use neutral wording (e.g. *"Pending upstream fix reported privately per SECURITY.md"*) and keep the internals — error messages, stack traces, affected function names, response-body specifics — out of the comment.
- **Don't commit, push, or draft a public issue if you find a potential vulnerability.** Stop, tell the user what you found and where, and let them decide the disclosure path (email, draft advisory, or public if they judge it's truly benign).

**Scope of the above rules:** every surface an agent might modify — source files, test files, inline comments, commit messages, PR descriptions, linked issue drafts, README snippets.

When writing regression tests that guard against a quietly-reported finding, mark the specific case with `test.fixme` (Playwright) or the framework equivalent, use a generic "pending upstream fix" message, and put the detail in a private channel only.

## Monorepo Structure

```
packages/              # Core packages (tinacms, tinacms-authjs, create-tina-app, etc.)
packages/@tinacms/     # Scoped packages (cli, app, datalayer, graphql, mdx, scripts, etc.)
examples/              # Framework example apps
  next/kitchen-sink/   # Next.js 15 — the reference kitchen-sink implementation
  next/tina-self-hosted-demo/ # Self-hosted with auth
  astro/kitchen-sink/  # Astro 5 — mirrors Next.js kitchen-sink
  hugo/kitchen-sink/   # Hugo kitchen-sink
  react/kitchen-sink/  # React kitchen-sink
  shared/              # Shared content and public assets across kitchen-sink examples
playwright/            # Playwright test infrastructure
scripts/               # Repo maintenance scripts
tests/                 # Build verification tests
```

## Build & Dev Commands

- **Install:** `pnpm install` (from repo root)
- **Build core packages:** `pnpm build` (runs `turbo run build --filter="./packages/**"`)
- **Watch mode:** `pnpm dev` (builds then watches via `@tinacms/scripts`)
- **Test:** `pnpm test` (runs `turbo run test --filter="./packages/**"`)
- **Example apps:** Each has its own `dev`, `build`, `build:local` scripts — check the example's `package.json`

## Workspace Configuration

- `pnpm-workspace.yaml` defines workspace packages and a `catalog:` section for shared dependency versions
- Example apps use `workspace:*` to reference local TinaCMS packages
- `turbo.json` defines build/test/types task dependencies

## Coding Standards

- **Linting/Formatting:** Biome (`biome.json` at root). Example apps extend with `"extends": ["../../../biome.json"]`
- **TypeScript:** Base config at `base.tsconfig.json`. Examples extend it. Strict mode enabled.
- **Package manager:** pnpm only. Never use npm or yarn.
- **`CLAUDE.md` files** are git symlinks to the sibling `AGENTS.md`. On Windows without Developer Mode, if `git status` shows `TT` typechanges on them, run `git config --local core.symlinks false` — git then materialises them as regular pointer files. Linux/macOS clones get real symlinks automatically.

## Kitchen-Sink Examples

All kitchen-sink examples implement the **same content model** to demonstrate identical functionality across frameworks. `examples/next/kitchen-sink/` is the reference implementation.

### Unified Content Schema

| Collection | Format | Content Path | Collection File |
|------------|--------|-------------|-----------------|
| Tag | JSON | `content/tags/` | `tina/collections/tag.ts` |
| Author | MD | `content/authors/` | `tina/collections/author.tsx` |
| Post | MDX | `content/posts/` | `tina/collections/post.tsx` |
| Blog | MDX | `content/blogs/` | `tina/collections/blog.tsx` |
| Page | MDX | `content/pages/` | `tina/collections/page.tsx` |
| Global | JSON | `content/global/` | `tina/collections/global.ts` |

Note: `.tsx` collection files contain JSX for custom field components (e.g., ColorPickerInput in `global.ts` theme field). `.ts` files are pure schema definitions. This applies across all kitchen-sink examples.

### Shared Patterns Across Kitchen-Sink Apps

- TinaCMS wraps the framework dev server: `tinacms dev -c "<framework dev>"`
- Build order: `tinacms build && <framework build>`
- Content lives in `content/` with identical MDX/JSON files across examples
- Tina config at `tina/config.tsx` with collections in `tina/collections/`
- Admin UI output to `public/admin/`
- Media root: `uploads/` within `public/`

### Standardized Stack

| Tool | Choice |
|------|--------|
| Package Manager | pnpm (workspace-native) |
| Linting/Formatting | Biome (extends root config) |
| Styling | Tailwind CSS 4 (CSS-first config) |
| TypeScript | 5.7+ strict (extends `base.tsconfig.json`) |

## Issue Triage & Labels

This repo uses a fixed label taxonomy for backlog organisation. When filing or triaging issues, apply exactly **one primary category label** plus any program/scope labels that apply.

### Primary category labels

Pick the most specific that fits:

| Label | Use for |
|---|---|
| `bug` | Broken behavior, error, crash, wrong output |
| `enhancement` | Feature request, new capability |
| `security` | Vulnerabilities, code-scanning alerts (file privately first per SECURITY.md) |
| `documentation` | Docs, READMEs, guides |
| `technical-debt` | Refactor, dead code, architectural cleanup |
| `chore` | Dep bumps, config, build, CI, scaffolding |
| `tests` | Adding or expanding test coverage |
| `perf` | Slow, scale, throughput, memory |
| `dx` | Developer-facing CLI / errors / logging |
| `ux` | Visual, UX, layout, copy, animation |
| `rich-text` | Plate, MDX, markdown rendering, body field, embed templates |
| `form-system` | Form fields, validation, dirty state, field plugins |
| `media` | Media library, upload, browse |
| `starter-template` | create-tina-app, Astro/Next/Hugo starters |
| `self-hosted` | Self-hosted setup, externalization, database, sqlite-level |
| `editorial-workflow` | Branches, PRs, protected-branch flow |

### Program / scope labels (apply alongside primary)

- `v4` — part of the v4 architectural rewrite (epics #6830–#6837)
- `For 4.1` — scheduled for the 4.1 release window
- `Pre 4.0` — must land before v4 ships
- `onboarding` — small, well-scoped task suitable for developers new to the project
- `🤖AI` — could be implemented end-to-end by an AI agent in a single prompt

### Triage rules

- **Taxonomy is fixed.** Don't invent new category labels. If nothing fits, leave the label off and surface the issue for human triage.
- **Don't apply `onboarding` or `🤖AI` to v4-program issues** — those are intentionally coordinated work.
- **Closing an issue:** always link evidence (PR number, comment URL, "fixed in version X.Y") in the closing comment. If the issue is a meta-tracker blocked on a parent epic, leave a "Triage note — do not close" comment instead.
- **Re-test pings:** when the linked PR has merged but no one has confirmed the fix sticks, comment asking the original reporter to verify on the current setup before closing.

### Useful filter URLs

- Onboarding: <https://github.com/tinacms/tinacms/labels/onboarding>
- AI-doable (one prompt): <https://github.com/tinacms/tinacms/labels/%F0%9F%A4%96AI>
- v4 program: <https://github.com/tinacms/tinacms/labels/v4> · <https://github.com/tinacms/tinacms/labels/For%204.1> · <https://github.com/tinacms/tinacms/labels/Pre%204.0>
