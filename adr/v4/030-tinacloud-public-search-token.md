# ADR-030: TinaCloud Website Search Uses a Public Search Token

## Status
**Accepted.** Builds on [ADR-021](./021-search-capability-contract.md). It does not amend or supersede ADR-021.

## Context
ADR-021 §1 makes search website-first: its primary consumer is the website, and a visitor has no session. First-party TinaCloud search indexes itself (ADR-021 §4), so the TinaCloud provider only queries TinaCloud's search route.

That route needs a credential, and no TinaCloud token fits a browser-facing site today:

- The v3 search token has `search:write` access. Only the build-time indexer uses it.
- The read-only token (`TINA_TOKEN`) has `db:read` access. It reads draft content on every branch, so it must stay on the server.
- TinaCloud's search read route accepts a token only when its access list holds `search:read`.

Without a credential for visitors, the TinaCloud provider could serve signed-in editors only, and a website would always get `unavailable`.

## Decision
v4 website search on TinaCloud authenticates with an auto-generated **Public Search token** whose access is only `search:read`.

- TinaCloud creates the token for each project, as it creates the read-only and search tokens today.
- The developer passes it to `tinaCloud({ search: { publicToken, branch } })`, and reads it from `TINA_PUBLIC_SEARCH_TOKEN`. `branch` is required with it, because the token cannot look up the project's default branch.
- When `publicToken` is set, the server sends only that token to TinaCloud, for every caller. When it is not set, search works for signed-in editors only, and a visitor gets `unavailable`.
- The token may reach the browser bundle, because its access is `search:read` only. This holds on one condition, and it is a **requirement on the TinaCloud change**: the Public Search token can read only the project's published (default-branch) index, never the index of another branch.

## Consequences

### Positive
- A website visitor can search with no session, as ADR-021 §1 intends.
- The read-only content token stays on the server and never ships to a browser.
- One credential and one code path for editors and visitors.

### Negative
- Search on a website needs a TinaCloud change: the token type does not exist yet.
- A developer can put the wrong token in `publicToken`. TinaCloud refuses a read-only token on the search route, but the bundle has already shipped it. The docs warn by name.
- The token is public by design. Its safety depends on TinaCloud limiting it to the published index.

## Alternatives Considered
- **The search route accepts `db:read` tokens.** *Rejected:* the website would need the read-only token, and that token reads drafts on every branch.
- **Read-only tokens also get `search:read`.** *Rejected:* the same token would still be the secret that reads drafts, and it would still ship to the browser.
- **A public route with no authentication.** *Rejected:* it gives TinaCloud no way to scope, rate-limit or revoke access for one project.

## References
- [ADR-021: Search Capability Contract](./021-search-capability-contract.md)
- [Search plugins](../../packages/v4/@tinacms/tinacms/_docs/search-plugins.md)
