# ADR-002: Plugin-First Architecture

## Status
**Accepted** — amended by [ADR-006](./006-plugin-dependency-resolution.md). Note: the `PluginDefinition.type` field shown below is removed by ADR-006; a plugin's kind is expressed through the capabilities it `provides`. Dependency resolution and lifecycle (originally deferred to the module system in ADR-005) are now owned by the plugin itself.

## Context
In TinaCMS v2, plugins exist but are not the primary abstraction. The system has:
- Built-in field plugins
- Built-in media, search, auth systems
- Some plugin registration capability
- But plugins feel secondary to core systems

This creates limitations:
1. **Hard to customize** - Core systems are tightly coupled
2. **Limited extensibility** - Can't easily swap implementations
3. **Feature creep** - Everything gets added to core
4. **Bloated bundles** - All features included even if unused
5. **Forking required** - To customize, must fork entire CMS

## Decision
Make **plugins the core abstraction** - everything is a plugin:

### Core as a Plugin Runtime
The core `tinacms` package becomes a **plugin runtime** that:

1. Manages plugin lifecycle (register, initialize, destroy)
2. Provides plugin communication APIs
3. Handles plugin dependencies
4. Implements plugin discovery and loading

### Everything is a Plugin
```typescript
// Field types are plugins
defineFieldPlugin({
  name: 'custom-field',
  Component: CustomFieldComponent,
})

// Media providers are plugins
defineMediaPlugin({
  name: 's3-media',
  upload: async (file) => { ... },
  list: async (path) => { ... },
})

// Search backends are plugins
defineSearchPlugin({
  name: 'algolia',
  index: async (docs) => { ... },
  query: async (q) => { ... },
})

// Auth providers are plugins
defineAuthPlugin({
  name: 'auth0',
  login: async () => { ... },
  logout: async () => { ... },
})

// Even "features" can be plugins
defineFeaturePlugin({
  name: 'editorial-workflow',
  hooks: {
    beforeSave: async (doc) => { ... },
    afterSave: async (doc) => { ... },
  },
})
```

### Plugin System Features
- **Plugin registry** - Central registry of all plugins
- **Plugin lifecycle** - Initialize, enable, disable, destroy
- **Plugin dependencies** - Declare and resolve dependencies
- **Plugin hooks** - Tap into system events
- **Plugin APIs** - Expose and consume plugin APIs
- **Plugin hot-reloading** - Add/remove plugins at runtime (dev mode)

## Consequences

### Positive
- **Ultimate extensibility** - Swap any implementation
- **Modular by design** - Features as plugins
- **Custom-friendly** - Add features without forking
- **Smaller bundles** - Only include what you need
- **Clear boundaries** - Plugins have clear APIs
- **Ecosystem growth** - Community can publish plugins
- **Testing isolation** - Test plugins independently
- **Backward compatible** - Can build v2 features as plugins

### Negative
- **Plugin overhead** - Indirection layer
  - **Mitigation**: Well-designed plugin APIs, minimal overhead
- **Documentation burden** - Need to document plugin system
  - **Mitigation**: Clear plugin patterns and examples
- **Discovery complexity** - Finding right plugins
  - **Mitigation**: Plugin registry, recommended plugins
- **Version conflicts** - Plugins may depend on different versions
  - **Mitigation**: Semver, compatibility layers
- **Learning curve** - Understanding plugin system
  - **Mitigation**: Good documentation, starter templates

### Neutral
- Core becomes thinner
- Built-in plugins are included by default but can be swapped
- Plugin ecosystem needs time to mature

## Implementation Notes

### Plugin Definition
```typescript
interface PluginDefinition<TConfig = unknown> {
  name: string
  version: string
  type: 'field' | 'media' | 'search' | 'auth' | 'feature'
  dependencies?: string[]

  config?: (config: TConfig) => Plugin

  init?: (context: PluginContext) => void | Promise<void>
  destroy?: (context: PluginContext) => void | Promise<void>

  api?: PluginAPI
  hooks?: PluginHooks
}
```

### Plugin Registration
```typescript
import { defineConfig } from 'tinacms'

export default defineConfig({
  plugins: [
    // Built-in plugins (default)
    localMediaPlugin(),
    localSearchPlugin(),
    gitAuthPlugin(),

    // Custom plugins
    s3MediaPlugin({ bucket: 'my-bucket' }),
    algoliaSearchPlugin({ appId: 'xxx' }),

    // Community plugins
    editorialWorkflowPlugin(),
    translationPlugin(),
  ],
})
```

### Plugin APIs
Plugins can expose APIs for other plugins to consume:
```typescript
// Media plugin exposes upload API
const mediaPlugin = {
  name: 's3-media',
  api: {
    upload: uploadToS3,
    list: listS3,
  },
}

// Custom plugin uses media API
const customPlugin = {
  name: 'image-optimization',
  dependencies: ['s3-media'],
  init: async (context) => {
    const media = context.getPlugin('s3-media')
    const optimized = await optimizeImage(media.api.upload)
  },
}
```

### Plugin Hooks
Plugins can tap into system events:
```typescript
const plugin = {
  name: 'audit-log',
  hooks: {
    onDocumentSave: async (doc) => {
      await logToAuditSystem(doc)
    },
    onDocumentDelete: async (doc) => {
      await logToAuditSystem(doc)
    },
  },
}
```

## Alternatives Considered

### Alternative 1: Core with Optional Plugins
- **Rejected**: Core still has implicit assumptions
- Want everything to be plugins, even core features

### Alternative 2: Module System Instead of Plugins
- **Rejected**: Modules are too heavy for this use case
- Plugins are more focused and composable

### Alternative 3: Hook-Based Extension
- **Rejected**: Hooks alone aren't enough
- Need APIs, dependencies, lifecycle management

## References
- [Plugin System](./architecture/plugin-system.md)
- [Field Plugins](./plugins/field-plugins.md)
- [Custom Plugins](./plugins/custom-plugins.md)
