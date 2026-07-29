// The schema compile (ADR-016). It takes the schema from defineConfig, and it writes
// tina-lock.json.
//
// It is pure, and it runs in Node. It reads the manifests, and never the client
// segments. FieldProvision on the manifest makes that possible. Every consumer that
// needs the content model, and cannot run the build of the user, reads this artifact.
// The client reads it to build the forms. The data layer reads it for its generated API.
// TinaCloud reads it to validate.

import type { ResolvedConfig, TinaSchema } from '../config';
import { invariant } from '../core/invariant';
import type { FieldProvision, PluginManifest } from '../core/plugin';
import type {
  CollectionSchema,
  FieldSchema,
  TemplateSchema,
} from '../core/schema/types';

// The format version of the artifact. It increases when the shape of the file changes.
// It is not the contract version of a primitive, which the file also holds.
export const LOCK_VERSION = 4;

export interface TinaLock {
  version: number;
  schema: TinaSchema;
  /**
   * The field types that the schema uses. Each one holds the contract version of its
   * plugin. The file does not hold the definitions (ADR-016 §2). They resolve at build
   * time from the installed plugins. A change to a primitive that breaks nothing
   * therefore leaves this file alone. The file changes only when the schema of the
   * user changes, or when a contract version changes.
   *
   * Only the types that the schema uses appear here. An unrelated field plugin makes
   * no change to this file.
   */
  primitives: Record<string, number>;
}

const fieldProvisionsOf = (
  plugins: PluginManifest[]
): Map<string, FieldProvision> => {
  const provisions = new Map<string, FieldProvision>();
  for (const plugin of plugins) {
    if (!plugin.field) continue;
    // Last-wins would pin whichever plugin happened to be last, for a config the
    // field registry refuses to boot at all. Same rule, same point of failure.
    invariant(
      !provisions.has(plugin.field.type),
      'schema-duplicate-field-type',
      `Two plugins provide the \`field\` capability at type "${plugin.field.type}". ` +
      'Declare `overrides: [{ capability: "field", key }]` to replace a built-in.'
    );
    provisions.set(plugin.field.type, plugin.field);
  }
  return provisions;
};

// A field whose schema node carries its own templates (rich-text embeds) nests further
// field types inside it. They render like any other field, so they need the same
// build gate and the same contract pin — reading only the top level let them through
// both. A nested field can carry templates of its own, so this walks the whole tree.
const templateFieldTypesIn = (templates: TemplateSchema[] = []): string[] =>
  templates.flatMap((template) =>
    (template.fields ?? []).flatMap((nested) => [
      ...(nested.type ? [nested.type] : []),
      ...templateFieldTypesIn(nested.templates),
    ])
  );

const fieldTypesIn = (fields: FieldSchema[]): string[] =>
  fields.flatMap((field) => [
    field.type,
    ...templateFieldTypesIn(field.templates),
  ]);

const usedFieldTypes = (collections: CollectionSchema[]): string[] => [
  ...new Set(
    collections.flatMap((collection) => fieldTypesIn(collection.fields))
  ),
];

export const compileSchema = (config: ResolvedConfig): TinaLock => {
  const provisions = fieldProvisionsOf(config.plugins);
  const primitives: Record<string, number> = {};
  // Sort the types, so that the artifact holds the same bytes at each run. This file
  // is committed, and an unsorted object would change with the iteration order alone.
  for (const type of usedFieldTypes(config.schema.collections).sort()) {
    const provision = provisions.get(type);
    // The build gate (ADR-020). A field type that no plugin renders is a broken
    // schema. It fails here, and not as an empty field in the editor.
    invariant(
      provision,
      'schema-unknown-field-type',
      `The schema uses the field type "${type}", but no installed plugin provides ` +
      'the `field` capability at that type.'
    );
    primitives[type] = provision.contractVersion;
  }
  return { version: LOCK_VERSION, schema: config.schema, primitives };
};

export type LockCheck =
  | { status: 'current' }
  // The lock was written in a format this package does not know. It is newer, not
  // stale — rewriting it would silently downgrade a committed file.
  | { status: 'unreadable'; message: string }
  // The lock is older than a change to the schema, or to the installed field set.
  // Every contract version in it still matches. Write the lock again, and do not stop
  // the build.
  | { status: 'stale'; message: string }
  // A primitive changed its shape under a committed lock. A silent repair is the
  // failure that ADR-016 prevents, so this stops and gives a migration path.
  | { status: 'incompatible'; message: string };

/**
 * Compare a committed lock with the output that the installed plugins would compile.
 * The lock is committed, so it can be older than the package. This function turns that
 * difference into a warning, or into a migration. It does not let it become a silent
 * break (ADR-016 §3).
 */
export const checkLock = (
  lock: TinaLock,
  config: ResolvedConfig
): LockCheck => {
  // A lock from a newer tinacms cannot be compared field by field: it would differ only
  // by stringify, read as merely stale, and be rewritten in the older format.
  // LOCK_VERSION existed and nothing read it. A lock from an older tinacms is the
  // opposite case — this package can write it again, so it falls through to `stale`.
  if (lock.version > LOCK_VERSION) {
    return {
      status: 'unreadable',
      message:
        `tina-lock.json is version ${lock.version}, and this version of tinacms ` +
        `writes version ${LOCK_VERSION}. Upgrade tinacms rather than regenerating ` +
        'the lock, which would downgrade a file your team has committed.',
    };
  }
  const fresh = compileSchema(config);
  // Object.create(null): a lock is parsed JSON, so a `constructor` or `toString` key
  // in `primitives` would otherwise resolve against Object.prototype and compare as a
  // pinned version that was never written.
  const pinned: Record<string, number> = Object.assign(
    Object.create(null),
    lock.primitives
  );
  const changed = Object.entries(fresh.primitives).filter(
    ([type, version]) => pinned[type] !== undefined && pinned[type] !== version
  );
  if (changed.length > 0) {
    return {
      status: 'incompatible',
      message:
        `tina-lock.json pins ${changed
          .map(
            ([type, version]) =>
              `"${type}" at contract version ${pinned[type]}, but the installed plugin is version ${version}`
          )
          .join('; ')}. ` +
        'That field type changed shape. Run `tinacms migrate` to update your content ' +
        'and the lock together.',
    };
  }
  if (JSON.stringify(lock) !== JSON.stringify(fresh)) {
    return {
      status: 'stale',
      message:
        'tina-lock.json is out of date with your schema and installed plugins. ' +
        'Regenerating it.',
    };
  }
  return { status: 'current' };
};
