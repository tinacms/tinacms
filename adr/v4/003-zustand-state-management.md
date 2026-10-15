# ADR-003: Zustand for State Management

## Status
**Accepted** — amended by [ADR-007](./007-full-stack-plugins-client-backend-segments.md); refined by [ADR-010](./010-form-state-model.md) for *form/field* state (which is **core, per-document, normalized-by-address** — not a per-plugin boot-time slice, since fields are dynamic and per-instance). The store is **client-only** and composed **once at boot** from the static plugin list, with each plugin's slice mounted namespaced under its capability key. The runtime `store.extend()` and `store.addMiddleware()` sketches below are dropped — Zustand composes middleware at `create()` time, and because the plugin list is static there is no need to mutate a live store. The "Plugin Integration" / "Extensibility Patterns" sections below are superseded by that boot-time composition model.

## Context
State management is critical for TinaCMS. In v2, Zustand is used but not fully leveraged for extensibility. Options considered:

### Options
1. **Redux** - Proven, well-documented
   - Pros: Ecosystem, dev tools, middleware
   - Cons: Boilerplate, complexity, bundle size

2. **Context + useReducer** - Built-in React
   - Props: No dependencies, simple
   - Cons: No persistence, no devtools, performance issues

3. **Recoil** - Facebook's experiment
   - Pros: Atoms, selectors, time travel
   - Cons: Newer, less proven, complex API

4. **Jotai** - Atomic state
   - Pros: Simple, composable atoms
   - Cons: Different mental model, less mature ecosystem

5. **Zustand** - Lightweight, extensible
   - Pros: Simple API, middleware, TypeScript-friendly
   - Cons: Smaller ecosystem than Redux

## Decision
**Zustand** will be the state management solution with emphasis on:

1. **Composable slices** - Independent state modules
2. **Middleware stack** - DevTools, persist, custom middleware
3. **Extensibility** - Easy to add new slices and middleware
4. **TypeScript-first** - Full type safety

## Consequences

### Positive
- **Simple API** - Easy to learn and use
- **Small bundle** - ~1KB minified
- **Middleware support** - DevTools, persist, logging, etc.
- **No providers needed** - Direct hook access
- **TypeScript-friendly** - Strong typing out of the box
- **Performance** - Selective re-renders, no context overhead
- **Extensible** - Easy to add slices and middleware
- **Testing-friendly** - Can create test stores

### Negative
- **Smaller ecosystem** - Fewer third-party integrations than Redux
  - **Mitigation**: Build what we need, middleware is flexible
- **Less documentation** - Fewer examples and tutorials
  - **Mitigation**: Good documentation, patterns guide
- **DevTools support** - Basic but less powerful than Redux DevTools
  - **Mitigation**: Extend with custom middleware

### Neutral
- Different mental model than Redux (actions, reducers, dispatch)
- Not as battle-tested as Redux (but proven in many apps)
- Learning curve for team members

## Implementation Notes

### Store Architecture
```typescript
// Composable slices
const createAuthSlice = (set: SetState<TinaStore>) => ({
  user: null,
  isAuthenticated: false,
  login: async (credentials) => { ... },
  logout: async () => { ... },
})

const createFormsSlice = (set: SetState<TinaStore>) => ({
  forms: {},
  activeFormId: null,
  registerForm: (form) => { ... },
  updateFormValues: (formId, values) => { ... },
})

const createMediaSlice = (set: SetState<TinaStore>) => ({
  mediaItems: [],
  selectedMedia: null,
  uploadMedia: async (file) => { ... },
  deleteMedia: async (path) => { ... },
})

// Combine with middleware
const useTinaStore = create<TinaStore>()(
  devtools(
    persist(
      (set, get, api) => ({
        ...createAuthSlice(set, get, api),
        ...createFormsSlice(set, get, api),
        ...createMediaSlice(set, get, api),
        // ... more slices
      }),
      {
        name: 'tina-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          // ... persistable fields
        }),
      }
    ),
    { name: 'TinaStore' }
  )
)
```

### Plugin Integration
Plugins can extend the store:
```typescript
const myPlugin = {
  name: 'my-plugin',
  init: (context) => {
    // Add slice to store
    context.store.extend((set) => ({
      myPluginData: {},
      myPluginAction: () => { ... },
    }))
  },
}
```

### Extensibility Patterns

#### 1. Add New Slice
```typescript
// Plugin adds custom slice
const pluginSlice = (set: SetState<TinaStore>) => ({
  customData: null,
  updateCustom: (data) => set({ customData: data }),
})

store.extend(pluginSlice)
```

#### 2. Add Middleware
```typescript
// Plugin adds logging middleware
const loggingMiddleware = (config) => (set, get, api) =>
  config(
    (args) => {
      console.log('Action:', args)
      set(args)
    },
    get,
    api
  )

store.addMiddleware(loggingMiddleware)
```

#### 3. Hook into Actions
```typescript
// Plugin wraps existing actions
const plugin = {
  init: (context) => {
    const originalSave = context.store.getState().saveDocument
    context.store.setState({
      saveDocument: async (doc) => {
        await plugin.beforeSave(doc)
        const result = await originalSave(doc)
        await plugin.afterSave(doc)
        return result
      },
    })
  },
}
```

### Future Extensibility
The store is designed to support:

1. **Runtime slice addition** - Plugins add state at runtime
2. **Middleware composition** - Stack of middleware (devtools → persist → logging → ...)
3. **Selector optimization** - Computed selectors with memoization
4. **Async actions** - Async actions with loading/error states
5. **Store composition** - Multiple stores for different concerns
6. **Hot module replacement** - Reload slices in dev mode

## Alternatives Considered

### Alternative 1: Redux Toolkit
- **Rejected**: More boilerplate, larger bundle
- Zustand provides same functionality with less code

### Alternative 2: Recoil
- **Rejected**: Different mental model, larger bundle
- Atoms and selectors overkill for our use case

### Alternative 3: Jotai
- **Rejected**: Too granular for our needs
- We need structured state, not individual atoms

### Alternative 4: Context + useReducer
- **Rejected**: No built-in devtools, persistence, or extensibility
- Would need to build these ourselves

## References
- [Store Architecture](./store/store-architecture.md)
- [Extensibility](./store/extensibility.md)
- [Middleware](./store/middleware.md)
- [State Management Overview](./architecture/state-management.md)
