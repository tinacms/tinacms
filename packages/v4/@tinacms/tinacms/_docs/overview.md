This is a document with for the high level overview of the TinaCMS v4 rewrite

## Plugin: 
A plugin is a single unit of functionality - it can be switched in/ out 

A plugin is defined by calling the `definePlugin(...)` function, which consumes a "manifest" in the shape of `PluginManifestInput`. 

### Manifest:

A manifest is the plain-data description of a plugin, safe to load anywhere. It's properties: 
  - name: a unique ID, e.g. tina:media:local.
  - provides: the jobs this plugin does.
  - dependsOn: the jobs it needs another plugin to do.
  - overrides: what it deliberately replaces.
  - field, validators, hooks: the keys it registers, for those jobs.
  - client: a lazy import of its client segment.
  - server: a lazy import of its server segment.
  - onInit / onDestroy: code to run when the admin starts and stops

### Capability: 
A capability is a type union of strings, defining the job/ action of what a plugin can do. 

- Single-provider jobs allow exavtly one plugin to "provide" it - i.e. Media, it either lives in TInaCloud, local, or some other media provider, never more than one at a time
    - The only time we can have many plugins "providing" a capability, is if one of them declares `overrides` , in which it replaces the other


- Keyed jobs allow many plugins to "provide" the capability", so long as there is a unique key to identify them (i.e. there can be many `screen`s provided but each must have a unique name)

### Tina Schema (i.e. config.ts)

The TinaCMS Schema lists which plugins a project will use 

## In the Browser 

### Client Segment 

Plugins can provide a ClientSegment, this is to ensure that the plugin's browser code is separate from its manifest. The manifest is loaded everywhere, but the client segment is imported lazily, inside only the admin. 

Initialized via `defineClientPlugin` it can contain: 
  - field: a field's editor component and rules (a field descriptor).
  - validators: the functions behind named validation rules.
  - hooks: functions that run during saving.
  - slice: the plugin's section of the store.
  - screens: full admin pages.
  - slots: contributions to shared UI regions.

### Store 

The store is a single shared state object for the admin, built once at startup with Zustand (`createTinaStore`). It is shared through a runtime context and read with `useTinaStore(...)`. 

It holds the core sections (ui, branch, documents) and each plugins slice. 

### Slice 

A plugin's section of the store, set by the `slice` property of its `ClientSegment`.

### Screen

A full adin page, opened at `#/screens/<name>`. Each has a unique `name`, `label` and a React component. 

A screen does not add itself to the sidebar. Rather, a plugin adds a `slot` entry that targets a screen by name. 

### Slot

A fixed part of the admin UI that many plugins can add items to. Core owns the list of slots and plugins fill them. 

As of writing this, there is only one slot - `globalNav` which is the regular admin sidebar. Each plugin can add a global nav entry and target a screen. 
