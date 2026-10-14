# ADR-001: Single Package Architecture

## Status
**Accepted** — amended by [ADR-007](./007-full-stack-plugins-client-backend-segments.md): the single package splits along a client/backend line via entry points (the client entry never imports backend code), and per-framework adapter entry points (`tinacms/next`, `tinacms/express`, …) are added.

## Context
In TinaCMS v2, the system is split into multiple packages:
- `tinacms` - React integration and hooks
- `@tinacms/core` - Core types and configuration
- `@tinacms/cli` - Dev server, GraphQL, code generation
- `@tinacms/app` - Admin UI
- `@tinacms/ui` - UI components
- `@tinacms/search` - Search functionality
- `@tinacms/richtext` - Rich text editing

This split creates several issues:
1. **Installation complexity** - Users must install and configure multiple packages
2. **Version coordination** - Ensuring compatible versions across packages
3. **Documentation burden** - More packages = more docs to maintain
4. **User confusion** - Unclear which package provides what functionality
5. **Build overhead** - Multiple package builds and publications
6. **Barrier to entry** - Complex setup for new users

## Decision
Consolidate into a **single `tinacms` package** that includes:

- Core types and configuration
- React integration and hooks
- Development server and CLI
- GraphQL API
- Code generation
- Built-in field plugins
- Built-in media, search, and auth providers
- Admin UI components (optional import)

Users will install and use:
```bash
npm install tinacms
```

## Consequences

### Positive
- **Simpler installation** - One package, one dependency to manage
- **Version consistency** - No mismatched versions between packages
- **Easier onboarding** - New users install one thing and get started
- **Reduced documentation** - Single point of truth for APIs
- **Faster development** - No need to coordinate across multiple repos
- **Simpler releases** - One version number, one changelog
- **Tree-shakeable** - Modern bundlers can exclude unused code

### Negative
- **Larger bundle size** - Single package includes everything
  - **Mitigation**: Tree-shaking, code splitting, optional imports
- **Less granular updates** - Can't update just one part
  - **Mitigation**: Use semver carefully, feature flags
- **Monolithic feel** - May feel like "all or nothing"
  - **Mitigation**: Plugin system allows feature selection at runtime
- **Slower CI/CD** - Testing larger codebase
  - **Mitigation**: Better test organization, parallel tests

### Neutral
- Internal organization still matters (modules within the package)
- TypeScript paths can be used for cleaner imports
- Can still publish separate packages if needed later

## Implementation Notes

### Package Structure
```
tinacms/
├── package.json
├── src/
│   ├── core/           # Types, configuration, validators
│   ├── react/          # React hooks, provider
│   ├── cli/            # Dev server, GraphQL, codegen
│   ├── plugins/        # Built-in plugins
│   ├── store/          # Zustand store and slices
│   └── ui/             # Admin UI components (optional)
└── dist/
    ├── index.d.ts
    ├── index.js
    ├── index.mjs
    ├── react.d.ts
    ├── react.js
    ├── cli.d.ts
    ├── cli.js
    └── ...
```

### Entry Points
```json
{
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./react": "./dist/react.js",
    "./cli": "./dist/cli.js",
    "./store": "./dist/store.js",
    "./plugins": "./dist/plugins.js",
    "./ui": "./dist/ui.js"
  }
}
```

### Usage
```typescript
// Everything in one place
import { defineConfig, t } from 'tinacms'
import { TinaProvider, useTina } from 'tinacms/react'
import { StringFieldPlugin } from 'tinacms/plugins'

// Dev server CLI
import { defineDevCommand } from 'tinacms/cli'
```

## Alternatives Considered

### Alternative 1: Keep Multi-Package Structure
- **Rejected**: Complexity outweighs benefits
- Would require better package management and documentation investment

### Alternative 2: Two Packages (tinacms + tinacms-cli)
- **Rejected**: Still adds complexity
- CLI should be part of the core experience

### Alternative 3: Monorepo with Workspaces
- **Rejected**: For users, not for development
- This is about the distribution model, not development structure

## References
- [Single Package Refactor](./roadmap/single-package-refactor.md)
- [Entry Points Design](./configuration/entry-points.md)
- [Architecture Overview](./architecture/overview.md)
