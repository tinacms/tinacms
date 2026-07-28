// The schema compile (ADR-016): defineConfig's schema in, tina-lock.json out.
//
// Pure and node-safe — it reads manifests, never client segments, which is what
// FieldProvision on the manifest buys. Everything that needs the content model
// without running the user's build reads the artifact: the client to build forms,
// the Data Layer for its generated API, and TinaCloud to validate.

import type { ResolvedConfig, TinaSchema } from '../config';
import { invariant } from '../core/invariant';
import type { FieldProvision, PluginManifest } from '../core/plugin';
import type { CollectionSchema } from '../core/schema/types';

// The artifact's own format version, bumped when the file's shape changes — distinct
// from the per-primitive contract versions it pins.
export const LOCK_VERSION = 1;

export interface TinaLock {
  version: number;
  schema: TinaSchema;
  /**
   * The field types the schema uses, each pinned to its plugin's contract version.
   * Definitions are deliberately NOT inlined (ADR-016 §2): they resolve at build
   * from the installed plugins, so a non-breaking primitive change leaves the lock
   * alone and it churns only when the user's schema or a contract version does.
   *
   * Only types the schema actually uses appear — installing an unrelated field
   * plugin should not produce a lock diff.
   */
  primitives: Record<string, number>;
}

const fieldProvisionsOf = (
  plugins: PluginManifest[]
): Map<string, FieldProvision> => {
  const provisions = new Map<string, FieldProvision>();
  for (const plugin of plugins) {
    if (plugin.field) provisions.set(plugin.field.type, plugin.field);
  }
  return provisions;
};

const usedFieldTypes = (collections: CollectionSchema[]): string[] => [
  ...new Set(
    collections.flatMap((collection) =>
      collection.fields.map((field) => field.type)
    )
  ),
];

export const compileSchema = (config: ResolvedConfig): TinaLock => {
  const provisions = fieldProvisionsOf(config.plugins);
  const primitives: Record<string, number> = {};
  // Sorted so the artifact is byte-stable across runs: an unordered object would
  // diff on nothing but iteration order, and this file is committed.
  for (const type of usedFieldTypes(config.schema.collections).sort()) {
    const provision = provisions.get(type);
    // The blocking build gate (ADR-020): a field type nothing renders is a broken
    // schema, and it fails here rather than as a blank field in the editor.
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
  // The lock predates a change to the user's schema or the installed field set, but
  // every contract version it pins still matches: regenerate, don't stop the build.
  | { status: 'stale'; message: string }
  // A primitive changed shape under a committed lock. Silently resolving it is the
  // failure mode ADR-016 exists to prevent, so this stops with a migration path.
  | { status: 'incompatible'; message: string };

/**
 * Compare a committed lock against what the installed plugins would compile to.
 * The lock is committed, so it can lag the package — this is what turns that lag
 * into a warning or an explicit migration instead of a silent break (ADR-016 §3).
 */
export const checkLock = (
  lock: TinaLock,
  config: ResolvedConfig
): LockCheck => {
  const fresh = compileSchema(config);
  const changed = Object.entries(fresh.primitives).filter(
    ([type, version]) =>
      lock.primitives[type] !== undefined && lock.primitives[type] !== version
  );
  if (changed.length > 0) {
    return {
      status: 'incompatible',
      message:
        `tina-lock.json pins ${changed
          .map(
            ([type, version]) =>
              `"${type}" at contract version ${lock.primitives[type]}, but the installed plugin is version ${version}`
          )
          .join('; ')}. ` +
        'That field type changed shape. Run `tina migrate` to update your content ' +
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
