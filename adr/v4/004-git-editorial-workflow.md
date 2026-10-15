# ADR-004: Git-Based Editorial Workflow

## Status
**Accepted** — amended by [ADR-007](./007-full-stack-plugins-client-backend-segments.md). The git operations described below (the `GitManager` shelling out `git checkout`/`git add .`/`git commit`) are an implementation detail **inside the Data Layer** — the GitHub sync engine for TinaCloud, or git for a Self-Hosted Data Layer — **not** a client concern. The Admin UI never runs git directly; it calls backend operations (create branch, publish) via Capability RPC. This removes the shared-working-tree concurrency problem and the shell-injection surface from the client. The branch/commit/publish *concepts* below stand; the *location* (CLI on the client) does not.

## Context
Editorial workflow is a core CMS feature. Options considered:

### Options
1. **Separate CMS Database** - Like Strapi, Contentful
   - Store content in database, sync to git
   - Pros: Full workflow, staging, previews
   - Cons: Complexity, data duplication, git is source of truth

2. **Git-Based with Branches** - Native git workflow
   - Create/edit on feature branches, merge via PR
   - Pros: Native to developers, git is source of truth, no duplication
   - Cons: Git operations must be careful, commit history management

3. **Git-Based with Draft Commits** - Draft commits on main
   - Save as "draft" commits, squash on publish
   - Pros: Simpler, no branch switching
   - Cons: Commit history gets messy, harder to review

## Decision
**Git-based with feature branches** will be the editorial workflow:

### Workflow
```bash
# 1. Create content branch
git checkout -b cms/new-post-title

# 2. Create/edit content in CMS
# CMS saves to current branch

# 3. Preview on branch
git push origin cms/new-post-title
# Preview at: https://site.com/preview/new-post-title

# 4. Submit PR for review
# GitHub/GitLab PR created automatically

# 5. Review and approve
# Team reviews content in PR

# 6. Merge to main
git checkout main
git merge cms/new-post-title
git push origin main

# 7. Content live
# Site deploys from main
```

### System Integration
- **CLI** - Manages git operations (create branch, checkout, merge)
- **CMS UI** - Shows current branch, branch switching, PR status
- **Dev Server** - Serves content from current branch
- **Preview** - Automatic preview URLs for branches
- **Deploy** - Deploy on merge to main

## Consequences

### Positive
- **Native to developers** - Git workflow they already know
- **Single source of truth** - Git is the database
- **No data duplication** - Content lives only in git
- **Full git features** - History, blame, revert, bisect
- **Code + content together** - Same review process
- **Permissions** - Git's access control
- **Backups** - Git remotes are backups
- **Rollbacks** - `git revert` for quick rollbacks
- **Collaboration** - PR discussions, code review for content
- **Staging** - Branch previews for staging

### Negative
- **Git expertise required** - Content authors need git basics
  - **Mitigation**: CMS UI abstracts git operations, show only what's needed
- **Commit history management** - Can get messy
  - **Mitigation**: Commit conventions, squashing on merge
- **Performance with large repos** - Git operations can be slow
  - **Mitigation**: Shallow clones, partial clones, optimization
- **Concurrent editing** - Git doesn't handle this well
  - **Mitigation**: File locking, branch-based isolation
- **Draft state** - No explicit "draft" state
  - **Mitigation**: Unpublished branches, frontmatter field

### Neutral
- Different mental model for content authors (not a typical CMS)
- Git integration complexity in the CMS
- Need to handle git errors gracefully in the UI

## Implementation Notes

### Branch Management
```typescript
interface BranchSlice {
  currentBranch: string
  branches: string[]
  isBranchDirty: boolean
  createBranch: (name: string) => Promise<void>
  switchBranch: (name: string) => Promise<void>
  deleteBranch: (name: string) => Promise<void>
  publishBranch: () => Promise<void>
  discardChanges: () => Promise<void>
}
```

### Git Operations in CLI
```typescript
// CLI manages git operations
class GitManager {
  async getCurrentBranch(): Promise<string> {
    return exec('git rev-parse --abbrev-ref HEAD')
  }

  async createBranch(name: string): Promise<void> {
    await exec(`git checkout -b ${name}`)
  }

  async switchBranch(name: string): Promise<void> {
    await exec(`git checkout ${name}`)
  }

  async createCommit(message: string): Promise<void> {
    await exec('git add .')
    await exec(`git commit -m "${message}"`)
  }

  async publishBranch(): Promise<void> {
    await exec(`git push origin ${this.currentBranch}`)
    // Create PR via GitHub API
    await this.createPullRequest()
  }

  async mergeBranch(source: string): Promise<void> {
    await exec('git checkout main')
    await exec(`git merge ${source}`)
    await exec('git push origin main')
  }
}
```

### CMS UI Integration
```typescript
// Show current branch
<BranchSelector
  currentBranch={currentBranch}
  branches={branches}
  onSelectBranch={switchBranch}
  onCreateBranch={createBranch}
/>

// Show branch status
<BranchStatus
  branch={currentBranch}
  isDirty={isBranchDirty}
  changesCount={changesCount}
  onCommit={createCommit}
  onPublish={publishBranch}
  onDiscard={discardChanges}
/>

// Show PR status
<PullRequestStatus
  branch={currentBranch}
  prNumber={prNumber}
  status={prStatus}
  reviews={prReviews}
/>
```

### Content State
```typescript
// Mark content as draft in frontmatter
---
title: My Post
status: draft
---
```

```typescript
// Or use unpublished branches
// Branches not merged to main are "draft"
```

### Preview URLs
```typescript
// Generate preview URL for branch
function getPreviewUrl(branch: string, path: string): string {
  if (branch === 'main') {
    return `${siteUrl}/${path}`
  }
  return `${siteUrl}/preview/${branch}/${path}`
}

// Examples:
// main:         https://mysite.com/blog/my-post
// cms/my-post:  https://mysite.com/preview/cms-my-post/blog/my-post
```

### Auto-Commit on Save
```typescript
// CMS auto-commits on save
const saveDocument = async (document) => {
  await writeFile(document.path, document.content)
  await gitManager.createCommit(`Update ${document.name}`)
}
```

### Squash on Merge
```typescript
// Squash commits when merging to main
await gitManager.mergeBranch('cms/my-post', {
  squash: true,
  message: 'Publish: My Post',
})
```

## Alternatives Considered

### Alternative 1: Separate Database
- **Rejected**: Data duplication, git not source of truth
- Adds complexity, defeats purpose of git-based CMS

### Alternative 2: Draft Commits on Main
- **Rejected**: Commit history gets messy
- Harder to review, reverts are difficult

### Alternative 3: Git Submodules
- **Rejected**: Too complex for most users
- Overkill for simple content management

### Alternative 4: Git LFS for Media
- **Rejected**: Separate concern
- Can be configured independently if needed

## References
- [Editorial Workflow](./systems/editorial-workflow.md)
- [CLI Git Integration](./systems/graphql-server.md#git-operations)
- [Workflow Rationale](./decisions/git-workflow.md)
