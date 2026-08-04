# TinaCMS v4

Instructions for agents working under `packages/v4/`.

## Read first

- [`README.md`](./README.md) — the package map: what v4 releases, publish
  rules, and why the CLI stays out of the build pipeline.
- The full v4 architecture spec lives in a separate repo:
  [tinacms/tinacmsv4-docs](https://github.com/tinacms/tinacmsv4-docs)
  (start at `CONTEXT.md`, then the ADR set).
- The source of truth for the final shape of v4 live in `@tinacms/tinacms/_docs/`
  (architecture, plugins, field plugins, per-field specs).

## Packages in this directory

| Package | Path | What it is |
|---|---|---|
| `@tinacms/tinacms` | `@tinacms/tinacms` | The v4 runtime + CLI in one package. `private: true`, `4.0.0-alpha.x`. Subpath exports for `/react`, `/client`, `/server`, `/local-data-layer`, and framework adapters (`/adapters/next`, `/express`, `/astro`, `/hono`). |
| `@tinacms/rich-text` | `@tinacms/rich-text` | Plate rich-text editor. A value contract separates the editor from the storage format — keep that boundary (see `src/boundary.test.ts`). |
| `@tinacms/ui` | `@tinacms/ui` | Shared UI components from shadcn/ui. |

## Commands (run inside the package directory)

```
pnpm dev        # @tinacms/tinacms only — vite playground (playground/)
pnpm test       # vitest
pnpm test:e2e   # @tinacms/tinacms only — playwright
pnpm types      # tsc + tsconfig.test.json
pnpm build      # tinacms-scripts build
pnpm codegen    # @tinacms/tinacms only — regenerates playground tina-lock
```

The playground (`@tinacms/tinacms/playground/`) is the manual test bed —
use it to verify runtime/editor changes in a browser.

## Hard rules

- **The `tinacms` bin only writes files a person commits** (`init`,
  `codegen`). It must never wrap a process, open a port, or produce a build
  artifact. No `dev` or `build` commands. (See "The CLI stays out of the
  pipeline" in `README.md`.)
- **`tina-lock.json` is committed, not built.** CI never runs the bin;
  `codegen --check` is an opt-in drift guard.
- **Don't touch v3 packages for v4 features.** v3 (`packages/tinacms`,
  `packages/@tinacms/*`) is in support mode: bug and security fixes only.
- **Don't move level adapters or external integrations into this repo** —
  the README lists where they live.
- **shadcn components:** add or update via
  `pnpm dlx shadcn@latest add <component>` run in `@tinacms/ui/` — don't
  hand-write new primitives that shadcn already provides.

## Types

- **No `any`.** Not as an annotation, not as a cast. Use `unknown` and
  narrow, or write the real type. `@tinacms/tinacms/src` has zero `any` —
  keep it that way. (The `any`s in `rich-text/src/plate` are inherited Plate
  code; do not add more, and remove them when you touch those files.)
- **Identifiers get a concrete branded type, not a bare `string`.** Use
  `Brand` from `core/brand.ts` and give each ID a `to*` constructor that
  validates at the boundary — the cast lives in the constructor and nowhere
  else:

  ```ts
  // core/brand.ts
  export type Brand<T, K extends string> = T & { readonly __brand: K };

  // core/field/address.ts
  export type FieldAddress = Brand<string, 'FieldAddress'>;

  export const toFieldAddress = (path: string): FieldAddress => {
    invariant(path.length > 0, 'field-address-empty', '...');
    return path as FieldAddress;
  };
  ```

  Existing examples: `FormId` (`form/form-store.ts`), `FieldAddress`
  (`core/field/address.ts`), `ResolvedConfig` (`config.ts`). A branded ID
  cannot be swapped for another string by accident — a `FormId` does not
  pass where a `FieldAddress` is expected.

## Comments & prose (ASD-STE100)

All v4 prose — code comments, `_docs/`, READMEs — follows **Simplified
Technical English (ASD-STE100)**. The `README.md` in this directory is the
reference for the register.

The STE rules that matter most here:

- **Active voice, present tense.** "The bin writes files", not "files are
  written by the bin".
- **One instruction or one fact per sentence.** Keep sentences short
  (about 20 words or fewer).
- **One word, one meaning.** Use the same term for the same thing every
  time — a document is a document, not a "page", "entry", or "record"
  depending on the file.
- **No filler.** No "simply", "just", "note that", "in order to".

Comment policy (a prior cleanup pass established this):

- **Only comment traps, invariants, and ADR pointers.** Strip comments that
  restate the code.
- Reference ADRs by number when a decision explains the code:

  ```ts
  // TODO(ADR-008 §3): type `permissions` against codegen's Permission union once it lands.

  // TODO: move this schema validation to defineConfig (ADR-024) so every
  ```

## Error handling

- **Caught values are `unknown` — never assume they're an `Error`.** Name the
  caught variable `cause` (the codebase convention), narrow with
  `instanceof Error`, and fall back to `String(cause)`:

  ```ts
  try {
    await save(document);
  } catch (cause) {
    if(cause instanceof Error){
      logError(cause.message)
    }else{
      logError(String(cause))
    }
  }
  ```

- **Distinguish known failures with custom error classes**, not by matching
  message strings. Extend `Error` and check with `instanceof` (see `RpcError`
  in `src/rpc/proxy.ts`, `RequestBodyTooLargeError` in
  `local-data-layer.vite.ts`):

  ```ts
  if (cause instanceof RequestBodyTooLargeError) {
    res.statusCode = 413;
  }
  ```

## React / JSX

- **Don't use `&&` for conditional rendering.** Use a ternary with an explicit
  `null` instead:

  ```tsx
  // ❌ Bad — renders "0" when items is empty, leaks falsy values into the DOM
  {items.length && <List items={items} />}

  // ✅ Good
  {items.length > 0 ? <List items={items} /> : null}
  ```

## Accessibility

- **The row of a field gives the field its name.** `admin/document-form.tsx`
  renders the label and points it at the control with `htmlFor`. A field widget
  renders `id={address}`, and no label of its own.

- **Never put `aria-label` on a field widget.** `aria-label` outranks a
  `<label>` element. It replaces the label that an author wrote with the name of
  the field, so a field labelled "SEO description" announces as `seoDesc`.

- **An icon button takes `aria-label`.** The rule above is about field widgets,
  which get their name from the row. A toolbar button has no `<label>` element
  and shows only an icon, so `aria-label` is the correct tool. If the button
  also shows text, the `aria-label` must hold that text (WCAG 2.5.3). Make each
  icon in the button decorative with `aria-hidden='true'`.

- **A widget that `htmlFor` cannot reach takes `aria-labelledby`.** A descriptor
  with `metadata.labelable: false` has no input for the label to point at. The
  row gives its label an id, and the widget reads that id. The rich-text field
  is the example.

- **Assert the accessible name, not the label text.** Use
  `getByRole(role, { name })`. Use `toHaveAccessibleName` for a control that
  maps to no role, such as `datetime-local`. A `getByLabelText` query passes on
  an `aria-label` that a screen reader announces wrongly, so it cannot see this
  class of defect.

- **An error message carries `role='alert'`.**
