# ADR-005: Module System Design

## Status
**Superseded by [ADR-006](./006-plugin-dependency-resolution.md)** — the module system is removed. Dependency resolution and lifecycle are folded into plugins themselves via `dependsOn`/`provides` capabilities. The dependency-ordering algorithm below (topological sort) survives in ADR-006, re-keyed on capabilities rather than module names. The rest of this document is retained for historical context only.

## Context
With a plugin-first architecture, we need a way to:
1. Discover and load plugins
2. Manage plugin dependencies
3. Initialize plugins in correct order
4. Handle plugin lifecycle
5. Provide plugin communication APIs

Options considered:

### Options
1. **Static Registration** - Plugins registered at config time
   ```typescript
   defineConfig({
     plugins: [pluginA, pluginB, pluginC],
   })
   ```
   - Pros: Simple, predictable, tree-shakeable
   - Cons: No dynamic loading, no hot-reloading

2. **Dynamic Import** - Plugins loaded on demand
   ```typescript
   const plugin = await import('./my-plugin')
   store.registerPlugin(plugin)
   ```
   - Pros: Code splitting, lazy loading
   - Cons: Complex async handling, dependency resolution

3. **Module System** - Structured plugin loading and lifecycle
   ```typescript
   const module = new TinaModule({
     plugins: [pluginA],
     dependencies: [moduleB],
     hooks: { ... },
   })
   ```
   - Pros: Lifecycle management, dependency resolution, clear structure
   - Cons: More complex API

## Decision
**Module System** will handle plugin organization and lifecycle:

### Module Definition
```typescript
interface TinaModule {
  name: string
  version: string

  // Plugins in this module
  plugins: PluginDefinition[]

  // Dependencies on other modules
  dependencies?: string[]

  // Lifecycle hooks
  onInit?: (context: ModuleContext) => void | Promise<void>
  onDestroy?: (context: ModuleContext) => void | Promise<void>

  // Module configuration
  config?: unknown
}
```

### Module System Features
- **Dependency resolution** - Topological sort for initialization
- **Lifecycle management** - Init → Enable → Disable → Destroy
- **Module discovery** - Auto-discover modules from config/file system
- **Hot-reloading** - Add/remove modules at runtime (dev mode)
- **Module isolation** - Each module has its own scope
- **Inter-module communication** - Event bus for communication
- **Module testing** - Test modules independently

## Consequences

### Positive
- **Structured organization** - Plugins grouped into modules
- **Lifecycle management** - Clear init/destroy phases
- **Dependency handling** - Correct initialization order
- **Hot-reloading** - Dev mode: reload modules without restart
- **Isolation** - Modules don't pollute global scope
- **Testing** - Test modules independently
- **Scalability** - Many plugins organized into modules
- **Clear boundaries** - Module contracts are explicit

### Negative
- **Additional complexity** - More concepts to learn
  - **Mitigation**: Good documentation, examples
- **Overhead** - Indirection layer
  - **Mitigation**: Keep implementation simple, fast
- **Learning curve** - Module vs plugin distinction
  - **Mitigation**: Clear docs, default modules included

### Neutral
- Modules are optional for simple use cases
- Can use plugins directly without modules
- Default modules included for common use cases

## Implementation Notes

### Module Manager
```typescript
class ModuleManager {
  private modules: Map<string, TinaModule>
  private context: ModuleContext

  register(module: TinaModule): void {
    this.modules.set(module.name, module)
  }

  async initialize(): Promise<void> {
    // Resolve dependencies
    const order = this.resolveDependencyOrder()

    // Initialize modules in order
    for (const moduleName of order) {
      const module = this.modules.get(moduleName)
      await module.onInit?.(this.context)
    }
  }

  async destroy(): Promise<void> {
    // Destroy in reverse order
    const order = this.resolveDependencyOrder()
    for (const moduleName of order.reverse()) {
      const module = this.modules.get(moduleName)
      await module.onDestroy?.(this.context)
    }
  }

  private resolveDependencyOrder(): string[] {
    // Topological sort
    const visited = new Set<string>()
    const order: string[] = []

    const visit = (name: string) => {
      if (visited.has(name)) return
      visited.add(name)

      const module = this.modules.get(name)
      for (const dep of module.dependencies || []) {
        visit(dep)
      }

      order.push(name)
    }

    for (const name of this.modules.keys()) {
      visit(name)
    }

    return order
  }
}
```

### Default Modules
```typescript
// Built-in modules included with tinacms
import { coreModule } from 'tinacms/modules/core'
import { fieldModule } from 'tinacms/modules/fields'
import { mediaModule } from 'tinacms/modules/media'
import { searchModule } from 'tinacms/modules/search'
import { authModule } from 'tinacms/modules/auth'
import { workflowModule } from 'tinacms/modules/workflow'

// Usage
defineConfig({
  modules: [
    coreModule(),
    fieldModule(),
    mediaModule({ provider: 'local' }),
    searchModule({ provider: 'local' }),
    authModule({ provider: 'git' }),
    workflowModule(),
  ],
})
```

### Custom Module
```typescript
// Create custom module
const customModule: TinaModule = {
  name: 'my-custom-module',
  version: '1.0.0',

  plugins: [
    myCustomPlugin(),
    anotherPlugin(),
  ],

  dependencies: ['core-module', 'field-module'],

  async onInit(context) {
    // Access other modules
    const coreModule = context.getModule('core-module')
    const fieldModule = context.getModule('field-module')

    // Subscribe to events
    context.bus.on('document.save', this.handleDocumentSave)

    // Extend store
    context.store.extend((set) => ({
      customData: {},
      customAction: () => { ... },
    }))
  },

  async onDestroy(context) {
    // Cleanup
    context.bus.off('document.save', this.handleDocumentSave)
  },
}

// Register
defineConfig({
  modules: [
    // ... default modules
    customModule,
  ],
})
```

### Module Context
```typescript
interface ModuleContext {
  // Access other modules
  getModule(name: string): TinaModule | undefined

  // Event bus for communication
  bus: EventBus

  // Extend the store
  store: StoreAPI

  // Access CLI/dev server (if available)
  cli?: CLIAPI

  // Access config
  config: TinaConfig

  // Logger
  logger: Logger

  // Module-specific storage
  storage: Map<string, unknown>
}
```

### Event Bus
```typescript
// Inter-module communication
class EventBus {
  on(event: string, handler: EventHandler): void
  off(event: string, handler: EventHandler): void
  emit(event: string, data: unknown): void
  once(event: string, handler: EventHandler): void
}

// Usage
bus.on('document.save', (doc) => {
  console.log('Document saved:', doc)
})

bus.emit('document.save', { id: '123', title: 'My Post' })
```

### Hot-Reloading (Dev Mode)
```typescript
// Watch for module changes
const moduleManager = new ModuleManager()

watch('./plugins', async (filename) => {
  const module = await import(filename)
  moduleManager.reload(module.name, module.default)
})

// Reload without restarting
moduleManager.reload('my-module', newModuleDefinition)
```

## Alternatives Considered

### Alternative 1: Static Registration Only
- **Rejected**: No lifecycle management, no dependency resolution
- Too limited for complex plugin ecosystems

### Alternative 2: Dynamic Import with Promises
- **Rejected**: No structured lifecycle
- Hard to manage initialization order

### Alternative 3: Web Components / Custom Elements
- **Rejected**: Not suitable for backend systems
- Too DOM-focused

## References
- [Module System](./modules/module-system.md)
- [Module Lifecycle](./modules/lifecycle.md)
- [Plugin System](./architecture/plugin-system.md)
- [Modular Architecture](./architecture/modular-system.md)
