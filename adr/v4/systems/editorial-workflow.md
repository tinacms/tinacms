# Editorial Workflow

> **Canonical sources:** [ADR-004](../004-git-editorial-workflow.md) (amended by ADR-007), [ADR-007](../007-full-stack-plugins-client-backend-segments.md); [CONTEXT.md](../CONTEXT.md) (Data Layer, TinaCloud, Backend).

The editorial workflow is **git-based** — branches for in-progress work, PRs for review, merge to main to publish. The shape of the workflow is unchanged from ADR-004; the **location** of the git operations changed.

## Who runs git

| Operation | Where it runs (v4) | Reason |
|---|---|---|
| `git checkout -b cms/foo` | **Inside the Data Layer** | TinaCloud's sync engine; a self-hosted Data Layer's git wrapper |
| Commit a saved document | **Inside the Data Layer** | same |
| Open a publish PR | **Inside the Data Layer** (or via a plugin's server segment that wraps `git` + GitHub API) | same |
| `git push` | **Inside the Data Layer** | same |

The **Admin UI never runs `git`** and never shells out commands. It calls **branch/publish operations on the `content` capability** (or a workflow plugin's server segment) via GraphQL or Capability RPC. ([ADR-004 amendment](../004-git-editorial-workflow.md))

That move removes:
- The shared-working-tree concurrency problem of multiple editors on the same checkout.
- The shell-injection surface of `exec('git ' + branchName)` in the client.

## The workflow

```
1. Editor opens Admin UI on branch  ─────────────►  Data Layer reads content from branch
2. Editor edits document  ───────────────────────►  Save (GraphQL mutation) → Data Layer
                                                    writes the file + commits on branch
3. Editor clicks "Publish"  ─────────────────────►  Data Layer opens PR (or workflow plugin
                                                    server segment does)
4. Reviewer approves PR on GitHub/GitLab
5. PR merges to main  ───────────────────────────►  Site builds and deploys from main
```

Steps 1–3 are all **content-capability operations** as far as the Admin UI is concerned. Whether they're implemented by TinaCloud's sync engine, a self-hosted Data Layer's git wrapper, or a custom plugin server segment is invisible to the UI.

## Branch state in the store

The store has a core **branch slice** (provided by Tina core, not a plugin):

```ts
useTinaStore((s) => s.branch.current)        // 'cms/new-blog-post'
useTinaStore((s) => s.branch.list)           // ['main', 'cms/new-post', ...]
useTinaStore((s) => s.branch.dirty)          // true if there are unsaved/uncommitted changes
```

Actions are slice methods that call the Data Layer:

```ts
const { create, switchTo, requestPublish, discard } = useTinaStore((s) => s.branch)

await create('cms/new-post')
await switchTo('main')
await requestPublish()        // calls into the content capability or the workflow plugin
```

## Authoring the workflow as a plugin

A user can replace or augment the default workflow by writing a plugin. The example in [Custom Plugins](../plugins/custom-plugins.md#worked-example-an-editorial-workflow-plugin) shows an `editorial-workflow` plugin that:

- `dependsOn: ['content', 'auth']`
- exposes `createBranch` and `requestPublish` server ops (calling Octokit + `use('content')`)
- exposes a `WorkflowToolbar` and `PublishButton` in its client segment
- declares a `content:publish` permission

This is the v4 way to do "custom workflow": plugin, not a hardcoded core feature.

## Branches as drafts

There is no separate "draft" state in core. Branches not yet merged to main *are* drafts. Editorial plugins can layer richer semantics on top (e.g. a `status: in-review` frontmatter field), but that is plugin-territory, not core.

## Preview URLs

Per-branch previews are a deployment concern, not a core feature. The standard Vercel/Netlify/Cloudflare branch-preview model works as-is — the Admin UI shows the preview URL pattern configured in `defineConfig`:

```ts
defineConfig({
  branchPreview: (branch, path) =>
    branch === 'main' ? `${siteUrl}/${path}` : `${siteUrl}/preview/${branch}/${path}`,
})
```

## Save concurrency

Saving from the Admin UI is a **single mutation on the `content` capability**. The Data Layer owns:

- Optimistic concurrency (a `version` token in the mutation; conflict → error)
- Atomic write+commit
- Branch validity (refuse writes to `main` if the editorial-workflow plugin gates it via `requires: { permission: 'content:publish' }`)

The Admin UI just calls the mutation and reacts.

## What's gone from earlier drafts

| Old | Why removed |
|---|---|
| `GitManager` class in the CLI shelling out `git checkout`/`git add .`/`git commit` | Git lives inside the Data Layer ([ADR-004 amendment](../004-git-editorial-workflow.md)) |
| `BranchSlice` actions invoking `exec('git …')` from the client | Same — no shell-out from the browser or its session |
| Auto-commit on every save as a CLI behaviour | Save is a content-capability mutation; commit policy is the Data Layer's |
| Squash-on-merge enforced by the CLI | Repository PR settings; not Tina's concern |

## Related

- [GraphQL Server (`content` capability)](./graphql-server.md)
- [Custom Plugins → editorial-workflow example](../plugins/custom-plugins.md#worked-example-an-editorial-workflow-plugin)
- [ADR-004](../004-git-editorial-workflow.md), [ADR-007](../007-full-stack-plugins-client-backend-segments.md)
