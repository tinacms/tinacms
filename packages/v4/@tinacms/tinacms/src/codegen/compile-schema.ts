import type { ResolvedConfig, TinaSchema } from '../config';
import { fieldConflictError, overridesFieldKey } from '../core/field/registry';
import { hookProvidersOf } from '../core/form/hooks';
import { invariant } from '../core/invariant';
import { composeOverridableRegistry } from '../core/overridable-registry';
import { isRecord } from '../utils/is-record';
import { scalarItemOf } from '../core/schema/children';
import type { FieldProvision, PluginManifest } from '../core/plugin';
import type {
  CollectionSchema,
  FieldSchema,
  TemplateSchema,
} from '../core/schema/types';
import {
  overridesValidatorKey,
  validatorConflictError,
} from '../core/validator/registry';
import { type PackageVersion, packageVersion } from './package-version';

export const LOCK_VERSION = 5;

export interface TinaLock {
  version: number;
  schema: TinaSchema & { version: PackageVersion };
  primitives: Record<string, number>;
}

const fieldProvisionsOf = (
  plugins: PluginManifest[]
): Map<string, FieldProvision> =>
  composeOverridableRegistry(
    plugins.flatMap((plugin) =>
      plugin.field
        ? [
            {
              key: plugin.field.type,
              value: plugin.field,
              isOverride: overridesFieldKey(plugin, plugin.field.type),
            },
          ]
        : []
    ),
    fieldConflictError
  );

const registeredValidatorsOf = (plugins: PluginManifest[]): Set<string> =>
  new Set(
    composeOverridableRegistry(
      plugins.flatMap((plugin) =>
        (plugin.validators ?? []).map((name) => ({
          key: name,
          value: plugin,
          isOverride: overridesValidatorKey(plugin, name),
        }))
      ),
      validatorConflictError
    ).keys()
  );

const templateFieldTypesIn = (templates: TemplateSchema[] = []): string[] =>
  templates.flatMap((template) => fieldTypesIn(template.fields ?? []));

const ofAsList = (field: FieldSchema): FieldSchema[] => {
  const of = scalarItemOf(field);
  return of ? [of] : [];
};

const fieldTypesIn = (fields: FieldSchema[]): string[] =>
  fields.flatMap((field) => [
    field.type,
    ...templateFieldTypesIn(field.templates),
    ...fieldTypesIn(ofAsList(field)),
  ]);

const usedFieldTypes = (collections: CollectionSchema[]): string[] => [
  ...new Set(
    collections.flatMap((collection) => fieldTypesIn(collection.fields))
  ),
];

const validatorNamesIn = (fields: FieldSchema[]): string[] =>
  fields.flatMap((field) => [
    ...(field.validators ?? []).map((ref) => ref.name),
    ...(field.templates ?? []).flatMap((template) =>
      validatorNamesIn(template.fields ?? [])
    ),
    ...validatorNamesIn(ofAsList(field)),
  ]);

const usedValidators = (collections: CollectionSchema[]): string[] => [
  ...new Set(
    collections.flatMap((collection) => validatorNamesIn(collection.fields))
  ),
];

const registeredHooksOf = (plugins: PluginManifest[]): Set<string> =>
  new Set(hookProvidersOf(plugins).keys());

const usedHooks = (collections: CollectionSchema[]): string[] => [
  ...new Set(
    collections.flatMap((collection) =>
      (collection.hooks ?? []).map((ref) => ref.name)
    )
  ),
];

// v3 field options that v4 does not have, with what replaces each (ADR-029).
const DROPPED_OPTIONS: Record<string, string> = {
  ui: 'v4 has no `ui` wrapper: put description, defaultValue, hidden, itemLabel and picker at the top level of the field',
  component:
    'register a field plugin for the widget; the field type picks the plugin that renders it',
  parse:
    'declare `parse` on the field plugin, or use a collection hook for a one-off transform',
  format:
    'declare `serialize` on the field plugin, or use a collection hook for a one-off transform',
  validate: 'attach named validators with `validators`',
  min: 'use the `min()` validator in `validators`',
  max: 'use the `max()` validator in `validators`',
};

// Every field node under `fields`, following `fields`, `templates` and `of`.
const nodesIn = (fields: unknown[] = []): Record<string, unknown>[] =>
  fields.flatMap((field) => {
    if (!isRecord(field)) return [];
    const templates = Array.isArray(field.templates) ? field.templates : [];
    return [
      field,
      ...nodesIn(Array.isArray(field.fields) ? field.fields : []),
      ...nodesIn(
        templates.flatMap((template) =>
          isRecord(template) && Array.isArray(template.fields)
            ? template.fields
            : []
        )
      ),
      ...nodesIn(isRecord(field.of) ? [field.of] : []),
    ];
  });

const assertNoDroppedOptions = (collections: CollectionSchema[]): void => {
  for (const collection of collections) {
    for (const node of nodesIn(collection.fields)) {
      for (const [option, replacement] of Object.entries(DROPPED_OPTIONS)) {
        invariant(
          !(option in node),
          'schema-dropped-option',
          `The field "${String(node.name)}" in collection "${collection.name}" sets "${option}", which v4 does not have: ${replacement}.`
        );
      }
    }
  }
};

// Each `of` item row would repeat the help text, or show a row with no editor.
const assertScalarItemsAreVisible = (collections: CollectionSchema[]): void => {
  for (const collection of collections) {
    for (const node of nodesIn(collection.fields)) {
      if (!isRecord(node.of)) continue;
      for (const option of ['hidden', 'description']) {
        invariant(
          !(option in node.of),
          'schema-scalar-item-option',
          `The array "${String(node.name)}" in collection "${collection.name}" sets "${option}" on its "of" field. Set it on the array itself.`
        );
      }
    }
  }
};

export const compileSchema = (config: ResolvedConfig): TinaLock => {
  assertNoDroppedOptions(config.schema.collections);
  assertScalarItemsAreVisible(config.schema.collections);
  const provisions = fieldProvisionsOf(config.plugins);
  const primitives: Record<string, number> = {};
  for (const type of usedFieldTypes(config.schema.collections).sort()) {
    const provision = provisions.get(type);
    invariant(
      provision,
      'schema-unknown-field-type',
      `The schema uses the field type "${type}", but no installed plugin provides ` +
        'the `field` capability at that type.'
    );
    primitives[type] = provision.contractVersion;
  }
  const registered = registeredValidatorsOf(config.plugins);
  for (const name of usedValidators(config.schema.collections).sort()) {
    invariant(
      registered.has(name),
      'schema-unknown-validator',
      `The schema uses the validator "${name}", but no installed plugin ` +
        'registers it.'
    );
  }
  const registeredHooks = registeredHooksOf(config.plugins);
  for (const name of usedHooks(config.schema.collections).sort()) {
    invariant(
      registeredHooks.has(name),
      'schema-unknown-hook',
      `The schema uses the form hook "${name}", but no installed plugin ` +
        'registers it.'
    );
  }
  return {
    version: LOCK_VERSION,
    schema: { ...config.schema, version: packageVersion() },
    primitives,
  };
};

export type LockCheck =
  | { status: 'current' }
  | { status: 'unreadable'; message: string }
  | { status: 'stale'; message: string }
  | { status: 'incompatible'; message: string };

export const checkLock = (
  lock: TinaLock,
  config: ResolvedConfig
): LockCheck => {
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
        'tina-lock.json is out of date with your schema, your installed plugins, ' +
        'or your tinacms version. Regenerating it.',
    };
  }
  return { status: 'current' };
};
