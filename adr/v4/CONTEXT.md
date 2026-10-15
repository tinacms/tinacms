# TinaCMS v4

The domain language for the TinaCMS v4 architecture — a plugin-driven, git-native CMS where the source of truth is content files in a repository, edited through an **Admin UI** that reads/writes content via a **Data Layer** and runs everything else through plugins.

## Language

**Admin UI** (a.k.a. Client):
The browser-based React application an editor uses to author content. Holds the Zustand store. Never touches git or the filesystem directly — it reads/writes content through the **Data Layer** and calls plugin **Server segments** via **Capability RPC**.
_Avoid_: "the app", "frontend" (ambiguous with the user's published website)

**Data Layer**:
The GraphQL content API that sits *between the content files and the Admin UI*. The UI calls it to read and write content (the `content` capability). It is **not** "the backend". Implementations: **TinaCloud** (hosted), a **Self-Hosted Data Layer**, or a **Local Data Layer**.
_Avoid_: "GraphQL Server" as a separate system, "backend" (that is the user's app server)

**Local Data Layer**:
The **Data Layer** used during local development: an in-memory query index over the on-disk content files. Writes persist to the real files.
_Avoid_: "dev server"

**Self-Hosted Data Layer**:
A **Data Layer** a user runs themselves (their own GraphQL + datastore + git), as an alternative to **TinaCloud**.

**TinaCloud**:
The hosted **Data Layer** (GraphQL + cache + GitHub sync engine) plus an optional image CDN. It is **not** the user's **Backend** and runs no plugin code — its surface is fixed and first-party, so a third-party plugin providing one of its capabilities is a **Capability conflict** rather than something deployable into it.

**Backend**:
The user's own application server (e.g. the server Next.js runs on) — the host where plugin **Server segments** execute, mounted as routes. This is "backend" in the host-framework sense, *not* the **Data Layer** and *not* **TinaCloud**.
_Avoid_: using "backend" for the Data Layer or for TinaCloud

**Plugin**:
The single unit of extension — the only extensibility concept in v4. Everything (fields, media, search, auth, features) is a plugin. A plugin declares a `name`, the **Capabilities** it `provides`, the capabilities it `dependsOn`, and `onInit`/`onDestroy` lifecycle hooks.
_Avoid_: "module", "extension", "addon"

**`defineConfig`**:
The composition root — the single entry point wiring a project together, with **two sibling concerns**: `plugins` (capability providers + **Field plugins** + feature plugins — everything-is-a-plugin for *behavior*) and `schema` (the content model — **Collections**; a sibling, *not* a plugin, because it's the user's content, not an extension). **Per-capability config lives on the provider plugin** (`tinaCloud({...})`, `s3Media({ bucket })`), not as top-level keys. Built-in field plugins are included by default (additions / `overrides` go in `plugins`); a **Data Layer** provider must be specified. **Build-time config, not runtime data** — it deliberately *excludes* **Roles**/assignments (auth provider — ADR-008), the auth **origin allowlist** (dashboard — ADR-023), and branch/publish (the **Data Layer** — ADR-004/018).
_Avoid_: forcing the schema through the plugin model; putting roles, auth/origin, or branch config in `defineConfig` (operational/runtime — it lives elsewhere)

**Capability**:
A named contract that a **Plugin** can `provide` and other plugins can `dependOn` (e.g. `auth`, `media`, `search`, `content`). The unit of dependency resolution and the seam along which implementations are swapped. `dependsOn` references capabilities, not plugin names, so implementations are interchangeable. One plugin may `provide` several capabilities (e.g. a cloud plugin providing `media` + `search` + `auth`). There is no separate plugin `type` field — a plugin's kind is just its `provides` entries.
_Avoid_: "service", "feature" (overloaded)

**Capability conflict**:
The situation where two installed plugins `provide` the same **Capability** *at the same key* (for singleton capabilities, the same capability at all — see **Keyed capability**). Resolved by: a hard error by default (load order never silently decides a winner), with an explicit `overrides` declaration as the only sanctioned way to intentionally replace a provider. This is what keeps capability resolution from becoming a silent plugin-hijack vector.

**Keyed capability**:
A **Capability** that may have *many* providers — one per **key** — rather than a single one. `field` is the canonical example: its key is the schema field `type` a provider handles (`string`, `image`, `rich-text`, `object`…), and dozens are active at once. The **Capability conflict** rule still holds, but per key: two providers of the same capability *at the same key* is the error, and `overrides` is how you intentionally replace a built-in (e.g. swap the stock `image` field). Singleton capabilities (`media`, `auth`, `search`, `content`) are the degenerate case — one implicit key, one provider.
_Avoid_: calling a second field plugin a "conflict" — only same-key collisions are

**Plugin segment** (Client segment / Server segment):
A **Plugin** is full-stack: it may contribute a *client segment* (`defineClientPlugin` — React/UI + a Zustand slice, ships to the browser) and/or a *server segment* (`defineServerPlugin` — operations that run on the **Backend**, hold secrets, touch files/APIs — never ships to the browser). The manifest references each segment lazily (`client: () => import('./client')`, `server: () => import('./server')`) so the bundler can cut a clean line between them. A `server` segment means the deployment must have a server runtime (Next/serverless) to host it.

**Capability RPC**:
The typed request/response channel by which a **Client segment** calls a **Server segment** (`server.media.upload(...)`). The client proxy's types are inferred from the server's exported shape via a type-only import (`import type`, erased at build — no server code reaches the browser), so the contract crosses the boundary with no hand-written interface and no codegen step. v4 core is request/response only — there is no server→client push; the server returns values, and a client always initiates.

**Field plugin**:
A **Plugin** that provides the `field` **Keyed capability** at the schema `type` it renders. Mostly a **Client segment** — the React component an editor uses to edit one field — optionally with a **Server segment** for type-specific server concerns like validation (serialization is **not** a field concern — see **Format adapter**). Many coexist; the schema's field `type` selects which one renders. A *composite* field plugin (e.g. `object`/`list`) renders its nested fields by **Component resolution**, never by branching on the child's `type`; it owns only list/layout mechanics (add/remove/reorder/collapse) and reads layout hints from metadata the child plugin *declares*. Holds no persistent state slice — it consumes the **Form** by **Field address** (only transient local UI state is its own).
_Avoid_: "container field" as a privileged concept — a composite field is just a field plugin

**Validator**:
A named, parameterised validation rule — including the first-party `required`,
`min`, `max` and `pattern`, which v4 registers as validators rather than as
field config that a **Plugin** registers (the `validator` **Keyed capability**, keyed by the rule's name) and that a collection attaches to individual fields as `{ name, args }` (`validators: [after('startDate')]`). A validator is a factory: its parameters come from the collection, never hard-coded, and it returns the same `(value, context) => string | string[] | null` shape as a **Field plugin**'s own `validate`. Its `context` is a superset of the plugin-level one: it adds the field's siblings and the whole document, because the rule sits in a collection. Runs in the form resolver, so its messages enter the **Form**'s error state like a Zod rule's. The attachment is plain JSON in `tina-lock.json`; the code runs on the Client and in `tina doctor`, never in TinaCloud (**Execution boundary**).
_Avoid_: computing validation inside a component via `useSiblingValue`; that message never reaches the form's error state, so it cannot block save

**Component resolution**:
The inter-plugin channel by which one plugin renders *another* plugin's component, resolved by **Keyed capability** key at runtime with context wired in (value, change handler, field path), and without importing or naming the other plugin. Distinct from **Capability RPC** (value calls to a server segment) and namespace slice reads (`get().auth.user`, reading another plugin's state). A composite **Field plugin** uses it to render children whose types come from the user's content schema, not from install time.

**Field address**:
The stable identity of a field *instance* within a form — the path from the form root to that field (`blocks.<key>.cta.label`). Minted by **Component resolution**: each composite prepends its segment as it delegates. Array segments use a **stable per-item key** (assigned at item creation), not the positional index, so an address survives reordering; positions exist only at the render layer. One identity serves nested rendering, validation targeting, active-field highlighting, and the **Visual editing** marker. An address may terminate at *any* node, leaf or composite — `blocks.2.cta` (an object) is a valid target.
_Avoid_: positional indices as identity (`blocks.2` breaks on reorder)

**Visual editing** (click-to-edit):
The feature where an editor clicks rendered content in the preview **iframe** and the matching field is revealed in the **Admin UI**. The user's site wraps content in markers carrying a **Field address**; a click `postMessage`s that address across the window boundary, and the form sets it as the active field. The message carries *only* an address — it is one producer among several (validation jump, deep-link) of the form's single active-field state.
_Avoid_: treating this as a separate focus mechanism — it just sets the active **Field address**

**Form**:
The editing scope for a *single document* in the **Admin UI**. Owns the value tree, the active **Field address**, validation state, and collapse/expansion — all keyed by address. **Field plugins** are stateless consumers of the form: they hold no persistent slice, reading/writing it by address through hooks. Scoped per open document (a `formId`), so more than one form can be live at once — e.g. a **reference field** hosting a second document's form.
_Avoid_: a per-field-plugin Zustand slice for field state — fields are dynamic and per-instance, so form state is *core*, not plugin-owned

**Embedded field** (rich-text embed):
A **Field plugin** instance embedded *within* a rich-text body (an MDX/template block like `<Cta>`). Modeled as a composite child of the rich-text field: the prose stays in the editor's AST as one opaque value, while each embed is an **anchor** (stable key + position) in that AST whose field data lives in the **Form** under a normal **Field address** (`body.<key>.*`). So embeds are focusable, editable, and cloneable like any field — same `Form` scope, *not* a nested form (that is a **reference field**). The editor routes embed insert/move/delete through the form's structural actions. *Presentation is independent of mechanism*: an embed may be edited inline, in a popover, or in the field panel — all the same `Form`, just a different mount point.
_Avoid_: storing embed field data inside the rich-text value; treating an embed as a nested form

**Reference field**:
A **Field plugin** whose value is a *pointer* to another document (target collection + id/path), **not** the document's content. It `dependsOn` the `content` capability to query candidate documents (filtered by target collection) and renders a summary of the chosen target. In v4 it is **select-only** — editing the target means navigating to the target's own **Form**. (v4.1 plans inline editing, which mounts a *second* `Form` scope for the target document — never merging into the parent's value tree — which is why `Form` is scoped per `formId`.) A **dangling reference** (target deleted or moved out-of-band) is **preserved and shown in an error state** (value retained, flagged, "no longer exists") — never silently cleared; loading it does not mutate or dirty the **Form**, and the editor repoints or clears it explicitly (same preserve-and-flag principle as **Unknown field**).
_Avoid_: storing the referenced document's content in the field; editing the target inline in v4; silently resetting a dangling reference on load

**Hidden field**:
A **Field plugin** instance that *is* declared in the schema but marked not-to-render in the **Form** (e.g. `ui: { hidden: true }`). Its value is loaded, preserved, and saved like any field — it just has no editing UI. The intentional counterpart of an **Unknown field**: a developer acknowledges legitimate extra document data by adding it to the schema as a hidden field.
_Avoid_: confusing with **Unknown field** — a hidden field is *known*, just not shown

**Unknown field**:
Data present in a document that has *no* entry in the collection schema — a **routine** state in a git-native CMS (schema edits, frontmatter shared with other tools, hand edits, branch skew), not an error. It is **preserved untouched** (parked by **Field address**, re-emitted verbatim on save — never dropped), surfaced **read-only** in the sidebar with its raw value, and resolved by a *developer* promoting it to a **Hidden field** (a code change — the schema is build-time config, not runtime data, so an editor cannot do it; the sidebar offers a copy-paste schema snippet). Strictness about drift belongs in a dev/CI audit (**`tina doctor`**), not the editor's open path.
_Avoid_: throwing on open (bricks valid content); letting editors hand-edit the raw value

**`content` capability**:
The capability for reading/writing content, exposed by the **Data Layer**. Its query wire-format is GraphQL. "GraphQL Server" is *this capability's implementation*, not a separate system.
_Avoid_: "GraphQL Server" as a top-level system name

**`draft` capability** (Drafting):
The capability for retaining a user's **uncommitted, pre-save** edits to a document — **per-user and local**, distinct from committed/git history (which lives inside the **Data Layer**, ADR-004). Durable drafts persist in the core form store (ADR-026): dirty forms only, restored automatically and rebased onto the fetched document, cleared on save or discard. The storage adapter is the swap point; edit history and **collaborative editing** remain future `draft` capability work built on that storage.
_Avoid_: drafting as committed/version history — drafts are pre-save, per-user, and uncommitted

**`search` capability**:
The *optional* capability for **full-text / relevance / typo-tolerant** querying over content — distinct from the **`content` capability**'s structured queries (the boundary is set in ADR-019). A `search` provider (first-party **TinaCloud**, or Algolia/Pagefind/self-hosted) maintains a **derived, eventually-consistent index**: results are `{ ref, score, snippet }` that the UI **re-fetches from `content`** to display/edit — *never* authoritative content. It indexes **published** content; indexing is **server-side** (committed-event **TinaCloud** webhooks / `afterSave` / a `reindex` CLI). Searchable fields are **configured** (weights/tokenization), *not* derived like content's structured indexes. Primary consumer is the **website** (site search); the editor finds docs to edit via `content`-structured lists on the working branch, not search.
_Avoid_: treating search results as live content (re-verify via `content`); full-text search over unpublished/working content in v4 (deferred); making search mandatory

**`media` capability**:
The singleton capability for asset storage + retrieval (images, files). A provider — **TinaCloud** (its store + image CDN), or s3 / Cloudinary / local / self-hosted — contributes a **Client segment** (the picker/manager UI) and a **Server segment** (`upload`/`list`/`delete`, holding secrets, on the **Backend**). **Dual-consumer** like `content`: the editor *picks and uploads*, the website *renders*. An **`image` field** is a **Field plugin** that `dependsOn: ['media']` and stores a **media-root-relative path** (a JSON-native string like `posts/hero.jpg`) — the provider **resolves path → URL** at render (`resolveUrl`), so swapping providers never rewrites content. Operations: `upload(file, folder?) → path`, `list(folder, {cursor,limit})`, `delete(path)`, `resolveUrl(path, transform?)`. **Uploads use presigned *direct* upload** (a JSON RPC authorizes; bytes go straight to the store) with **multipart-through-Backend as fallback** — so the general **Capability RPC** transport stays JSON-only; binary is media's concern. **Transforms** (resize/format) are an *optional* provider feature (TinaCloud CDN); others gracefully return the original.
_Avoid_: storing absolute provider URLs or opaque IDs in content (store a portable path); adding a binary mode to general **Capability RPC** (binary is media-specific)

**Schema**:
The content model authored in `defineConfig` — the set of **Collections** and their field definitions. The single **core artifact** (compiled to **`tina-lock.json`**) that fans out to four consumers: the **Form** layer (which **Field plugins** render, selected by each field's `type`), the **`content` capability**'s generated GraphQL API + TS types, **serialization** (how fields map into content files), and **validation**. It is build-time config, **not** runtime data — an editor cannot change it (cf. **Role**).
_Avoid_: treating the schema as a Data-Layer-internal detail — the client reads it directly to build forms

**`tina-lock.json`** (compiled schema):
The committed, compiled form of the **Schema**, read by the client, the **Data Layer**, and **TinaCloud** (which validates against it *without* running the user's build). It captures the *user's* schema and references built-in primitives **by `type` key + a contract version** — it does **not** inline Tina's primitive definitions, which are resolved at build from the installed **Field plugins**. So non-breaking primitive updates need no lock change; a *breaking* primitive change bumps its **contract version**, and a **build-time check** (the lock is committed, so it can lag the installed package) detects the mismatch and prompts an explicit migration (`tina migrate`) instead of breaking silently. (User-side breaking changes — e.g. a newly-required field on existing docs — are separately handled by hydration: default/empty + a validation flag, never a crash. See **Unknown field**.)
_Avoid_: baking primitive field definitions into the lock (couples it to Tina's internals → silent breakage)

**Collection**:
The organizing unit of the **Schema**: a named set of **Documents** sharing a shape, mapped to content files by `path` (folder) + `format` (md/mdx/json/yaml/toml) + `match` (glob). Its field definitions (`name`, `type` → a **Field plugin**, `label`, `required?`, options, `ui` hints, default) drive forms, generated GraphQL, serialization, and validation. **Multiplicity is its own `type: 'list'` composite type — not a `list: true` modifier** (v3); a `list` declares its items with exactly one of `fields` (homogeneous object — `type` decides cardinality, `fields` describes the shape, no `_template` on disk), `templates` (polymorphic blocks — `_template` discriminator on disk), or `of` (scalars). Item field plugins are always single-valued; the list plugin owns add/remove/reorder. For markdown formats, scalar fields map to **frontmatter** and one rich-text field is the document **body** (`isBody`).
_Avoid_: one collection spanning multiple formats/folders — one collection = one `path` + one `format`

**Document**:
A single content file — an instance of a **Collection**. Its **identity is its path** (`content/posts/hello.md`); the file *is* the document (git-native, no extra id state). A **reference field** points at a document by collection + path. In-CMS rename/move is a **reference-aware** structural operation (it updates referrers, like ADR-010's atomic actions); out-of-band renames (hand/git) can dangle references and are caught by the dev/CI audit, not by a crash. Every document also carries **system metadata** — `createdAt` / `updatedAt` / `lastAuthor` — that is **always present** and is **not** a content field: derived from **git** (log + blame) in production, **fs mtime** locally. List views sort/filter on it, and the **default collection-list sort is recently-updated-first** so newly-created docs surface instead of getting lost among thousands.
_Avoid_: a separate machine id for documents (the path is the identity); silent reference breakage on rename; relying on a content field for created/updated (system metadata is git-derived and guaranteed)

**Template**:
A **named fieldset** — the single content-shape primitive. *Everything that holds fields is a template*: a single-shape **Collection** is one, a polymorphic collection lists several, an `object`/`list`'s item shape(s) are templates, and a rich-text **Embedded field** is a template instance. "Inline" vs "shared" is only *where it is defined* — a template is always named, so it can be written inline for a one-off or lifted to a shared registry for reuse with no model change and no content migration. A polymorphic position records which template each value is via a `_template` discriminator; a homogeneous position needs none.
_Avoid_: treating blocks / objects / collections as separate shape-concepts — they are all named templates

**Format adapter**:
The per-`format` component (md/mdx/json/yaml/toml) that maps a **Document**'s JSON content value ↔ its file on disk — **the only serialization layer** (there are no per-field codecs; field **content values** are JSON-native, interpreted client-side). It owns the frontmatter/body split and, for md/mdx, the rich-text **body**↔markdown transform plus MDX-embed (`<Cta/>`) rendering. Built-in adapters are first-party and run everywhere, **including TinaCloud**. A **custom file format** is a custom adapter — the *one* serialization case that is **self-hosted-only** (TinaCloud's surface is fixed and first-party; arbitrary formatters can't run in its infra).
_Avoid_: per-field serialization "codecs" — serialization is the adapter's job; fields keep JSON-native values

**Execution boundary** (what runs where):
The rule governing *where* extension code may run, forced by **TinaCloud** running **no plugin code**. Three locations: the **Client** (UX only, never enforcement); the **Backend** (the user's app server — runs plugin **Server segments**, holds secrets, enforces; present even when TinaCloud is the **Data Layer**, given a server runtime); and the **Data Layer** (**Self-Hosted**: user-controlled, may run custom code/adapters; **TinaCloud**: fixed, first-party, runs nothing custom). **First-party + declarative/serializable** artifacts (`tina-lock.json`, declarative validation rules, built-in **Format adapters**) run **everywhere, including inside TinaCloud**. **Custom code** runs only on the Client (UX) or the Backend (enforcement) — never inside TinaCloud. The strictly **self-hosted-only** cases are logic that must run *inside the Data Layer*: a custom **Format adapter** (file write), or enforcement that must survive writes made directly to the Data Layer.
_Avoid_: conflating the **Backend** with the **Data Layer** — custom server logic runs on the Backend (TinaCloud users included), not inside TinaCloud

**`tina doctor`** (the audit):
The static CLI audit that finds errors **without running the app** — it reads the **Schema** + **`tina-lock.json`** + content files + installed plugins (≈ building the **Local Data Layer** index) and reports. It is a **superset of build**: build is the *blocking* code/schema gate (schema compiles, lock matches installed plugins' contract versions, every `type` resolves to a **Field plugin**, queries have indexes, no **Capability conflict**), while `doctor` *also* audits **content** — drift / **Unknown fields**, dangling **Reference fields**, parse errors, required-but-empty — and runs **full validation** (declarative *and* custom; it runs in Node, not **TinaCloud**, so custom validators execute) across *every* document. Findings have configurable severity (error/warn/off); `doctor` **can gate CI** (non-zero exit) but need not, while the **deploy build never blocks on content** (only on code/schema).
_Avoid_: hard-failing the *deploy build* on content drift (the brick-on-drift rejected in ADR-012); assuming `doctor` needs a running server

**UI slot**:
A named, first-party region of the **Admin UI** that plugins contribute chrome into (`shell.statusBar`, `form.panel`, `collectionList.itemBadge`, `documentActions`, …). Shares the "render a component you don't own, resolved by key" mechanism with **Component resolution**, but the **cardinality is inverted**: a slot is **fan-in** — many contributions *stack* (no **Capability conflict**), ordered *explicitly* (never by load order). Each slot hands contributions a **typed context** (the document, the `formId`, …). Contributions live in a plugin's **Client segment**, are composed **at boot** (not lazy like field components), and are **permission-gated** (UX only, see **Permission**) and **dependency-conditional** (a `draft` badge renders only if a `draft` provider is installed). The slot vocabulary is a fixed, typed, codegen-aggregated set owned by core.
_Avoid_: treating a slot as a **Keyed capability** (slots are many-contributor, not one-per-key); third-party slot *definitions* in v4

**Document lifecycle hooks**:
Events a plugin taps around a document's *edit/save* lifecycle — `onChange`, `beforeSave`, `afterSave` — distinct from *plugin* lifecycle (`onInit`/`onDestroy`, once per plugin). `onChange`/`afterSave` are **observers** (side effects: draft snapshot, audit, cache bust); `beforeSave` may **transform** (auto-fields, normalize) or **veto** (validation, gate) the save, running as an ordered async pipeline. Split by the client-UX/server-enforcement rule (see **Permission**): a client `onChange` rides Zustand `subscribe` (the store is client-only), while authoritative `beforeSave` enforcement runs in the **Server segment**'s save path. **Publish-lifecycle** reactions are *out of scope* — committed events use **TinaCloud** webhooks (or a **Self-Hosted Data Layer**'s own mechanism), not in-process plugin hooks.
_Avoid_: relying on a *client* `beforeSave` for enforcement (bypassable); expecting plugin publish hooks on **TinaCloud** (it runs no plugin code)

**`auth` capability**:
The capability that authenticates editors and yields their identity + roles. **Provider-agnostic** — Tina core implements no auth and stores nothing; it consumes a **Session** via `getSession(request) → { identity, roles } | null`, the one primitive each verifier needs. Providers (**TinaCloud**, Auth0, Clerk, GitHub, self-hosted) drive **login** (`login`/`logout`, the provider's **Client segment**) and issue a verifiable credential. **Verification** is either **declarative JWT/JWKS** (a signature check against configured keys — runs everywhere, *including* TinaCloud) or **custom-code** (opaque tokens / session lookup — **Backend**/self-hosted only, never inside TinaCloud → implies a **Self-Hosted Data Layer** for content-write auth). A **CORS-like origin allowlist** (registered sites — TinaCloud dashboard / self-hosted config) gates the auth surface. See **Role** / **Permission** for policy.
_Avoid_: Tina implementing auth or storing sessions; putting auth / origin config in `defineConfig` (it is operational/runtime data)

**Session**:
The provider-issued credential an editor holds after login — a **bearer token** (typically a signed **JWT**) carrying **identity + roles**, sent in the `Authorization` header to **both** the **Backend** (authenticates **Capability RPC**) *and* the **Data Layer** (authenticates the direct content write, ADR-018). Held **in memory** (XSS mitigation), short-lived, refreshed via the provider. Verified through the **`auth` capability**'s `getSession`. Tina **stores nothing** — roles are read from the session per request (ADR-008).
_Avoid_: httpOnly cookies as the primary credential (it must cross origins to the Data Layer); persisting the token in localStorage

**Permission**:
The unit of authorization (e.g. `media:delete`, `content:publish`). Plugins *declare* the permissions they introduce; codegen aggregates them into a typed union. Operations (`protectedOp({ permission })`) and whole plugins (`requires: { permission }`) gate on permissions — never on hardcoded role names. A **Capability RPC** call is **secure by default**: the transport authenticates before dispatch, and the only opt-out is the greppable `publicOp()` wrapper.
_Note_: client-side permission checks are **UX only** (hide/disable UI); the **server transport is the sole enforcement** and never trusts the client.

**Role**:
A named bundle of **Permissions**. Roles and user→role assignments are *runtime data* owned by the `auth` provider — **not** tina config (they change without a redeploy). Tina core consumes a user's roles from the session and stores nothing. **TinaCloud** manages `editor`/`admin` out of the box; custom roles require an `auth` provider that can assign them. RBAC data is operational, not content, so it is **not** stored in git.
_Avoid_: putting role definitions or assignments in `defineConfig`

## Relationships

- An **Admin UI** reads/writes content through exactly one **Data Layer** at a time (**TinaCloud**, **Self-Hosted**, or **Local**)
- Plugin **Server segments** run on the **Backend** (the user's app server) — *not* on **TinaCloud** and *not* in the **Data Layer**
- A **Client segment** calls a **Server segment** via **Capability RPC**; it reads other client slices by namespace (`get().auth.user`)
- Git operations (branch, commit, publish) live *inside* a **Data Layer** implementation — they are not a concern of the **Admin UI**
- A **Plugin** may `dependOn` a set of **Capabilities** and `provide` a set of **Capabilities**; the runtime initializes plugins in dependency order
- A composite **Field plugin** renders nested fields by **Component resolution** through the `field` registry — it `dependsOn` the *capability*, not the specific child plugins (those come from the user's content schema, resolved at render time)

## Flagged ambiguities

- "module" vs "plugin" — ADR-002 declared everything-is-a-plugin while ADR-005 introduced a separate module system. **Resolved:** the module concept is removed; plugins carry their own `dependsOn`/`provides`/lifecycle. ADR-005 superseded; ADR-002 absorbs lifecycle + dependency resolution.
- "Backend" = TinaCloud/data-layer vs "Backend" = the user's server — **Resolved:** "Backend" means the *user's app server* where **Server segments** run. The GraphQL content API is the **Data Layer**; **TinaCloud** is the hosted Data Layer (+ image CDN), not the user's backend and not a code host.
- "the backend creates a Zustand slice" — **Resolved:** category error. Zustand is **client-only** (browser/session/UI state). A plugin's *client segment* owns its slice; its *server segment* exposes operations the slice calls via **Capability RPC**. Slices are composed once at boot from the static plugin list (not mutated at runtime), mounted namespaced under their capability key — which is also why `store.addMiddleware()`-after-create and runtime `persist` gaps (the old ADR-003 sketch) are non-issues. (**Refined for fields:** field plugins are the exception — they are *per-instance*, created and destroyed at runtime as the editor navigates and arrays grow, so they own no boot-time slice. The **Form** is core state they consume by **Field address**.)
- The architecture-overview data-flow diagram shows the Zustand store talking directly to "Git Operations". **Resolved:** misleading — the store reads/writes content via the **Data Layer**; git is an implementation detail inside the Data Layer. (Diagram + ADR-004 need revisiting.)
- "in-memory / ephemeral" local — **Resolved:** the *query index* is in-memory, but writes persist to the real on-disk content files. Default for local: write files and leave them as uncommitted working-tree changes (the dev's normal git flow commits); auto-commit/branch/publish belong to the production Data Layers.
- Static-only deployments (no server runtime) and **Server segments** — **TBD:** server segments require a host; a static-export site has none. Open: do full-stack plugins simply require a server runtime, or is there a hosting story for static sites? (Q2 of the rename discussion, unanswered.)

## Example dialogue

> **Dev:** "My `s3-media` plugin uploads to S3 — does that run on TinaCloud?"
> **Architect:** "No. Its **Server segment** runs on your **Backend** — your Next server's API routes. **TinaCloud** is just the **Data Layer** for your content; it never runs your plugin code."
> **Dev:** "So how does the media picker in the UI call it?"
> **Architect:** "**Capability RPC** — `server.media.upload(...)` from the **Client segment**. The types come across by `import type`, so the call is fully typed and none of the AWS code ends up in the browser."
</content>
